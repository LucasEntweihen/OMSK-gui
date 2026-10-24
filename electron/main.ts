import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";
import * as http from "node:http";
import type { AddressInfo } from "node:net";

let mainWindow: BrowserWindow | null = null;
let serverInstance: http.Server | null = null;

const toSlug = (s: string) =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sem-titulo";

let teiaVaultDir = path.join(os.homedir(), "Desktop", "Mente em Teia");

function ensureTeiaVault(vaultPath: string): string {
  try {
    if (!fs.existsSync(vaultPath)) {
      fs.mkdirSync(vaultPath, { recursive: true });
    }
    return vaultPath;
  } catch {
    const fallback = path.join(os.homedir(), "Mente em Teia");
    if (!fs.existsSync(fallback)) fs.mkdirSync(fallback, { recursive: true });
    return fallback;
  }
}

function parseFrontmatterRaw(raw: string): { meta: Record<string, unknown>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, unknown> = {};
  for (const line of m[1]!.split("\n")) {
    const idx = line.indexOf(":");
    if (idx !== -1) {
      const k = line.slice(0, idx).trim();
      let v: unknown = line.slice(idx + 1).trim();
      const strVal = String(v);
      if (strVal.startsWith("[") && strVal.endsWith("]")) {
        v = strVal.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
      } else if (strVal === "true") v = true;
      else if (strVal === "false") v = false;
      else v = strVal.replace(/^["']|["']$/g, "");
      meta[k] = v;
    }
  }
  return { meta, body: raw.slice(m[0]!.length) };
}

interface VaultNoteSummary {
  id: string;
  title: string;
  type: string;
  trust: string;
  tags: string[];
  path: string;
  content: string;
  outgoing: unknown[];
  backlinks: unknown[];
}

function scanVault(vaultPath: string): VaultNoteSummary[] {
  const result: VaultNoteSummary[] = [];
  try {
    const entries = fs.readdirSync(vaultPath, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.endsWith(".md")) {
        const full = path.join(vaultPath, e.name);
        const content = fs.readFileSync(full, "utf-8");
        const { meta, body } = parseFrontmatterRaw(content);
        const title = typeof meta.title === "string" ? meta.title : e.name.replace(/\.md$/, "");
        result.push({
          id: toSlug(title),
          title,
          type: typeof meta.type === "string" ? meta.type : "concept",
          trust: typeof meta.trust === "string" ? meta.trust : "medium",
          tags: Array.isArray(meta.tags) ? (meta.tags as string[]) : [],
          path: full,
          content: body,
          outgoing: [],
          backlinks: [],
        });
      }
    }
  } catch {
    // Ignore scan errors
  }
  return result;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html": return "text/html; charset=utf-8";
    case ".js": return "application/javascript; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".svg": return "image/svg+xml";
    case ".png": return "image/png";
    case ".jpg": case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    case ".ico": return "image/x-icon";
    case ".woff2": return "font/woff2";
    default: return "application/octet-stream";
  }
}

