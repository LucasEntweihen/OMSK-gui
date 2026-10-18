// Knowledge Engine: lê o vault Markdown, constrói nós/arestas/índices e expõe as operações usadas
// tanto pela interface web quanto pelos agentes (MCP). Markdown continua sendo a fonte da verdade.
import fs from 'node:fs';
import path from 'node:path';
import { parseNote, splitFrontmatter, stringifyFrontmatter, slug } from './markdown.js';
import { Index, fuse, RRF_K } from './search.js';

export const USER = { name: 'user', agent: false };
export const aiActor = name => ({ name: `ai:${name || 'agent'}`, agent: true });

export const TYPE_FOLDER = {
  concept: 'conceitos', person: 'pessoas', project: 'projetos', technology: 'tecnologias', language: 'tecnologias',
  document: 'referencias', reference: 'referencias', lesson: 'estudos', research: 'estudos', code: 'codigo',
  problem: 'problemas', solution: 'solucoes', idea: 'ideias', hypothesis: 'ideias', task: 'tarefas',
  decision: 'decisoes', experience: 'experiencias',
};
// Categorias em que um mesmo nó não deveria "utilizar" duas tecnologias ao mesmo tempo (heurística de conflito).
export const EXCLUSIVE_CATEGORIES = new Set(['banco-de-dados', 'framework-web']);

const today = () => new Date().toISOString().slice(0, 10);
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-');
const fail = (msg, status = 400) => Object.assign(new Error(msg), { status });
const asList = v => (Array.isArray(v) ? v : v ? [v] : []);

function touch(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m || !/^updated:/m.test(m[1])) return raw;
  const fm = m[1].replace(/^updated:.*$/m, `updated: ${today()}`);
  return raw.replace(m[1], () => fm);
}

function trustOf(n) {
  if (n.conflicting) return 'CONFLICTING';
  const src = String(n.meta.source || 'user'), ver = n.meta.verified === true;
  if (src === 'user') return ver ? 'USER_VERIFIED' : 'UNVERIFIED';
  if (src === 'ai') return ver ? 'USER_VERIFIED' : 'AI_GENERATED';
  if (src === 'ai-inferred') return ver ? 'USER_VERIFIED' : 'AI_INFERRED';
  return ver ? 'SOURCE_VERIFIED' : 'UNVERIFIED';
}

export class Engine {
  constructor({ root, dataDir } = {}) {
    this.root = path.resolve(root);
    this.data = path.resolve(dataDir || path.join(this.root, '..', '.teia'));
    fs.mkdirSync(this.root, { recursive: true });
    for (const d of ['versions', 'trash', 'proposals']) fs.mkdirSync(path.join(this.data, d), { recursive: true });
    this.sig = null; this.revision = 0;
    this.nodes = new Map(); this.edges = []; this.keys = new Map();
    this.out = new Map(); this.inc = new Map(); this.conflictList = [];
    this.index = new Index([]); this.chunksOf = new Map();
    this.ensureFresh();
  }

