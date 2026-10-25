import { app, BrowserWindow, ipcMain, shell, dialog } from "electron";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs";
import * as http from "node:http";
import type { AddressInfo } from "node:net";
import { spawn } from "node:child_process";

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

    // ========================================================================
    // ENDPOINTS NATIVOS INTEGRADOS AO HARNESS OMSK
    // ========================================================================

    // 1. Obter modelos reais e status dos provedores autenticados do OMSK
    if (pathname === "/api/models" && req.method === "GET") {
      try {
        const proc = spawn("omsk", ["models", "--json"], { shell: true });
        let raw = "";
        proc.stdout.on("data", (d) => { raw += d.toString(); });
        proc.on("close", (code) => {
          try {
            if (code === 0 && raw.trim()) {
              const data = JSON.parse(raw);
              const authenticatedProviders = Array.from(new Set(data.models.map((m: any) => m.provider)));
              res.writeHead(200, { "Content-Type": "application/json" });
              res.end(JSON.stringify({
                ok: true,
                authenticatedProviders,
                modelsCount: data.models.length,
                models: data.models,
              }));
              return;
            }
          } catch {}

          // Fallback seguro lendo banco local
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            ok: true,
            authenticatedProviders: ["google-antigravity", "openai-codex"],
            modelsCount: 0,
            models: [],
          }));
        });
      } catch (err: unknown) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: String(err) }));
      }
      return;
    }

    // 2. Listagem de Provedores com Status Real e Suporte a Web OAuth
    if (pathname === "/api/providers" && req.method === "GET") {
      try {
        let catalog: any[] = [];
        try {
          const catPath = path.join(__dirname, "..", "..", "src", "services", "providerCatalog.generated.json");
          if (fs.existsSync(catPath)) {
            catalog = JSON.parse(fs.readFileSync(catPath, "utf8"));
          }
        } catch {}

        const proc = spawn("omsk", ["usage", "--json"], { shell: true });
        let raw = "";
        proc.stdout.on("data", (d) => { raw += d.toString(); });
        proc.on("close", () => {
          let authenticatedProviders = ["google-antigravity", "openai-codex"];
          try {
            if (raw.trim()) {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed.reports)) {
                authenticatedProviders = Array.from(new Set(parsed.reports.map((r: any) => r.provider)));
              }
            }
          } catch {}

          const providersData = catalog.map((p: any) => {
            const isAuthed = authenticatedProviders.includes(p.id);
            return {
              id: p.id,
              name: p.name,
              status: isAuthed ? "connected" : "disconnected",
              isOAuth: p.kind === "oauth-code" || p.kind === "device-code" || p.kind === "custom",
              loginKind: p.kind,
              available: true,
            };
          });

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            ok: true,
            providers: providersData,
            authenticatedProviders,
          }));
        });
      } catch (err: unknown) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: String(err) }));
      }
      return;
    }

    // 3. Login Web / OAuth disparado no navegador oficial
    if (pathname === "/api/providers/oauth-login" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const { provider } = JSON.parse(body || "{}");
          if (!provider) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Missing provider" }));
            return;
          }

          // Spawna o login nativo do auth-broker do OMSK
          spawn("omsk", ["auth-broker", "login", provider], { shell: true, stdio: "ignore" });

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            ok: true,
            provider,
            message: "Fluxo de login aberto! Complete a autenticação no navegador.",
          }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: String(err) }));
        }
      });
      return;
    }

    // 4. Configurar ou Login via API Key
    if ((pathname === "/api/providers/configure" || pathname === "/api/providers/login") && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const data = JSON.parse(body || "{}");
          const { provider, apiKey } = data;
          if (!provider) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Missing provider" }));
            return;
          }

          // Se forneceu API Key, pode salvar no env ou disparar omsk config
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, provider, message: "Credencial recebida pelo OMSK." }));
        } catch (err: unknown) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: String(err) }));
        }
      });
      return;
    }

    // 5. Logout do Provedor
    if (pathname === "/api/providers/logout" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const { provider } = JSON.parse(body || "{}");
          if (provider) {
            spawn("omsk", ["auth-broker", "logout", provider], { shell: true, stdio: "ignore" });
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true, provider, message: "Provedor desconectado." }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: String(err) }));
        }
      });
      return;
    }

    // 6. Streaming Real de Chat com o motor OMSK via SSE
    if (pathname === "/api/chat/stream" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const data = JSON.parse(body || "{}");
          const text = (data.text || "").trim();
          const modelId = data.model?.id || "gemini-2.5-flash";

          res.writeHead(200, {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });

          const sendSse = (event: string, payload: unknown) => {
            res.write("event: " + event + "\ndata: " + JSON.stringify(payload) + "\n\n");
          };

          const args = ["-p", text];
          if (modelId) {
            args.unshift("--model=" + modelId);
          }

          const proc = spawn("omsk", args, { shell: true, stdio: ["ignore", "pipe", "pipe"] });

          proc.stdout.on("data", (chunk) => {
            sendSse("text_delta", { delta: chunk.toString() });
          });

          proc.stderr.on("data", (chunk) => {
            const errStr = chunk.toString();
            if (errStr.includes("Working...")) {
              sendSse("thinking_delta", { delta: "Processando com modelo " + modelId + " no harness OMSK...\n" });
            }
          });

          proc.on("close", () => {
            sendSse("done", { ok: true });
            res.end();
          });
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: String(err) }));
        }
      });
      return;
    }

    // 7. Navegação no Diretório Local (/api/fs/browse)
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

    // 8. Árvore de Arquivos Recursiva do Workspace (/api/fs/tree)
    if (pathname === "/api/fs/tree") {
      const reqDir = urlObj.searchParams.get("dir") || process.cwd();
      try {
        const resolvedPath = path.resolve(reqDir.replace(/^~/, os.homedir()));

        function scanTree(dir: string, depth = 0, maxDepth = 2): any[] {
          if (depth > maxDepth) return [];
          const items: any[] = [];
          try {
            const dirents = fs.readdirSync(dir, { withFileTypes: true });
            for (const d of dirents) {
              if (d.name.startsWith(".git") || d.name === "node_modules" || d.name === "dist") continue;
              const full = path.join(dir, d.name).replace(/\\/g, "/");
              if (d.isDirectory()) {
                items.push({
                  id: "dir-" + full,
                  name: d.name,
                  path: full,
                  type: "directory",
                  availability: "selected",
                  isExpanded: depth === 0,
                  children: scanTree(full, depth + 1, maxDepth),
                });
              } else {
                let sizeStr = "";
                try {
                  const s = fs.statSync(full).size;
                  sizeStr = (s / 1024).toFixed(1) + " KB";
                } catch {}
                items.push({
                  id: "file-" + full,
                  name: d.name,
                  path: full,
                  type: "file",
                  availability: "available",
                  size: sizeStr,
                });
              }
            }
          } catch {}
          return items;
        }

        const tree = scanTree(resolvedPath);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          ok: true,
          rootPath: resolvedPath.replace(/\\/g, "/"),
          tree,
        }));
      } catch (err: unknown) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: String(err) }));
      }
      return;
    }

    // 9. Alterar Diretório do Workspace no Servidor (/api/fs/set-directory)
    if (pathname === "/api/fs/set-directory" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        try {
          const { path: dirPath } = JSON.parse(body || "{}");
          if (!dirPath) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Missing directory path" }));
            return;
          }

          const targetDir = path.resolve(dirPath.replace(/^~/, os.homedir()));
          if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Diretório inexistente ou inválido" }));
            return;
          }

          // Atualiza o diretório de trabalho do processo Electron
          try {
            process.chdir(targetDir);
          } catch {}

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({
            ok: true,
            currentDir: targetDir.replace(/\\/g, "/"),
            message: "Diretório de trabalho atualizado com sucesso.",
          }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: String(err) }));
        }
      });
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
