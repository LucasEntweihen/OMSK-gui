/**
 * Oh My Shark — Mente em Teia Core Engine
 * Integrado com a Arquitetura Graphify (Graphify-Labs/graphify):
 * Parser Markdown, Grafo Force-Directed, Detecção de Comunidades, God Nodes,
 * Pontes Surpreendentes, Perguntas Sugeridas e Integração com Desktop Vault.
 */

import {
  runGraphifyPipeline,
  type GraphifyNode,
  type GraphifyEdge,
  type GraphifyCommunity,
  type GraphifyGodNode,
  type GraphifySurprisingConnection,
  type GraphifySuggestedQuestion,
  type GraphifyPipelineResult,
} from "./graphify";

export * from "./graphify";

export type TeiaNodeType = 
  | "concept" 
  | "technology" 
  | "project" 
  | "decision" 
  | "problem" 
  | "solution" 
  | "idea" 
  | "reference" 
  | "preference" 
  | "memory";

export type TeiaTrust = 
  | "USER_VERIFIED" 
  | "SOURCE_VERIFIED" 
  | "AI_GENERATED" 
  | "AI_INFERRED" 
  | "UNVERIFIED" 
  | "CONFLICTING";

export interface TeiaLink {
  target: string;
  relation: string;
  ai: boolean;
}

export interface TeiaNode {
  id: string;
  title: string;
  type: TeiaNodeType;
  raw: string;
  body: string;
  meta: Record<string, unknown>;
  path: string;
  tags: string[];
  links: TeiaLink[];
  created: string;
  updated: string;
  confidence: number | null;
  trust: TeiaTrust;
  ghost?: boolean;
  degree?: number;
  hub?: boolean;
  outgoing?: Array<{ id: string; title: string; relation: string; ai: boolean }>;
  backlinks?: Array<{ id: string; title: string; relation: string; ai: boolean }>;
  
  // Atributos enriquecidos pelo Graphify
  communityId?: number;
  communityLabel?: string;
  cohesionScore?: number;
  inDegree?: number;
  outDegree?: number;
  isGodNode?: boolean;

  // Coordenadas físicas do Canvas 2D
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  r?: number;
  pinned?: boolean;
}

export interface TeiaEdge {
  source: string;
  target: string;
  relation: string;
  ai: boolean;
  s?: TeiaNode;
  t?: TeiaNode;
  bend?: number;

  // Atributos enriquecidos pelo Graphify
  confidenceLevel?: "EXTRACTED" | "INFERRED" | "AMBIGUOUS";
  weight?: number;
  isCrossCommunity?: boolean;
  surpriseScore?: number;
  surpriseReasons?: string[];
}

export interface TeiaGraph {
  nodes: TeiaNode[];
  edges: TeiaEdge[];
  conflicts: Array<{ id: string; reason: string }>;
  revision: number;

  // Metadados analíticos da arquitetura Graphify
  communities?: GraphifyCommunity[];
  godNodes?: GraphifyGodNode[];
  surprisingConnections?: GraphifySurprisingConnection[];
  suggestedQuestions?: GraphifySuggestedQuestion[];
  pipelineResult?: GraphifyPipelineResult;
}