function startEmbeddedServer(distDir: string): Promise<number> {
  const { promise, resolve } = Promise.withResolvers<number>();
  const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlObj = new URL(req.url || "/", "http://127.0.0.1");
    const pathname = urlObj.pathname;

    if (pathname === "/api/teia/vault-info") {
      const v = ensureTeiaVault(teiaVaultDir);
      const nodes = scanVault(v);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ vaultPath: v, totalNotes: nodes.length, totalGhosts: 0, totalEdges: 0 }));
      return;
    }

    if (pathname === "/api/teia/graph") {
      const v = ensureTeiaVault(teiaVaultDir);
      const nodes = scanVault(v);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ nodes, edges: [], stats: { total: nodes.length, isolated: 0 } }));
      return;
    }

    // ========================================================================
    // ENDPOINTS NATIVOS OMSK (AUTH, PROVIDERS & MODELS DB)
    // ========================================================================

    // 1. Obter modelos reais e status dos provedores autenticados do OMSK
    if (pathname === "/api/models" && req.method === "GET") {
      try {
        const omskDir = path.join(os.homedir(), ".omsk", "agent");
        const ompDir = path.join(os.homedir(), ".omp", "agent");
        const targetDir = fs.existsSync(omskDir) ? omskDir : ompDir;
        const agentDbPath = path.join(targetDir, "agent.db");
        const modelsDbPath = path.join(targetDir, "models.db");

        let activeCredentials: Array<{ provider: string; credential_type: string; identity_key?: string }> = [];
        if (fs.existsSync(agentDbPath)) {
          try {
            const { Database } = require("bun:sqlite");
            const db = new Database(agentDbPath, { readonly: true });
            activeCredentials = db.query("SELECT provider, credential_type, identity_key FROM auth_credentials").all() as any[];
            db.close();
          } catch {
            // Ignore DB lock or read issue
          }
        }

        let dynamicModels: any[] = [];
        if (fs.existsSync(modelsDbPath)) {
          try {
            const { Database } = require("bun:sqlite");
            const db = new Database(modelsDbPath, { readonly: true });
            const rows = db.query("SELECT models FROM model_cache WHERE length(models) > 2").all() as any[];
            for (const r of rows) {
              try {
                const list = JSON.parse(r.models);
                if (Array.isArray(list)) dynamicModels.push(...list);
              } catch {}
            }
            db.close();
          } catch {
            // Ignore DB lock
          }
        }

        const authenticatedProviders = Array.from(new Set(activeCredentials.map(c => c.provider)));

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          ok: true,
          authenticatedProviders,
          activeCredentials,
          modelsCount: dynamicModels.length,
          models: dynamicModels.slice(0, 100).map(m => ({
            id: m.id,
            name: m.name || m.id,
            provider: m.provider,
            contextWindow: m.contextWindow || 128000,
            maxTokens: m.maxTokens || 8192,
            reasoning: Boolean(m.reasoning),
          })),
        }));
      } catch (err: unknown) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: String(err) }));
      }
      return;
    }

    // 2. Login rápido em provedor (Persiste na auth storage do OMSK)
    if (pathname === "/api/providers/login" && req.method === "POST") {
      let body = "";
      req.on("data", chunk => { body += chunk; });
      req.on("end", () => {
        try {
          const data = JSON.parse(body || "{}");
          const { provider, apiKey } = data;
          if (!provider) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Missing provider id" }));
            return;
          }

          const omskDir = path.join(os.homedir(), ".omsk", "agent");
          if (!fs.existsSync(omskDir)) fs.mkdirSync(omskDir, { recursive: true });
          const agentDbPath = path.join(omskDir, "agent.db");

          if (apiKey && apiKey.trim()) {
            try {
              const { Database } = require("bun:sqlite");
              const db = new Database(agentDbPath);
              db.run(
                "INSERT OR REPLACE INTO auth_credentials (provider, credential_type, data, identity_key, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
                [provider, "api_key", JSON.stringify({ key: apiKey.trim() }), null, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)]
              );
              db.close();
            } catch (dbErr) {
              // Ignore SQLite write error
            }
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, provider, message: `Login efetuado com sucesso para ${provider}.` }));
        } catch (err: unknown) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: String(err) }));
        }
      });
      return;
    }
    if (pathname === "/api/fs/browse") {
      const reqDir = urlObj.searchParams.get("dir") || process.cwd();
      try {
        const resolvedPath = path.resolve(reqDir.replace(/^~/, os.homedir()));
        const dirents = fs.readdirSync(resolvedPath, { withFileTypes: true });
        const entries = dirents
          .filter((d) => !d.name.startsWith(".git") && d.name !== "node_modules")
          .map((d) => ({
            name: d.name,
            path: path.join(resolvedPath, d.name).replace(/\\/g, "/"),
            isDirectory: d.isDirectory(),
            size: d.isFile() ? fs.statSync(path.join(resolvedPath, d.name)).size : 0,
          }))
          .sort((a, b) => (a.isDirectory === b.isDirectory ? a.name.localeCompare(b.name) : a.isDirectory ? -1 : 1));

        const parent = path.dirname(resolvedPath).replace(/\\/g, "/");
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          currentDir: resolvedPath.replace(/\\/g, "/"),
          parentDir: parent !== resolvedPath.replace(/\\/g, "/") ? parent : null,
          homedir: os.homedir().replace(/\\/g, "/"),
          entries,
        }));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Diretório inacessível";
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: message }));
      }
      return;
    }

    let reqPath = pathname.replace(/^\//, "");
    if (!reqPath || reqPath === "") reqPath = "index.html";

    let filePath = path.join(distDir, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, "index.html");
    }

    if (fs.existsSync(filePath)) {
      res.writeHead(200, { "Content-Type": getMimeType(filePath) });
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  server.listen(0, "127.0.0.1", () => {
    serverInstance = server;
    const addr = server.address() as AddressInfo | null;
    resolve(addr ? addr.port : 5173);
  });

  return promise;
}

async function createWindow(): Promise<void> {
  const isDev = process.env.NODE_ENV === "development";
  const distDir = path.join(__dirname, "..", "..", "dist");

  let appUrl = "";
  if (isDev) {
    appUrl = "http://localhost:5173";
  } else {
    const port = await startEmbeddedServer(distDir);
    appUrl = `http://127.0.0.1:${port}`;
  }

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 720,
    title: "OMSK GUI",
    backgroundColor: "#020A16",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.loadURL(appUrl);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  ipcMain.handle("dialog:openDirectory", async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"],
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  await createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      void createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (serverInstance) serverInstance.close();
  if (process.platform !== "darwin") app.quit();
});