  // ───────── indexação ─────────
  scan() {
    const files = [];
    const walk = dir => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.')) continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.isFile() && /\.md$/i.test(e.name)) {
          const s = fs.statSync(p);
          files.push({ rel: path.relative(this.root, p).split(path.sep).join('/'), m: s.mtimeMs, size: s.size });
        }
      }
    };
    walk(this.root);
    return files.sort((a, b) => a.rel.localeCompare(b.rel));
  }

  // Reindexa só quando algo mudou em disco (vale também para edições feitas fora da aplicação, ex.: no Obsidian).
  ensureFresh() {
    const files = this.scan();
    const sig = files.map(f => `${f.rel}:${f.m}:${f.size}`).join('|');
    if (sig !== this.sig) { this.sig = sig; this.rebuild(files); }
  }
  reindex() { this.sig = null; this.ensureFresh(); return this.stats(); }

  rebuild(files) {
    const nodes = new Map(), keys = new Map(), taken = new Set();
    for (const f of files) {
      const raw = fs.readFileSync(path.join(this.root, f.rel), 'utf8');
      const n = parseNote(raw, f.rel);
      let id = n.id;
      for (let i = 2; taken.has(id); i++) id = `${n.id}-${i}`;
      taken.add(id);
      Object.assign(n, { id, raw, type: String(n.meta.type || 'idea'), created: String(n.meta.created || ''), ghost: false });
      n.updated = String(n.meta.updated || n.created);
      n.confidence = typeof n.meta.confidence === 'number' ? n.meta.confidence : null;
      nodes.set(id, n);
      const stem = f.rel.split('/').pop().replace(/\.md$/i, '');
      for (const k of [id, n.title, stem, ...asList(n.meta.aliases)]) { const s = slug(k); if (!keys.has(s)) keys.set(s, id); }
    }

    const edges = [], seen = new Set();
    const add = (s, t, relation, ai) => {
      const k = `${s}|${t}|${relation}`;
      if (s === t || seen.has(k)) return;
      seen.add(k); edges.push({ source: s, target: t, relation, ai: !!ai });
    };
    for (const n of [...nodes.values()]) {
      for (const l of n.links) {
        const s = slug(l.target);
        let tid = keys.get(s);
        if (!tid) { // link sem nota: vira nó "pendente" (fantasma) até alguém escrevê-la
          tid = 'ghost:' + s;
          if (!nodes.has(tid)) nodes.set(tid, { id: tid, title: l.target, type: 'pending', ghost: true, meta: {}, tags: [], sections: [], body: '', links: [], path: null, created: '', updated: '' });
        }
        add(n.id, tid, l.relation, l.ai);
      }
    }

    const out = new Map(), inc = new Map();
    nodes.forEach((_, id) => { out.set(id, []); inc.set(id, []); });
    edges.forEach(e => { out.get(e.source).push(e); inc.get(e.target).push(e); });
    let max = 0;
    nodes.forEach((n, id) => {
      n.degree = new Set([...out.get(id).map(e => e.target), ...inc.get(id).map(e => e.source)]).size;
      max = Math.max(max, n.degree);
    });
    const hubMin = Math.max(4, Math.ceil(max * 0.6));
    nodes.forEach(n => { n.hub = !n.ghost && n.degree >= hubMin; });

    // conflitos: explícitos (contradiz), status manual e heurística de categoria exclusiva
    const conflicts = [], bad = new Set();
    const mark = (a, b, reason) => { conflicts.push({ nodes: [a, b], reason }); bad.add(a); bad.add(b); };
    for (const e of edges) {
      if (e.relation === 'contradiz' || e.relation === 'conflita-com')
        mark(e.source, e.target, `${nodes.get(e.source).title} contradiz ${nodes.get(e.target).title}`);
    }
    const superseded = new Set(edges.filter(e => e.relation === 'substituido-por').map(e => e.source));
    const groups = new Map();
    for (const e of edges) {
      if (e.relation !== 'utiliza') continue;
      const t = nodes.get(e.target), cat = t.meta.category;
      if (!EXCLUSIVE_CATEGORIES.has(cat) || superseded.has(t.id) || ['deprecated', 'obsoleto'].includes(t.meta.status)) continue;
      const k = `${e.source}|${cat}`;
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(t.id);
    }
    for (const [k, ids] of groups) {
      if (new Set(ids).size < 2) continue;
      const [src, cat] = k.split('|');
      for (const id of new Set(ids)) mark(src, id, `${nodes.get(src).title} utiliza mais de uma tecnologia exclusiva (${cat}): ${nodes.get(id).title}`);
    }
    nodes.forEach(n => { if (n.meta.status === 'conflicting') bad.add(n.id); });
    nodes.forEach(n => { n.conflicting = bad.has(n.id); n.trust = n.ghost ? null : trustOf(n); });

    // chunks para o índice híbrido
    const chunks = [], chunksOf = new Map();
    for (const n of nodes.values()) {
      if (n.ghost) continue;
      for (const s of n.sections) {
        chunksOf.set(n.id, [...(chunksOf.get(n.id) || []), chunks.length]);
        chunks.push({ nodeId: n.id, heading: s.heading, text: s.text, index: `${n.title} ${n.tags.join(' ')} ${s.heading} ${s.text}` });
      }
    }
    Object.assign(this, { nodes, keys, edges, out, inc, conflictList: conflicts, chunksOf, index: new Index(chunks) });
    this.revision++;
  }

  stats() {
    const real = [...this.nodes.values()].filter(n => !n.ghost);
    return { revision: this.revision, nodes: real.length, pending: this.nodes.size - real.length, edges: this.edges.length, conflicts: this.conflictList.length, chunks: this.index.N };
  }

  // ───────── consulta ─────────
  resolve(ref) {
    if (!ref) return null;
    ref = String(ref).replace(/^\[\[|\]\]$/g, '').split('|')[0].trim();
    return this.nodes.get(ref) || this.nodes.get(this.keys.get(slug(ref))) || this.nodes.get('ghost:' + slug(ref)) || null;
  }
  real(ref) {
    this.ensureFresh();
    const n = this.resolve(ref);
    if (!n || n.ghost) throw fail(`Nó não encontrado: ${ref}`, 404);
    return n;
  }
  pub(n, extra = {}) {
    return {
      id: n.id, title: n.title, type: n.type, path: n.path, tags: n.tags, aliases: asList(n.meta.aliases),
      created: n.created, updated: n.updated, confidence: n.confidence,
      source: n.ghost ? null : String(n.meta.source || 'user'), verified: n.meta.verified === true,
      trust: n.trust, degree: n.degree, hub: n.hub, ghost: !!n.ghost, conflicting: !!n.conflicting, ...extra,
    };
  }
  edgeView(e, side) {
    const o = this.nodes.get(e[side]);
    return { id: o.id, title: o.title, type: o.type, relation: e.relation, ai: e.ai, ghost: !!o.ghost };
  }
  neighbors(id) {
    return [
      ...(this.out.get(id) || []).map(e => ({ id: e.target, relation: e.relation, dir: 'out', ai: e.ai })),
      ...(this.inc.get(id) || []).map(e => ({ id: e.source, relation: e.relation, dir: 'in', ai: e.ai })),
    ];
  }

  graph() {
    this.ensureFresh();
    return {
      revision: this.revision,
      nodes: [...this.nodes.values()].map(n => this.pub(n)),
      edges: this.edges,
      conflicts: this.conflictList.map(c => ({ nodes: c.nodes, reason: c.reason })),
    };
  }

  getNode(ref) {
    this.ensureFresh();
    const n = this.resolve(ref);
    if (!n) throw fail(`Nó não encontrado: ${ref}`, 404);
    return this.pub(n, {
      body: n.body, raw: n.raw,
      outgoing: this.out.get(n.id).map(e => this.edgeView(e, 'target')),
      backlinks: this.inc.get(n.id).map(e => this.edgeView(e, 'source')),
      conflictReasons: this.conflictList.filter(c => c.nodes.includes(n.id)).map(c => c.reason),
    });
  }

  preview(ref) {
    this.ensureFresh();
    const n = this.resolve(ref);
    if (!n) return { title: String(ref), type: 'pending', ghost: true, snippet: 'Nota ainda não criada.', related: [], degree: 0 };
    const snippet = n.sections.map(s => s.text).join(' ').replace(/\s+/g, ' ').replace(/[\p{L}-]+::[^\n]*/gu, '').slice(0, 160);
    const related = this.neighbors(n.id).map(x => this.nodes.get(x.id).title).filter((t, i, a) => a.indexOf(t) === i).slice(0, 4);
    return { title: n.title, type: n.type, ghost: !!n.ghost, trust: n.trust, snippet, related, degree: n.degree };
  }

  // Busca híbrida: lexical (BM25) + semântica (vetor local) + expansão pelo grafo + filtros de metadados.
  search(query, { mode = 'hybrid', limit = 8, type, tag, sinceDays, graph = true } = {}) {
    this.ensureFresh();
    const fused = fuse(this.index, String(query || ''), mode);
    const maxScore = (mode === 'hybrid' ? 2 : 1) / RRF_K;
    const since = sinceDays ? Date.now() - sinceDays * 864e5 : 0;
    const ok = id => {
      const n = this.nodes.get(id);
      return n && !n.ghost && (!type || n.type === type) && (!tag || n.tags.includes(String(tag).toLowerCase())) &&
        (!since || (Date.parse(n.updated || n.created || '') || 0) >= since);
    };
    const res = new Map([...fused].filter(([id]) => ok(id)).map(([id, e]) => [id, { score: e.score, chunk: e.chunk, via: 'texto' }]));
    const qs = slug(query || '');
    if (query) {
      for (const n of this.nodes.values()) {
        if (n.ghost || !ok(n.id)) continue;
        const names = [n.title, ...asList(n.meta.aliases)].map(slug).filter(s => s.length >= 3);
        const hit = names.includes(qs) ? 0.6 : names.some(s => `-${qs}-`.includes(`-${s}-`)) ? 0.25 : 0;
        if (!hit) continue;
        const cur = res.get(n.id);
        if (cur) cur.score += maxScore * hit;
        else res.set(n.id, { score: maxScore * hit * 0.8, chunk: this.chunksOf.get(n.id)?.[0], via: 'titulo' });
      }
    }
    if (graph && res.size) {
      const top = [...res.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, 3);
      for (const [id, r] of top) for (const nb of this.neighbors(id)) {
        if (!ok(nb.id)) continue;
        const bonus = r.score * 0.12, cur = res.get(nb.id);
        if (cur) cur.score += bonus;
        else res.set(nb.id, { score: bonus, chunk: this.chunksOf.get(nb.id)?.[0], via: 'grafo' });
      }
    }
    return [...res.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, limit).map(([id, r]) => {
      const n = this.nodes.get(id), c = this.index.chunks[r.chunk];
      const txt = c ? c.text.replace(/\s+/g, ' ').slice(0, 220) : '';
      return {
        id, title: n.title, type: n.type, path: n.path, trust: n.trust, via: r.via,
        relevance: Math.min(1, +(r.score / maxScore).toFixed(2)),
        snippet: c && c.heading && c.heading !== n.title ? `${c.heading}: ${txt}` : txt,
      };
    });
  }

  related(ref, limit = 8) {
    const n = this.real(ref);
    const direct = [];
    for (const nb of this.neighbors(n.id)) {
      const o = this.nodes.get(nb.id);
      if (!o.ghost && !direct.some(d => d.id === o.id)) direct.push({ id: o.id, title: o.title, type: o.type, relation: nb.relation, dir: nb.dir, reason: 'link' });
    }
    const seen = new Set([n.id, ...direct.map(d => d.id)]);
    const q = `${n.title} ${n.tags.join(' ')} ${n.sections.map(s => s.text).join(' ').slice(0, 600)}`;
    const similar = this.search(q, { mode: 'semantic', limit: limit + 4, graph: false })
      .filter(r => !seen.has(r.id)).map(r => ({ id: r.id, title: r.title, type: r.type, relevance: r.relevance, reason: 'similaridade' }));
    return [...direct, ...similar].slice(0, limit);
  }

  subgraph(ref, { depth = 2, relation } = {}) {
    const c = this.real(ref);
    const seen = new Map([[c.id, 0]]);
    let frontier = [c.id];
    for (let d = 1; d <= Math.min(depth, 4); d++) {
      const next = [];
      for (const id of frontier) for (const nb of this.neighbors(id)) {
        if (relation && nb.relation !== slug(relation)) continue;
        if (!seen.has(nb.id) && seen.size < 120) { seen.set(nb.id, d); next.push(nb.id); }
      }
      frontier = next;
    }
    const edges = this.edges.filter(e => seen.has(e.source) && seen.has(e.target) && (!relation || e.relation === slug(relation)));
    return {
      center: c.id,
      nodes: [...seen].map(([id, hop]) => ({ ...this.pub(this.nodes.get(id)), hop })).map(({ id, title, type, trust, ghost, hop }) => ({ id, title, type, trust, ghost, hop })),
      edges,
    };
  }

  // Context Builder: monta uma "subteia" relevante (não um diretório inteiro) dentro de um orçamento de caracteres.
  context({ query, node, budget = 6000, depth = 1, limit = 5 } = {}) {
    this.ensureFresh();
    let seeds;
    if (node) {
      const n = this.resolve(node);
      if (!n || n.ghost) throw fail(`Nó não encontrado: ${node}`, 404);
      seeds = [{ id: n.id, score: 1 }];
    } else if (query) seeds = this.search(query, { limit }).map(r => ({ id: r.id, score: r.relevance }));
    else throw fail('Informe "query" ou "node".');

    const picked = new Map(seeds.map(s => [s.id, { score: s.score, seed: true }]));
    let frontier = seeds.map(s => s.id);
    for (let hop = 1; hop <= Math.min(depth, 3); hop++) {
      const next = [];
      for (const id of frontier) for (const nb of this.neighbors(id)) {
        const n = this.nodes.get(nb.id);
        if (n.ghost) continue;
        const base = picked.get(id).score * 0.5 ** hop + (['decision', 'problem'].includes(n.type) ? 0.08 : 0) + (n.conflicting ? 0.1 : 0);
        const cur = picked.get(nb.id);
        if (!cur) { picked.set(nb.id, { score: base }); next.push(nb.id); }
        else if (!cur.seed && base > cur.score) cur.score = base;
      }
      frontier = next;
    }
    const parts = [], included = [];
    let used = 0;
    for (const [id, info] of [...picked].sort((a, b) => b[1].score - a[1].score)) {
      const n = this.nodes.get(id), room = budget - used;
      if (room < 250) break;
      const head = `## [${n.type}] ${n.title} · ${n.trust}${n.confidence != null ? ` · confiança ${n.confidence}` : ''}${n.conflicting ? ' · ⚠ CONFLITO' : ''}\n(${n.path})\n`;
      const text = head + n.body.replace(/^#\s+.*\n+/, '').trim().slice(0, Math.min(info.seed ? 1500 : 650, room - 120)) + '\n';
      parts.push(text); used += text.length;
      included.push({ id, title: n.title, type: n.type, trust: n.trust, score: +info.score.toFixed(2), seed: !!info.seed });
    }
    const ids = new Set(included.map(i => i.id));
    const edges = this.edges.filter(e => ids.has(e.source) && ids.has(e.target));
    const conflicts = this.conflictList.filter(c => c.nodes.some(i => ids.has(i)));
    const rel = edges.map(e => `- ${this.nodes.get(e.source).title} —${e.relation}→ ${this.nodes.get(e.target).title}${e.ai ? ' ✦' : ''}`);
    const text = [
      '# Contexto da Teia',
      query ? `Consulta: ${query}` : `Nó: ${this.nodes.get(seeds[0].id).title}`,
      `Nós: ${included.length}. Atenção: conteúdo AI_GENERATED/AI_INFERRED/UNVERIFIED não foi verificado por humano.`,
      '', ...parts,
      rel.length ? '## Relações entre os nós\n' + rel.join('\n') : '',
      conflicts.length ? '\n## ⚠ Conflitos\n' + conflicts.map(c => `- ${c.reason}`).join('\n') : '',
    ].filter(x => x !== '').join('\n');
    return { text, nodes: included, edges, conflicts: conflicts.map(c => c.reason), chars: text.length };
  }

  conflicts() { this.ensureFresh(); return this.conflictList.map(c => ({ nodes: c.nodes.map(i => this.nodes.get(i).title), reason: c.reason })); }

  // ───────── escrita (com proveniência, versionamento e eventos) ─────────
  abs(rel) {
    const p = path.resolve(this.root, rel);
    if (!p.startsWith(this.root + path.sep) || !/\.md$/i.test(p)) throw fail('Caminho inválido.');
    return p;
  }
  write(rel, text) {
    const p = this.abs(rel);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const tmp = `${p}.tmp-${process.pid}`;
    fs.writeFileSync(tmp, text);
    fs.renameSync(tmp, p);
    this.sig = null;
  }
  snapshot(n) {
    const dir = path.join(this.data, 'versions', n.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(this.abs(n.path), path.join(dir, `${stamp()}.md`));
  }
  log(type, node, actor, detail = {}) {
    fs.appendFileSync(path.join(this.data, 'events.jsonl'), JSON.stringify({ ts: new Date().toISOString(), type, node, actor: actor?.name || 'system', ...detail }) + '\n');
  }

  createNode({ title, type = 'idea', body = '', tags = [], folder, confidence, meta: extra = {} }, actor = USER) {
    this.ensureFresh();
    title = String(title || '').trim();
    if (!title) throw fail('Título obrigatório.');
    const ex = this.nodes.get(this.keys.get(slug(title)));
    if (ex) throw fail(`Já existe uma nota com esse título (${ex.path}). Use update_node.`, 409);
    const dir = String(folder || TYPE_FOLDER[type] || 'inbox').replace(/[^\w/-]/g, '').replace(/^\/+|\/+$/g, '') || 'inbox';
    let id = slug(title), rel = `${dir}/${id}.md`;
    for (let i = 2; this.nodes.has(id) || fs.existsSync(this.abs(rel)); i++) { id = `${slug(title)}-${i}`; rel = `${dir}/${id}.md`; }
    const base = { id, type, title, created: today(), updated: today(), tags: [...new Set(asList(tags).map(slug))] };
    const prov = actor.agent
      ? { confidence: Math.min(+confidence || 0.6, 0.9), source: 'ai', verified: false, created_by: actor.name }
      : { confidence: 1, source: 'user', verified: true };
    const meta = actor.agent ? { ...base, ...extra, ...prov } : { ...base, ...prov, ...extra };
    const text = /^#\s/m.test(body) ? body : `# ${title}\n\n${body}`;
    this.write(rel, stringifyFrontmatter(meta) + text.trimEnd() + '\n');
    this.log('NodeCreated', id, actor, { path: rel });
    this.ensureFresh();
    return { id, path: rel, status: 'created' };
  }

  updateNode(ref, patch = {}, actor = USER) {
    const n = this.real(ref);
    let raw;
    if (typeof patch.raw === 'string' && !actor.agent) raw = touch(patch.raw);
    else {
      const { meta, body } = splitFrontmatter(n.raw);
      let next = typeof patch.body === 'string' ? patch.body : body;
      if (patch.append) next = next.trimEnd() + '\n\n' + String(patch.append).trim() + '\n';
      const m = Object.keys(meta).length ? { ...meta } : { id: n.id, type: n.type, title: n.title, created: today() };
      const ext = { ...(patch.meta || {}) };
      if (patch.tags) ext.tags = asList(patch.tags).map(slug);
      if (patch.confidence !== undefined) ext.confidence = patch.confidence;
      if (actor.agent) { for (const k of ['verified', 'source', 'created_by', 'id']) delete ext[k]; m.last_edited_by = actor.name; }
      raw = stringifyFrontmatter({ ...m, ...ext, updated: today() }) + next.replace(/^\n+/, '');
    }
    // Conhecimento verificado por um humano é crítico: agentes só podem *propor* alterações.
    if (actor.agent && n.meta.verified === true) return this.propose({ kind: 'update', node: n.id, raw, actor });
    this.snapshot(n);
    this.write(n.path, raw);
    this.log('NodeUpdated', n.id, actor);
    this.ensureFresh();
    return { id: n.id, status: 'updated' };
  }

  deleteNode(ref, actor = USER) {
    const n = this.real(ref);
    if (actor.agent && n.meta.verified === true) return this.propose({ kind: 'delete', node: n.id, actor });
    const dest = path.join(this.data, 'trash', `${stamp()}-${n.id}.md`);
    fs.copyFileSync(this.abs(n.path), dest);
    fs.unlinkSync(this.abs(n.path));
    this.sig = null;
    this.log('NodeDeleted', n.id, actor, { trash: path.basename(dest) });
    this.ensureFresh();
    return { id: n.id, status: 'deleted', recoverable: path.relative(path.dirname(this.data), dest) };
  }

  // Adiciona `relacao:: [[Alvo]]` na seção "## Relações" da nota de origem. Relações de agentes recebem ✦.
  linkNodes({ source, target, relation = 'relaciona-se-com' }, actor = USER) {
    const s = this.real(source), t = this.resolve(target);
    const rel = slug(relation);
    if (t && this.out.get(s.id).some(e => e.target === t.id && e.relation === rel)) return { status: 'exists' };
    const title = t ? t.title : String(target).trim();
    if (!title) throw fail('Alvo obrigatório.');
    const line = `- ${rel}:: [[${title}]]${actor.agent ? ' ✦' : ''}`;
    const lines = s.raw.replace(/\s+$/, '').split('\n');
    const i = lines.findIndex(l => /^##\s+Rela(ç|c)(õ|o)es\s*$/i.test(l));
    if (i < 0) lines.push('', '## Relações', line);
    else {
      let j = i + 1;
      while (j < lines.length && !/^#{1,6}\s/.test(lines[j])) j++;
      while (j > i + 1 && lines[j - 1].trim() === '') j--;
      lines.splice(j, 0, line);
    }
    this.snapshot(s);
    this.write(s.path, touch(lines.join('\n') + '\n'));
    this.log('NodeLinked', s.id, actor, { target: title, relation: rel });
    this.ensureFresh();
    return { status: 'linked', relation: rel, source: s.title, target: title };
  }

  recordDecision({ title, decision, reason = '', alternatives = [], result = '', project }, actor = USER) {
    if (!decision) throw fail('Informe a decisão.');
    this.ensureFresh();
    const alts = asList(alternatives);
    const body = ['## Decisão', decision, '', '## Motivo', reason || '—', '', '## Alternativas', ...(alts.length ? alts.map(a => `- ${a}`) : ['—']), '', '## Resultado', result || decision];
    if (project) {
      const p = this.resolve(project);
      body.push('', '## Relações', `- decide-sobre:: [[${p ? p.title : project}]]${actor.agent ? ' ✦' : ''}`);
    }
    const r = this.createNode({ title, type: 'decision', body: body.join('\n'), tags: ['decisao'], meta: { date: today() } }, actor);
    this.log('DecisionRecorded', r.id, actor, { project: project || null });
    return r;
  }

  // ───────── propostas (aprovação humana) ─────────
  propose({ kind, node, raw, actor }) {
    const id = `${Date.now().toString(36)}-${slug(node).slice(0, 24)}`;
    const p = { id, kind, node, raw, actor: actor.name, created: new Date().toISOString(), status: 'pending' };
    fs.writeFileSync(path.join(this.data, 'proposals', `${id}.json`), JSON.stringify(p, null, 2));
    this.log('ProposalCreated', node, actor, { proposal: id, kind });
    return { status: 'pending_human_approval', proposal: id, message: 'Este nó foi verificado pelo usuário: a alteração ficou como proposta e aguarda aprovação humana.' };
  }
  proposals(status = 'pending') {
    const dir = path.join(this.data, 'proposals');
    return fs.readdirSync(dir).filter(f => f.endsWith('.json'))
      .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
      .filter(p => !status || p.status === status)
      .sort((a, b) => b.created.localeCompare(a.created))
      .map(({ raw, ...p }) => {
        const cur = new Set((this.nodes.get(p.node)?.raw || '').split('\n'));
        const nxt = new Set((raw || '').split('\n'));
        const diff = p.kind === 'delete' ? { removed: ['(nota inteira)'], added: [] }
          : { removed: [...cur].filter(l => l.trim() && !nxt.has(l)).slice(0, 30), added: [...nxt].filter(l => l.trim() && !cur.has(l)).slice(0, 30) };
        return { ...p, title: this.nodes.get(p.node)?.title || p.node, diff };
      });
  }
  decide(id, approve) {
    const file = path.join(this.data, 'proposals', `${String(id).replace(/[^\w-]/g, '')}.json`);
    if (!fs.existsSync(file)) throw fail('Proposta não encontrada.', 404);
    const p = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (p.status !== 'pending') throw fail('Proposta já resolvida.', 409);
    if (approve) {
      const n = this.real(p.node);
      if (p.kind === 'delete') this.deleteNode(n.id, USER);
      else { this.snapshot(n); this.write(n.path, p.raw); this.log('NodeUpdated', n.id, USER, { via: 'proposal', proposal: p.id, proposedBy: p.actor }); }
    }
    p.status = approve ? 'approved' : 'rejected';
    p.resolved = new Date().toISOString();
    fs.writeFileSync(file, JSON.stringify(p, null, 2));
    this.log(approve ? 'ProposalApproved' : 'ProposalRejected', p.node, USER, { proposal: p.id });
    this.ensureFresh();
    return { status: p.status };
  }

  // ───────── histórico ─────────
  events(limit = 100) {
    const f = path.join(this.data, 'events.jsonl');
    if (!fs.existsSync(f)) return [];
    return fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).slice(-limit).reverse()
      .map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  }
  history(ref) {
    this.ensureFresh();
    const n = this.resolve(ref);
    if (!n) throw fail(`Nó não encontrado: ${ref}`, 404);
    const dir = path.join(this.data, 'versions', n.id);
    const versions = fs.existsSync(dir) ? fs.readdirSync(dir).sort().reverse().map(file => ({ file, bytes: fs.statSync(path.join(dir, file)).size })) : [];
    return { id: n.id, title: n.title, versions, events: this.events(500).filter(e => e.node === n.id).slice(0, 30) };
  }
}