export interface VaultInfo {
  vaultPath: string;
  totalNotes: number;
  totalGhosts: number;
  totalEdges: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSER E RENDERIZADOR MARKDOWN COM WIKILINKS E RELAÇÕES
// ─────────────────────────────────────────────────────────────────────────────

const ENT: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escHtml = (s: string) => String(s).replace(/[&<>"']/g, (c) => ENT[c] || c);

export function renderTeiaMarkdown(raw: string, existsCheck: (ref: string) => boolean = () => true): string {
  const inline = (text: string) => {
    let t = escHtml(text);
    const codes: string[] = [];

    // Preserva inline code
    t = t.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);

    // Relações tipadas: relacao:: [[Alvo]]
    t = t.replace(/^([\p{L}][\p{L}\p{N}_-]*)::\s+/u, (_, r) => `<span class="teia-rel-badge">${r} →</span> `);

    // Wikilinks: [[Alvo]] ou [[Alvo|Alias]]
    t = t.replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g, (_, ref, alias) => {
      const r = ref.trim();
      const isReal = existsCheck(r);
      return `<a class="teia-wikilink ${isReal ? "teia-wikilink--real" : "teia-wikilink--ghost"}" data-ref="${encodeURIComponent(r)}" tabindex="0">${alias ? alias.trim() : r}</a>`;
    });

    // Formatação rica
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>");
    t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="teia-ext-link">$1</a>');
    t = t.replace(/(^|\s)#([\p{L}][\p{L}\p{N}_/-]*)/gu, '$1<span class="teia-tag">#$2</span>');
    t = t.replace(/✦/g, '<span class="teia-ai-glyph" title="Gerado ou inferido por IA">✦</span>');

    // Restaura inline code
    /* oxlint-disable-next-line no-control-regex */
    return t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
  };

  // Separa frontmatter
  let body = raw;
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (m) {
    body = raw.slice(m[0]!.length);
  }

  const out: string[] = [];
  let inList: "ul" | "ol" | null = null;
  let codeLines: string[] | null = null;
  let para: string[] = [];

  const flush = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };

  const closeList = () => {
    if (inList) {
      out.push(`</${inList}>`);
      inList = null;
    }
  };

  for (const line of body.split("\n")) {
    if (codeLines !== null) {
      if (line.startsWith("```")) {
        out.push(`<pre><code>${escHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = null;
      } else {
        codeLines.push(line);
      }
      continue;
    }

    if (line.startsWith("```")) {
      flush();
      closeList();
      codeLines = [];
      continue;
    }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flush();
      closeList();
      out.push(`<h${h[1]!.length}>${inline(h[2]!)}</h${h[1]!.length}>`);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      flush();
      if (inList !== "ul") {
        closeList();
        out.push("<ul>");
        inList = "ul";
      }
      out.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ""))}</li>`);
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      flush();
      if (inList !== "ol") {
        closeList();
        out.push("<ol>");
        inList = "ol";
      }
      out.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ""))}</li>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      flush();
      closeList();
      out.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      flush();
      closeList();
      out.push("<hr />");
      continue;
    }

    if (!line.trim()) {
      flush();
      closeList();
    } else {
      para.push(line.trim());
    }
  }

  if (codeLines !== null) {
    out.push(`<pre><code>${escHtml(codeLines.join("\n"))}</code></pre>`);
  }
  flush();
  closeList();

  return out.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// FÍSICA FORCE-DIRECTED DO CANVAS DA TEIA
// ─────────────────────────────────────────────────────────────────────────────

export function stepTeiaPhysics(nodes: TeiaNode[], edges: TeiaEdge[], alpha: number, aspect = 1): void {
  const n = nodes.length;
  if (!n) return;

  const rep = (1400 + Math.sqrt(n) * 450) * alpha;

  // 1. Repulsão n-corpos (Coulomb)
  for (let i = 0; i < n; i++) {
    const a = nodes[i]!;
    for (let j = i + 1; j < n; j++) {
      const b = nodes[j]!;
      const dx = (b.x! - a.x!) / aspect;
      const dy = b.y! - a.y!;
      const d2 = dx * dx + dy * dy + 80;
      const f = (rep / d2) * Math.min(1.8, (a.r || 5) * (b.r || 5) * 0.05);
      const fx = (dx / Math.sqrt(d2)) * f;
      const fy = (dy / Math.sqrt(d2)) * f;
      a.vx = (a.vx || 0) - fx * aspect;
      a.vy = (a.vy || 0) - fy;
      b.vx = (b.vx || 0) + fx * aspect;
      b.vy = (b.vy || 0) + fy;
    }
  }

  // 2. Atração por arestas (Molas Hooke)
  for (const e of edges) {
    if (!e.s || !e.t) continue;
    const dx = (e.t.x! - e.s.x!) / aspect;
    const dy = e.t.y! - e.s.y!;
    const d = Math.hypot(dx, dy) || 1;
    const targetDist = 70 + (e.s.r || 5) + (e.t.r || 5);
    const force = (d - targetDist) * 0.045 * alpha;
    const fx = (dx / d) * force;
    const fy = (dy / d) * force;
    e.s.vx = (e.s.vx || 0) + fx * aspect;
    e.s.vy = (e.s.vy || 0) + fy;
    e.t.vx = (e.t.vx || 0) - fx * aspect;
    e.t.vy = (e.t.vy || 0) - fy;
  }

  // 3. Gravidade central e amortecimento
  const damp = 0.88;
  const grav = 0.008 * alpha;
  for (const p of nodes) {
    p.vx = (p.vx || 0) - p.x! * grav;
    p.vy = (p.vy || 0) - p.y! * grav;
    p.vx *= damp;
    p.vy *= damp;
    if (p.pinned) {
      p.vx = p.vy = 0;
    } else {
      p.x! += p.vx;
      p.y! += p.vy;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENTE HTTP PARA API LOCAL DA TEIA
// ─────────────────────────────────────────────────────────────────────────────

export async function apiGetVaultInfo(): Promise<VaultInfo> {
  const res = await fetch("/api/teia/vault-info");
  if (!res.ok) throw new Error("Falha ao obter dados do vault");
  return (await res.json()) as VaultInfo;
}

export async function apiSetVaultPath(targetPath: string): Promise<string> {
  const res = await fetch("/api/teia/set-vault", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: targetPath }),
  });
  const data = (await res.json()) as { success: boolean; vaultPath: string; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error || "Falha ao definir vault");
  return data.vaultPath;
}

export async function apiGetGraph(): Promise<TeiaGraph> {
  const res = await fetch("/api/teia/graph");
  if (!res.ok) throw new Error("Falha ao carregar grafo da Teia");
  const rawGraph = (await res.json()) as TeiaGraph;

  // Executa o Pipeline Graphify de 7 estágios sobre os dados
  try {
    const pipeline = runGraphifyPipeline(
      rawGraph.nodes as GraphifyNode[],
      rawGraph.edges as GraphifyEdge[]
    );
    return {
      ...rawGraph,
      nodes: pipeline.nodes,
      edges: pipeline.edges,
      communities: pipeline.communities,
      godNodes: pipeline.report.godNodes,
      surprisingConnections: pipeline.report.surprisingConnections,
      suggestedQuestions: pipeline.report.suggestedQuestions,
      pipelineResult: pipeline,
    };
  } catch {
    return rawGraph;
  }
}

export async function apiGetNode(id: string): Promise<TeiaNode> {
  const res = await fetch(`/api/teia/node/${encodeURIComponent(id)}`);
  const data = (await res.json()) as { success: boolean; node?: TeiaNode; error?: string };
  if (!res.ok || !data.node) throw new Error(data.error || "Nó não encontrado");
  return data.node;
}

export async function apiCreateNode(payload: {
  title: string;
  type: TeiaNodeType;
  body?: string;
  tags?: string[];
  confidence?: number;
  source?: "user" | "ai";
}): Promise<{ id: string; path: string; raw: string }> {
  const res = await fetch("/api/teia/node", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { success: boolean; id: string; path: string; raw: string; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error || "Falha ao criar nota");
  return data;
}

export async function apiUpdateNode(id: string, raw: string): Promise<void> {
  const res = await fetch(`/api/teia/node/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ raw }),
  });
  const data = (await res.json()) as { success: boolean; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error || "Falha ao atualizar nota");
}

