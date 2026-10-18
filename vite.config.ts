import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { promises as fs } from "node:fs";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";

interface TreeNodeItem {
  id: string;
  name: string;
  path: string;
  type: "file" | "directory";
  availability: "available" | "selected" | "effectively_used";
  size?: string;
  lines?: number;
  isExpanded?: boolean;
  children?: TreeNodeItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// MOTOR SERVER-SIDE DA MENTE EM TEIA (DESKTOP VAULT)
// ─────────────────────────────────────────────────────────────────────────────

const stripAccents = (s: string) => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const toSlug = (s: string) => stripAccents(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "sem-titulo";

interface TeiaNodeRaw {
  id: string;
  title: string;
  type: string;
  raw: string;
  body: string;
  meta: Record<string, unknown>;
  path: string;
  tags: string[];
  links: Array<{ target: string; relation: string; ai: boolean }>;
  created: string;
  updated: string;
  confidence: number | null;
  trust: "USER_VERIFIED" | "SOURCE_VERIFIED" | "AI_GENERATED" | "AI_INFERRED" | "UNVERIFIED" | "CONFLICTING";
  ghost?: boolean;
  degree?: number;
  hub?: boolean;
  outgoing?: Array<{ id: string; title: string; relation: string; ai: boolean }>;
  backlinks?: Array<{ id: string; title: string; relation: string; ai: boolean }>;
}

let teiaVaultDir = path.join(os.homedir(), "Desktop", "Mente em Teia");

function ensureTeiaVault(vaultPath: string): string {
  const resolved = path.resolve(vaultPath.replace(/^~/, os.homedir()));
  if (!fsSync.existsSync(resolved)) {
    fsSync.mkdirSync(resolved, { recursive: true });
  }
  const dataDir = path.join(resolved, ".teia");
  for (const d of ["versions", "trash", "proposals"]) {
    const sub = path.join(dataDir, d);
    if (!fsSync.existsSync(sub)) {
      fsSync.mkdirSync(sub, { recursive: true });
    }
  }
  return resolved;
}

function parseFrontmatterRaw(raw: string): { meta: Record<string, unknown>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, unknown> = {};
  let currentKey: string | null = null;

  for (const line of m[1]!.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentKey) {
      const arr = Array.isArray(meta[currentKey]) ? (meta[currentKey] as unknown[]) : ((meta[currentKey] = []) as unknown[]);
      arr.push(listItem[1]!.trim().replace(/^["']|["']$/g, ""));
      continue;
    }

    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) {
      currentKey = kv[1]!;
      const val = kv[2]!.trim().replace(/^["']|["']$/g, "");
      if (val === "" || val === "[]") {
        meta[currentKey] = [];
      } else if (val.startsWith("[") && val.endsWith("]")) {
        meta[currentKey] = val.slice(1, -1).split(",").map((x) => x.trim().replace(/^["']|["']$/g, ""));
      } else if (val === "true" || val === "false") {
        meta[currentKey] = val === "true";
      } else if (/^\d+(\.\d+)?$/.test(val)) {
        meta[currentKey] = Number(val);
      } else {
        meta[currentKey] = val;
      }
    }
  }

  return { meta, body: raw.slice(m[0]!.length) };
}

function extractLinksAndTags(body: string): { links: Array<{ target: string; relation: string; ai: boolean }>; tags: string[] } {
  const clean = body
    .replace(/```[\s\S]*?```|~~~[\s\S]*?~~~/g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/`[^`\n]*`/g, (m) => " ".repeat(m.length));

  const links: Array<{ target: string; relation: string; ai: boolean }> = [];
  const typed = new Set<string>();

  // Relações tipadas: `relacao:: [[Alvo]]`
  const lines = clean.split("\n");
  for (const line of lines) {
    const relMatch = line.match(/^[\s>*+-]*([\p{L}][\p{L}\p{N}_-]*)::\s*(.+)$/u);
    if (!relMatch) continue;
    const isAi = /✦\s*$/.test(relMatch[2]!);
    for (const m of relMatch[2]!.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
      const target = m[1]!.trim();
      links.push({ target, relation: toSlug(relMatch[1]!), ai: isAi });
      typed.add(toSlug(target));
    }
  }

  // Links simples: `[[Alvo]]`
  const seen = new Set<string>();
  for (const m of clean.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
    const target = m[1]!.trim();
    const k = toSlug(target);
    if (!typed.has(k) && !seen.has(k)) {
      seen.add(k);
      links.push({ target, relation: "relaciona-se-com", ai: false });
    }
  }

  // Tags: `#tag`
  const tags = new Set<string>();
  for (const m of clean.matchAll(/(?:^|\s)#([\p{L}][\p{L}\p{N}_/-]*)/gu)) {
    tags.add(m[1]!.toLowerCase());
  }

  return { links, tags: [...tags] };
}

function scanVault(vaultPath: string): TeiaNodeRaw[] {
  const resolved = ensureTeiaVault(vaultPath);
  const nodes: TeiaNodeRaw[] = [];

  function walk(dir: string, relPrefix = "") {
    let entries: fsSync.Dirent[] = [];
    try {
      entries = fsSync.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const e of entries) {
      if (e.name.startsWith(".")) continue;
      const full = path.join(dir, e.name);
      const rel = relPrefix ? `${relPrefix}/${e.name}` : e.name;

      if (e.isDirectory()) {
        walk(full, rel);
      } else if (e.isFile() && /\.md$/i.test(e.name)) {
        try {
          const raw = fsSync.readFileSync(full, "utf8");
          const { meta, body } = parseFrontmatterRaw(raw);
          const stem = e.name.replace(/\.md$/i, "");
          const h1 = body.match(/^#\s+(.+)$/m);
          const title = String(meta.title || (h1 && h1[1]!.trim()) || stem);
          const id = String(meta.id || toSlug(stem));
          const { links, tags: inlineTags } = extractLinksAndTags(body);
          const fmTags = (Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : []).map(String);
          const allTags = [...new Set([...fmTags, ...inlineTags])];

          const isVerified = meta.verified === true;
          const source = String(meta.source || "user");
          let trust: TeiaNodeRaw["trust"] = "UNVERIFIED";
          if (source === "user") trust = isVerified ? "USER_VERIFIED" : "UNVERIFIED";
          else if (source === "ai") trust = isVerified ? "USER_VERIFIED" : "AI_GENERATED";
          else if (source === "ai-inferred") trust = isVerified ? "USER_VERIFIED" : "AI_INFERRED";

          nodes.push({
            id,
            title,
            type: String(meta.type || "concept"),
            raw,
            body,
            meta,
            path: rel,
            tags: allTags,
            links,
            created: String(meta.created || ""),
            updated: String(meta.updated || meta.created || ""),
            confidence: typeof meta.confidence === "number" ? meta.confidence : null,
            trust,
            ghost: false,
          });
        } catch {
          // Ignora arquivo corrompido
        }
      }
    }
  }

  walk(resolved);
  return nodes;
}

function buildGraph(vaultPath: string): {
  nodes: TeiaNodeRaw[];
  edges: Array<{ source: string; target: string; relation: string; ai: boolean }>;
  conflicts: Array<{ id: string; reason: string }>;
  revision: number;
} {
  const realNodes = scanVault(vaultPath);
  const nodeMap = new Map<string, TeiaNodeRaw>();
  const slugToId = new Map<string, string>();

  for (const n of realNodes) {
    nodeMap.set(n.id, n);
    slugToId.set(toSlug(n.id), n.id);
    slugToId.set(toSlug(n.title), n.id);
  }

  const edges: Array<{ source: string; target: string; relation: string; ai: boolean }> = [];
  const edgeKeys = new Set<string>();
  const ghostNodes = new Map<string, TeiaNodeRaw>();

  for (const n of realNodes) {
    for (const link of n.links) {
      const targetSlug = toSlug(link.target);
      let targetId = slugToId.get(targetSlug);

      // Nó fantasma (link para nota que ainda não foi escrita)
      if (!targetId) {
        targetId = `ghost-${targetSlug}`;
        if (!ghostNodes.has(targetId)) {
          ghostNodes.set(targetId, {
            id: targetId,
            title: link.target,
            type: "reference",
            raw: "",
            body: "",
            meta: {},
            path: "",
            tags: [],
            links: [],
            created: "",
            updated: "",
            confidence: null,
            trust: "UNVERIFIED",
            ghost: true,
          });
        }
      }

      const key = `${n.id}->${targetId}:${link.relation}`;
      if (!edgeKeys.has(key)) {
        edgeKeys.add(key);
        edges.push({
          source: n.id,
          target: targetId,
          relation: link.relation,
          ai: link.ai,
        });
      }
    }
  }

  const allNodes = [...realNodes, ...ghostNodes.values()];

  // Calcula grau (degree) e identifica hubs
  const degreeMap = new Map<string, number>();
  for (const e of edges) {
    degreeMap.set(e.source, (degreeMap.get(e.source) || 0) + 1);
    degreeMap.set(e.target, (degreeMap.get(e.target) || 0) + 1);
  }

  for (const n of allNodes) {
    n.degree = degreeMap.get(n.id) || 0;
    n.hub = n.degree >= 3;
  }

  return {
    nodes: allNodes,
    edges,
    conflicts: [],
    revision: Date.now(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// VITE PLUGIN COMUNS
// ─────────────────────────────────────────────────────────────────────────────

function localFsPlugin(): Plugin {
  return {
    name: "local-fs-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlStr = req.url || "";

        // 1. Endpoints da Mente em Teia
        if (urlStr.startsWith("/api/teia")) {
          const u = new URL(urlStr, "http://localhost:5173");
          res.setHeader("Content-Type", "application/json");

          // Obter informações do Vault
          if (u.pathname === "/api/teia/vault-info") {
            const vault = ensureTeiaVault(teiaVaultDir);
            const graph = buildGraph(vault);
            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                vaultPath: vault,
                totalNotes: graph.nodes.filter((n) => !n.ghost).length,
                totalGhosts: graph.nodes.filter((n) => n.ghost).length,
                totalEdges: graph.edges.length,
              })
            );
            return;
          }

          // Alterar caminho do Vault
          if (u.pathname === "/api/teia/set-vault" && req.method === "POST") {
            const body = await readJsonBody(req);
            if (body && typeof body.path === "string" && body.path.trim()) {
              teiaVaultDir = ensureTeiaVault(body.path.trim());
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, vaultPath: teiaVaultDir }));
            } else {
              res.statusCode = 400;
              res.end(JSON.stringify({ success: false, error: "Caminho inválido" }));
            }
            return;
          }

          // Grafo completo
          if (u.pathname === "/api/teia/graph") {
            const vault = ensureTeiaVault(teiaVaultDir);
            const graph = buildGraph(vault);
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, ...graph }));
            return;
          }

          // Ler nó específico
          if (u.pathname.startsWith("/api/teia/node/") && req.method === "GET") {
            const nodeId = decodeURIComponent(u.pathname.replace("/api/teia/node/", ""));
            const vault = ensureTeiaVault(teiaVaultDir);
            const graph = buildGraph(vault);
            const target = graph.nodes.find((n) => n.id === nodeId || toSlug(n.title) === toSlug(nodeId));

            if (target) {
              const outgoing = graph.edges
                .filter((e) => e.source === target.id)
                .map((e) => {
                  const nodeObj = graph.nodes.find((n) => n.id === e.target);
                  return { id: e.target, title: nodeObj?.title || e.target, relation: e.relation, ai: e.ai };
                });
              const backlinks = graph.edges
                .filter((e) => e.target === target.id)
                .map((e) => {
                  const nodeObj = graph.nodes.find((n) => n.id === e.source);
                  return { id: e.source, title: nodeObj?.title || e.source, relation: e.relation, ai: e.ai };
                });

              target.outgoing = outgoing;
              target.backlinks = backlinks;

              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, node: target }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ success: false, error: "Nó não encontrado" }));
            }
            return;
          }

          // Criar novo nó / nota Markdown no Vault
          if (u.pathname === "/api/teia/node" && req.method === "POST") {
            const body = await readJsonBody(req);
            const title = String(body.title || "Nova Nota").trim();
            const type = String(body.type || "concept").trim();
            const id = toSlug(title);
            const vault = ensureTeiaVault(teiaVaultDir);
            const filePath = path.join(vault, `${id}.md`);
            const today = new Date().toISOString().slice(0, 10);

            const rawContent =
              `---\n` +
              `id: ${id}\n` +
              `title: ${title}\n` +
              `type: ${type}\n` +
              `created: ${today}\n` +
              `updated: ${today}\n` +
              `tags: [${Array.isArray(body.tags) ? body.tags.join(", ") : ""}]\n` +
              `confidence: ${body.confidence ?? 1.0}\n` +
              `source: ${body.source || "user"}\n` +
              `verified: ${body.verified ?? true}\n` +
              `---\n\n` +
              `# ${title}\n\n` +
              (body.body ? `${body.body}\n` : `Escreva suas anotações aqui...\n`);

            await fs.writeFile(filePath, rawContent, "utf8");
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, id, path: `${id}.md`, raw: rawContent }));
            return;
          }

          // Atualizar nó existente
          if (u.pathname.startsWith("/api/teia/node/") && req.method === "PUT") {
            const nodeId = decodeURIComponent(u.pathname.replace("/api/teia/node/", ""));
            const body = await readJsonBody(req);
            const vault = ensureTeiaVault(teiaVaultDir);
            const graph = buildGraph(vault);
            const target = graph.nodes.find((n) => n.id === nodeId);

            if (target && target.path) {
              const fullPath = path.join(vault, target.path);
              const newRaw = String(body.raw || target.raw);
              await fs.writeFile(fullPath, newRaw, "utf8");
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, id: nodeId }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ success: false, error: "Nó não encontrado para atualização" }));
            }
            return;
          }

          // Deletar nó
          if (u.pathname.startsWith("/api/teia/node/") && req.method === "DELETE") {
            const nodeId = decodeURIComponent(u.pathname.replace("/api/teia/node/", ""));
            const vault = ensureTeiaVault(teiaVaultDir);
            const graph = buildGraph(vault);
            const target = graph.nodes.find((n) => n.id === nodeId);

            if (target && target.path) {
              const fullPath = path.join(vault, target.path);
              const trashPath = path.join(vault, ".teia", "trash", path.basename(target.path));
              await fs.rename(fullPath, trashPath);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, deleted: nodeId }));
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ success: false, error: "Nó não encontrado" }));
            }
            return;
          }

          // Salvar Memória / Preferência pela IA
          if (u.pathname === "/api/teia/memory" && req.method === "POST") {
            const body = await readJsonBody(req);
            const title = String(body.title || "Aprendizado IA").trim();
            const type = String(body.type || "preference").trim();
            const id = toSlug(title);
            const vault = ensureTeiaVault(teiaVaultDir);
            const filePath = path.join(vault, `${id}.md`);
            const today = new Date().toISOString().slice(0, 10);

            const rawContent =
              `---\n` +
              `id: ${id}\n` +
              `title: ${title}\n` +
              `type: ${type}\n` +
              `created: ${today}\n` +
              `updated: ${today}\n` +
              `tags: [${Array.isArray(body.tags) ? body.tags.join(", ") : "memoria, aprendizado"}]\n` +
              `confidence: 0.95\n` +
              `source: ai\n` +
              `verified: true\n` +
              `---\n\n` +
              `# ${title}\n\n` +
              `${body.content || ""}\n\n` +
              (body.links ? `${body.links}\n` : "");

            await fs.writeFile(filePath, rawContent, "utf8");
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, id, message: `Memória '${title}' salva no Desktop Vault.` }));
            return;
          }

          // Context Builder para IA
          if (u.pathname === "/api/teia/context") {
            const q = u.searchParams.get("query") || "";
            const vault = ensureTeiaVault(teiaVaultDir);
            const graph = buildGraph(vault);
            const real = graph.nodes.filter((n) => !n.ghost);

            let contextText = `=== MENTE EM TEIA (BASE DE CONHECIMENTO & PREFERÊNCIAS DO USUÁRIO) ===\n`;
            if (real.length === 0) {
              contextText += `[Nenhuma anotação criada ainda no vault do Desktop: ${vault}]\n`;
            } else if (q) {
              const qLower = q.toLowerCase();
              const matches = real.filter((n) => n.title.toLowerCase().includes(qLower) || n.body.toLowerCase().includes(qLower));
              const candidates = matches.length > 0 ? matches : real;
              for (const n of candidates.slice(0, 8)) {
                contextText += `\n---\nNOTA: [[${n.title}]] (Tipo: ${n.type})\n${n.body.slice(0, 400)}\n`;
              }
            } else {
              for (const n of real.slice(0, 8)) {
                contextText += `\n---\nNOTA: [[${n.title}]] (Tipo: ${n.type})\n${n.body.slice(0, 400)}\n`;
              }
            }

            res.statusCode = 200;
            res.end(
              JSON.stringify({
                success: true,
                nodesCount: real.length,
                text: contextText,
              })
            );
            return;
          }
        }

        // 2. Endpoints do Navegador de Arquivos Geral (/api/fs)
        if (urlStr.startsWith("/api/fs")) {
          const url = new URL(urlStr, "http://localhost:5173");
          res.setHeader("Content-Type", "application/json");

          if (url.pathname === "/api/fs/browse") {
            const reqDir = url.searchParams.get("dir") || process.cwd();
            try {
              const resolvedPath = path.resolve(reqDir.replace(/^~/, os.homedir()));
              const dirents = await fs.readdir(resolvedPath, { withFileTypes: true });

              const entries = await Promise.all(
                dirents
                  .filter((d) => !d.name.startsWith(".git") && d.name !== "node_modules")
                  .map(async (d) => {
                    const fullPath = path.join(resolvedPath, d.name);
                    let size = 0;
                    try {
                      if (d.isFile()) {
                        const stat = await fs.stat(fullPath);
                        size = stat.size;
                      }
                    } catch {
                      // Ignora erro
                    }
                    return {
                      name: d.name,
                      path: fullPath.replace(/\\/g, "/"),
                      isDirectory: d.isDirectory(),
                      size,
                    };
                  })
              );

              entries.sort((a, b) => {
                if (a.isDirectory === b.isDirectory) return a.name.localeCompare(b.name);
                return a.isDirectory ? -1 : 1;
              });

              const parentPath = path.dirname(resolvedPath).replace(/\\/g, "/");

              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  currentDir: resolvedPath.replace(/\\/g, "/"),
                  parentDir: parentPath !== resolvedPath.replace(/\\/g, "/") ? parentPath : null,
                  homedir: os.homedir().replace(/\\/g, "/"),
                  entries,
                })
              );
            } catch (err: unknown) {
              res.statusCode = 500;
              const message = err instanceof Error ? err.message : "Erro ao ler diretório local";
              res.end(JSON.stringify({ success: false, error: message }));
            }
            return;
          }

          if (url.pathname === "/api/fs/tree") {
            const reqDir = url.searchParams.get("dir") || process.cwd();
            try {
              const resolvedPath = path.resolve(reqDir.replace(/^~/, os.homedir()));
              const tree = await scanTree(resolvedPath, 2);
              res.statusCode = 200;
              res.end(
                JSON.stringify({
                  success: true,
                  rootPath: resolvedPath.replace(/\\/g, "/"),
                  tree,
                })
              );
            } catch (err: unknown) {
              res.statusCode = 500;
              const message = err instanceof Error ? err.message : "Erro ao varrer árvore local";
              res.end(JSON.stringify({ success: false, error: message }));
            }
            return;
          }
        }

        next();
      });
    },
  };
}

