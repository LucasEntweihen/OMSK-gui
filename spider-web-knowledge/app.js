// Parser Markdown da Teia: frontmatter (subconjunto de YAML), wikilinks, relações tipadas, tags e seções.
// Zero dependências. O Markdown é sempre a fonte da verdade; tudo o mais é derivado.

export const strip = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
export const slug = s => strip(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'sem-titulo';

function scalar(v) {
  v = v.trim();
  if (v === '') return '';
  if (/^(true|false)$/i.test(v)) return v.toLowerCase() === 'true';
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (/^(["']).*\1$/.test(v)) return v.slice(1, -1);
  if (v.startsWith('[') && v.endsWith(']')) return v.slice(1, -1).split(',').map(scalar).filter(x => x !== '');
  return v;
}

export function splitFrontmatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && key) { (Array.isArray(meta[key]) ? meta[key] : (meta[key] = [])).push(scalar(item[1])); continue; }
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (kv) { key = kv[1]; meta[key] = kv[2] === '' ? [] : scalar(kv[2]); }
  }
  return { meta, body: raw.slice(m[0].length) };
}

export function stringifyFrontmatter(meta) {
  const out = ['---'];
  for (const [k, v] of Object.entries(meta)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      if (!v.length) out.push(`${k}: []`);
      else { out.push(`${k}:`); v.forEach(x => out.push(`  - ${x}`)); }
    } else out.push(`${k}: ${v}`);
  }
  out.push('---', '');
  return out.join('\n');
}

const FENCE = /```[\s\S]*?```|~~~[\s\S]*?~~~/g;
const INLINE_CODE = /`[^`\n]*`/g;
const WIKI = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;
const REL = /^[\s>*+-]*([\p{L}][\p{L}\p{N}_-]*)::\s*(.+)$/u;
const TAG = /(?:^|\s)#([\p{L}][\p{L}\p{N}_/-]*)/gu;

// Extrai links tipados (`relacao:: [[Alvo]]`), links simples (`[[Alvo]]`) e tags (#tag). Código é ignorado.
// Um ✦ no fim da linha marca a relação como criada por IA.
export function analyze(body) {
  const clean = body.replace(FENCE, m => m.replace(/[^\n]/g, ' ')).replace(INLINE_CODE, m => ' '.repeat(m.length));
  const links = [];
  const typed = new Set();
  for (const line of clean.split('\n')) {
    const rel = line.match(REL);
    if (!rel) continue;
    const ai = /✦\s*$/.test(rel[2]);
    for (const m of rel[2].matchAll(WIKI)) {
      links.push({ target: m[1].trim(), relation: slug(rel[1]), ai });
      typed.add(slug(m[1]));
    }
  }
  const seen = new Set();
  for (const m of clean.matchAll(WIKI)) {
    const t = m[1].trim(), k = slug(t);
    if (!typed.has(k) && !seen.has(k)) { seen.add(k); links.push({ target: t, relation: 'relaciona-se-com', ai: false }); }
  }
  const tags = new Set();
  for (const m of clean.matchAll(TAG)) tags.add(m[1].toLowerCase());
  return { links, tags: [...tags] };
}

export function sections(body, fallbackTitle = '') {
  const out = [];
  let cur = { heading: fallbackTitle, lines: [] };
  let fence = false;
  for (const line of body.split('\n')) {
    if (/^(```|~~~)/.test(line)) fence = !fence;
    const h = !fence && line.match(/^(#{1,6})\s+(.*)$/);
    if (h) { out.push(cur); cur = { heading: h[2].trim(), lines: [] }; } else cur.lines.push(line);
  }
  out.push(cur);
  return out.map(s => ({ heading: s.heading, text: s.lines.join('\n').trim() })).filter(s => s.text);
}

export function parseNote(raw, relPath) {
  const { meta, body } = splitFrontmatter(raw);
  const stem = relPath.split('/').pop().replace(/\.md$/i, '');
  const h1 = body.match(/^#\s+(.+)$/m);
  const title = String(meta.title || (h1 && h1[1].trim()) || stem);
  const { links, tags: inline } = analyze(body);
  const fmTags = (Array.isArray(meta.tags) ? meta.tags : meta.tags ? [meta.tags] : []).map(t => String(t).toLowerCase());
  return {
    id: String(meta.id || slug(stem)), title, meta, body, path: relPath, links,
    tags: [...new Set([...fmTags, ...inline])],
    sections: sections(body, title),
  };
}