export async function apiDeleteNode(id: string): Promise<void> {
  const res = await fetch(`/api/teia/node/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const data = (await res.json()) as { success: boolean; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error || "Falha ao excluir nota");
}

export async function apiSaveMemory(payload: {
  title: string;
  content: string;
  type?: "memory" | "preference" | "decision";
  tags?: string[];
  links?: string;
}): Promise<string> {
  const res = await fetch("/api/teia/memory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { success: boolean; message: string; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error || "Falha ao salvar memória");
  return data.message;
}

export async function apiGetTeiaContext(query = ""): Promise<{ nodesCount: number; text: string }> {
  const res = await fetch(`/api/teia/context?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Falha ao construir contexto da Teia");
  return (await res.json()) as { nodesCount: number; text: string };
}

/**
 * Salva o arquivo de Canvas oficial do Obsidian (.canvas) diretamente no Desktop Vault
 */
export async function apiSaveObsidianCanvas(canvas: unknown): Promise<{ success: boolean; filePath: string }> {
  const res = await fetch("/api/teia/save-canvas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ canvas }),
  });
  const data = (await res.json()) as { success: boolean; filePath: string; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error || "Falha ao salvar Obsidian Canvas");
  return data;
}

/**
 * Salva o relatório GRAPH_REPORT.md diretamente no Desktop Vault
 */
export async function apiSaveGraphReport(markdown: string): Promise<{ success: boolean; filePath: string }> {
  const res = await fetch("/api/teia/save-report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markdown }),
  });
  const data = (await res.json()) as { success: boolean; filePath: string; error?: string };
  if (!res.ok || !data.success) throw new Error(data.error || "Falha ao salvar GRAPH_REPORT.md");
  return data;
}