async function readJsonBody(req: unknown): Promise<Record<string, unknown>> {
  const request = req as { on: (event: string, cb: (chunk: Buffer) => void) => void };
  const { promise, resolve } = Promise.withResolvers<Record<string, unknown>>();
  const chunks: Buffer[] = [];

  request.on("data", (c) => chunks.push(c));
  request.on("end", () => {
    try {
      const text = Buffer.concat(chunks).toString("utf8");
      resolve(text ? (JSON.parse(text) as Record<string, unknown>) : {});
    } catch {
      resolve({});
    }
  });

  return promise;
}

async function scanTree(currentDir: string, maxDepth: number, currentDepth = 0): Promise<TreeNodeItem[]> {
  if (currentDepth > maxDepth) return [];
  try {
    const dirents = await fs.readdir(currentDir, { withFileTypes: true });
    const items: TreeNodeItem[] = [];

    for (const d of dirents) {
      if (d.name.startsWith(".git") || d.name === "node_modules" || d.name === "dist") {
        continue;
      }
      const fullPath = path.join(currentDir, d.name).replace(/\\/g, "/");
      if (d.isDirectory()) {
        const children = await scanTree(path.join(currentDir, d.name), maxDepth, currentDepth + 1);
        items.push({
          id: `dir-${fullPath}`,
          name: d.name,
          path: fullPath,
          type: "directory",
          availability: "available",
          isExpanded: currentDepth === 0,
          children,
        });
      } else {
        let sizeStr = "";
        try {
          const stat = await fs.stat(path.join(currentDir, d.name));
          sizeStr = `${(stat.size / 1024).toFixed(1)} KB`;
        } catch {
          // ignora
        }
        items.push({
          id: `file-${fullPath}`,
          name: d.name,
          path: fullPath,
          type: "file",
          availability: "available",
          size: sizeStr,
          lines: 0,
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

export default defineConfig({
  plugins: [react(), localFsPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
