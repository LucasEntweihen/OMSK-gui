// Mente em Teia — interface. Editor, documentos e grafo são visões diferentes da mesma teia.
import { Teia } from './teia.js';
import { renderMarkdown, esc } from './md.js';

const $ = s => document.querySelector(s);
const slugify = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const api = async (url, body, method) => {
  const r = await fetch(url, { method: method || (body ? 'POST' : 'GET'), headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || r.statusText);
  return j;
};
const TRUST = {
  USER_VERIFIED: ['●', 'verificado por você', 'ok'], SOURCE_VERIFIED: ['●', 'verificado em fonte', 'ok'],
  AI_GENERATED: ['✦', 'gerado por IA', 'ai'], AI_INFERRED: ['✦', 'inferido por IA', 'ai'],
  UNVERIFIED: ['◌', 'não verificado', 'warn'], CONFLICTING: ['!', 'conflitante', 'bad'],
};
const glyph = n => (n.ghost ? '<i class="g faint">◌</i>' : `<i class="g ${TRUST[n.trust]?.[2] || ''}">${TRUST[n.trust]?.[0] || '●'}</i>`);
const badge = n => { const t = TRUST[n.trust]; return t ? `<span class="badge ${t[2]}">${t[0]} ${t[1]}</span>` : ''; };

const S = { graph: { nodes: [], edges: [], conflicts: [] }, byId: new Map(), known: new Map(), rev: 0, cur: null, sel: null, dirty: false, mode: 'preview', tab: 'ctx', agent: null };
const teia = new Teia($('#canvas'), { onSelect: id => select(id), onOpen: id => openNode(id) });

// ───────── dados ─────────
async function loadGraph() {
  S.graph = await api('/api/graph');
  S.rev = S.graph.revision;
  S.byId = new Map(S.graph.nodes.map(n => [n.id, n]));
  S.known = new Map();
  for (const n of S.graph.nodes) if (!n.ghost) for (const k of [n.id, n.title, ...(n.aliases || [])]) S.known.set(slugify(k), n);
  teia.setData(S.graph.nodes, S.graph.edges);
  renderTree(); renderTab();
}
const resolveLocal = ref => S.known.get(slugify(ref)) || S.graph.nodes.find(n => n.ghost && slugify(n.title) === slugify(ref)) || null;

// ───────── explorer ─────────
function renderTree() {
  const root = {};
  for (const n of S.graph.nodes) {
    if (n.ghost) continue;
    const parts = n.path.split('/'); let cur = root;
    for (const p of parts.slice(0, -1)) cur = cur[p] ||= { __files: [] };
    (cur.__files ||= []).push(n);
  }
  const leaf = n => `<button class="leaf${n.id === S.cur ? ' on' : ''}" data-id="${esc(n.id)}">${glyph(n)}<span>${esc(n.title)}</span></button>`;
  const dir = (name, node) => `<details open><summary>📁 ${esc(name)}</summary>${Object.keys(node).filter(k => k !== '__files').sort().map(k => dir(k, node[k])).join('')}${(node.__files || []).sort((a, b) => a.title.localeCompare(b.title)).map(leaf).join('')}</details>`;
  const top = Object.keys(root).filter(k => k !== '__files').sort().map(k => dir(k, root[k])).join('') + (root.__files || []).map(leaf).join('');
  const ghosts = S.graph.nodes.filter(n => n.ghost);
  $('#tree').innerHTML = top + (ghosts.length ? `<details><summary>◌ Pendentes (${ghosts.length})</summary>${ghosts.map(g => `<button class="leaf pending" data-id="${esc(g.id)}">${glyph(g)}<span>${esc(g.title)}</span></button>`).join('')}</details>` : '');
}
$('#tree').addEventListener('click', e => { const b = e.target.closest('.leaf'); if (b) openNode(b.dataset.id); });

// ───────── documento ─────────
async function openNode(id, { edit = false } = {}) {
  if (S.dirty && !confirm('Descartar as alterações não salvas?')) return;
  const n = S.byId.get(id) || resolveLocal(id);
  if (!n) return;
  if (n.ghost) return newDialog(n.title);
  const full = await api('/api/node/' + encodeURIComponent(n.id));
  S.cur = S.sel = full.id; S.node = full; S.dirty = false; S.mode = edit ? 'edit' : 'preview';
  $('#raw').value = full.raw;
  teia.setActive(full.id);
  renderEditor(); renderTree(); renderTab();
  document.body.dataset.pane = 'editor';
}
function renderEditor() {
  const n = S.node, has = !!n;
  $('#empty').hidden = has; $('#mode-btn').hidden = !has; $('#save-btn').hidden = !has;
  $('#raw').hidden = !has || S.mode !== 'edit'; $('#preview').hidden = !has || S.mode !== 'preview';
  $('#ed-title').textContent = has ? n.title : 'Nenhuma nota aberta';
  $('#ed-trust').innerHTML = has ? badge(n) : '';
  $('#mode-btn').textContent = S.mode === 'edit' ? 'Visualizar' : 'Editar';
  $('#save-btn').disabled = !S.dirty;
  if (has && S.mode === 'preview') $('#preview').innerHTML = renderMarkdown($('#raw').value, ref => !!S.known.get(slugify(ref)));
}
$('#mode-btn').onclick = () => { S.mode = S.mode === 'edit' ? 'preview' : 'edit'; renderEditor(); if (S.mode === 'edit') $('#raw').focus(); };
$('#raw').addEventListener('input', () => { S.dirty = true; $('#save-btn').disabled = false; });
async function save() {
  if (!S.cur || !S.dirty) return;
  await api('/api/node/' + encodeURIComponent(S.cur), { raw: $('#raw').value }, 'PUT');
  S.dirty = false;
  await loadGraph();
  S.node = await api('/api/node/' + encodeURIComponent(S.cur));
  renderEditor(); renderTab();
}
$('#save-btn').onclick = () => save().catch(e => alert(e.message));
$('#preview').addEventListener('click', e => { const a = e.target.closest('a.wl'); if (a) openNode(decodeURIComponent(a.dataset.ref)); });
$('#preview').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('a.wl')) e.target.click(); });

// prévia ao passar o cursor sobre [[links]] — uma janela para outra parte da teia
const hover = $('#hover'), previews = new Map();
$('#preview').addEventListener('mouseover', async e => {
  const a = e.target.closest('a.wl'); if (!a) return;
  const ref = decodeURIComponent(a.dataset.ref), box = a.getBoundingClientRect();
  if (!previews.has(ref)) previews.set(ref, await api('/api/preview/' + encodeURIComponent(ref)).catch(() => null));
  const p = previews.get(ref); if (!p || !a.matches(':hover')) return;
  hover.innerHTML = `<b>${esc(p.title)}</b> <span class="muted">${esc(p.type)}</span><p>${esc(p.snippet || '')}</p>` +
    (p.related.length ? `<p>Relacionados: ${p.related.map(esc).join(' · ')}</p>` : '') + `<p>Conexões: ${p.degree}</p>`;
  hover.hidden = false;
  hover.style.left = Math.min(box.left, innerWidth - 300) + 'px';
  hover.style.top = Math.min(box.bottom + 6, innerHeight - hover.offsetHeight - 8) + 'px';
});
$('#preview').addEventListener('mouseout', e => { if (e.target.closest('a.wl')) hover.hidden = true; });

// ───────── seleção na teia e painel de contexto ─────────
async function select(id) {
  teia.setActive(id);
  try { S.sel = id; S.selNode = await api('/api/node/' + encodeURIComponent(id)); S.related = null; renderTab(); loadRelated(id); } catch { /* nó removido */ }
}
async function loadRelated(id) {
  const n = S.byId.get(id); if (!n || n.ghost) return;
  const r = await api('/api/related/' + encodeURIComponent(id)).catch(() => []);
  if (S.sel === id) { S.related = r.filter(x => x.reason === 'similaridade'); if (S.tab === 'ctx') renderTab(); }
}
const relBtn = (x, arrow) => `<button class="rl${x.ghost ? ' pending' : ''}" data-open="${esc(x.id)}"><span class="ar">${arrow}</span><span class="r">${esc(x.relation)}${x.ai ? ' ✦' : ''}</span>${glyph(x)}<span>${esc(x.title)}</span></button>`;

function ctxHtml() {
  const n = S.selNode;
  if (!n) {
    const hubs = S.graph.nodes.filter(x => x.hub).sort((a, b) => b.degree - a.degree);
    const real = S.graph.nodes.filter(x => !x.ghost).length;
    return `<h3>A teia</h3><div class="kv">Notas<b>${real}</b></div><div class="kv">Conexões<b>${S.graph.edges.length}</b></div><div class="kv">Pendentes<b>${S.graph.nodes.length - real}</b></div>` +
      `<h4>Hubs</h4>${hubs.map(h => `<button class="rl" data-open="${esc(h.id)}">${glyph(h)}<span>${esc(h.title)}</span><span class="r">${h.degree}</span></button>`).join('') || '<span class="muted">Ainda sem hubs.</span>'}` +
      (S.graph.conflicts.length ? `<h4>Conflitos</h4>${S.graph.conflicts.map(c => `<div class="card"><span class="g bad">!</span> ${esc(c.reason)}</div>`).join('')}` : '');
  }
  const t = TRUST[n.trust];
  return `<h3>${esc(n.title)}</h3>${n.ghost ? '<p class="muted">Nota ainda não criada. Dê dois cliques no nó para escrevê-la.</p>' : ''}` +
    `<div class="kv">Tipo<b>${esc(n.type)}</b></div>` +
    (t ? `<div class="kv">Proveniência<b>${badge(n)}</b></div>` : '') +
    (n.confidence != null ? `<div class="kv">Confiança<b>${n.confidence}</b></div>` : '') +
    `<div class="kv">Conexões<b>${n.degree}${n.hub ? ' · hub' : ''}</b></div>` +
    (n.path ? `<div class="kv">Arquivo<b>${esc(n.path)}</b></div>` : '') +
    (n.conflictReasons?.length ? `<h4>Conflito</h4>${n.conflictReasons.map(r => `<div class="card"><span class="g bad">!</span> ${esc(r)}</div>`).join('')}` : '') +
    `<h4>Relações diretas</h4>${n.outgoing.map(x => relBtn(x, '→')).join('') || '<span class="muted">Nenhuma.</span>'}` +
    (n.backlinks.length ? `<h4>Backlinks</h4>${n.backlinks.map(x => relBtn(x, '←')).join('')}` : '') +
    (n.tags.length ? `<h4>Tags</h4>${n.tags.map(x => `<span class="tag">#${esc(x)}</span>`).join(' ')}` : '') +
    (S.related?.length ? `<h4>Conceitos parecidos</h4>${S.related.map(x => `<button class="rl" data-open="${esc(x.id)}"><span class="ar">≈</span>${esc(x.title)}<span class="r">${x.relevance}</span></button>`).join('')}` : '');
}

async function agentHtml() {
  const a = S.agent;
  let h = `<h3>Contexto do agente</h3><p class="muted">Veja a subteia que um agente recebe para uma pergunta: busca léxica + semântica + grafo, ordenada e cortada por orçamento.</p>` +
    `<div class="row"><input id="ag-q" placeholder="Ex.: melhorar o banco do Fluxar" value="${esc(a?.query || '')}" aria-label="Pergunta"><button id="ag-go" class="primary">Montar</button></div>`;
  if (a?.res) {
    h += `<h4>Nós incluídos (${a.res.nodes.length}) · ${a.res.chars} caracteres</h4>` +
      a.res.nodes.map(x => `<button class="rl" data-open="${esc(x.id)}">${glyph(x)}<span>${esc(x.title)}</span><span class="r">${x.seed ? 'semente ' : ''}${x.score}</span></button>`).join('') +
      (a.res.conflicts.length ? `<h4>Conflitos no contexto</h4>${a.res.conflicts.map(c => `<div class="card"><span class="g bad">!</span> ${esc(c)}</div>`).join('')}` : '') +
      `<h4>Texto entregue ao agente</h4><pre class="ctx">${esc(a.res.text)}</pre><button id="ag-copy">Copiar contexto</button>`;
  }
  return h + `<h4>Agentes externos</h4><p class="muted">Claude, Oh My Pi ou qualquer cliente MCP usam as mesmas ferramentas. Veja o README para configurar o servidor MCP.</p>`;
}

async function timeHtml() {
  const ev = await api('/api/events').catch(() => []);
  if (!ev.length) return '<h3>Timeline</h3><p class="muted">Ainda sem eventos. Crie, edite ou ligue notas e eles aparecerão aqui.</p>';
  return '<h3>Timeline</h3>' + ev.map(e => {
    const d = new Date(e.ts), n = S.byId.get(e.node);
    return `<div class="ev"><small>${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · ${esc(e.actor)}</small>${esc(e.type)} · ${n ? `<button class="rl" style="display:inline;width:auto;padding:0;margin:0" data-open="${esc(n.id)}">${esc(n.title)}</button>` : esc(e.node)}</div>`;
  }).join('');
}

async function propHtml() {
  const ps = await api('/api/proposals').catch(() => []);
  $('#prop-count').textContent = ps.length ? ps.length : '';
  if (!ps.length) return '<h3>Propostas</h3><p class="muted">Quando um agente quiser alterar uma nota que você verificou, a alteração aparece aqui para você aprovar ou rejeitar.</p>';
  return '<h3>Propostas de agentes</h3>' + ps.map(p => `<div class="card"><b>${esc(p.kind === 'delete' ? 'Excluir' : 'Alterar')} · ${esc(p.title)}</b><div class="muted">${esc(p.actor)}</div>` +
    `<pre>${p.diff.removed.map(l => `<span class="d-del">- ${esc(l)}</span>`).join('\n')}${p.diff.removed.length ? '\n' : ''}${p.diff.added.map(l => `<span class="d-add">+ ${esc(l)}</span>`).join('\n')}</pre>` +
    `<div class="row" style="margin-top:8px"><button class="primary" data-decide="approve" data-id="${esc(p.id)}">Aprovar</button><button data-decide="reject" data-id="${esc(p.id)}">Rejeitar</button></div></div>`).join('');
}

async function renderTab() {
  const body = $('#tab-body'), tab = S.tab;
  document.querySelectorAll('.tabs [role=tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  const html = tab === 'ctx' ? ctxHtml() : tab === 'agent' ? await agentHtml() : tab === 'time' ? await timeHtml() : await propHtml();
  if (tab !== S.tab) return;
  const keep = tab === 'agent' ? document.activeElement?.id : null;
  body.innerHTML = html;
  if (keep) document.getElementById(keep)?.focus();
}
$('.tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) { S.tab = b.dataset.tab; renderTab(); } });
$('#tab-body').addEventListener('click', async e => {
  const o = e.target.closest('[data-open]');
  if (o) { const id = o.dataset.open; return e.shiftKey || S.byId.get(id)?.ghost ? openNode(id) : (select(id), openNode(id)); }
  const d = e.target.closest('[data-decide]');
  if (d) { await api(`/api/proposals/${encodeURIComponent(d.dataset.id)}/${d.dataset.decide}`, {}).catch(x => alert(x.message)); await loadGraph(); if (S.cur) { S.node = await api('/api/node/' + encodeURIComponent(S.cur)); $('#raw').value = S.node.raw; renderEditor(); } return; }
  if (e.target.id === 'ag-go') return askAgent();
  if (e.target.id === 'ag-copy') navigator.clipboard?.writeText(S.agent.res.text);
});
$('#tab-body').addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'ag-q') askAgent(); });
async function askAgent() {
  const q = $('#ag-q').value.trim(); if (!q) return;
  S.agent = { query: q, res: await api('/api/context?query=' + encodeURIComponent(q)).catch(x => ({ nodes: [], conflicts: [], text: x.message, chars: 0 })) };
  teia.setHighlight(new Set(S.agent.res.nodes.map(n => n.id)));
  $('#clear-hl-btn').hidden = false;
  renderTab();
}
$('#clear-hl-btn').onclick = () => { teia.setHighlight(null); $('#clear-hl-btn').hidden = true; };

// ───────── nova nota ─────────
const dlg = $('#new-dlg');
function newDialog(title = '') { $('#new-title').value = title; dlg.showModal(); $('#new-title').focus(); }
$('#new-btn').onclick = () => newDialog();
$('#new-cancel').onclick = () => dlg.close();
$('#new-title').addEventListener('keydown', e => { if (e.key === 'Enter') $('#new-ok').click(); });
$('#new-ok').onclick = async () => {
  const title = $('#new-title').value.trim(); if (!title) return;
  try {
    const r = await api('/api/node', { title, type: $('#new-type').value });
    dlg.close(); S.dirty = false; await loadGraph(); await openNode(r.id, { edit: true });
  } catch (e) { alert(e.message); }
};

// ───────── paleta de comandos e busca ─────────
const pal = $('#palette'), palIn = $('#pal-input'), palList = $('#pal-list');
let P = { mode: 'cmd', items: [], sel: 0 }, timer = 0;
const COMMANDS = [
  ['Abrir teia imersiva', 'Ctrl+G', () => immersive()],
  ['Nova nota', '', () => newDialog()],
  ['Buscar conhecimento', 'Ctrl+K', () => setTimeout(() => openPalette('search'))],
  ['Perguntar ao agente (montar contexto)', '', () => { S.tab = 'agent'; renderTab(); document.body.dataset.pane = 'context'; }],
  ['Mostrar relacionados', '', () => { S.tab = 'ctx'; renderTab(); }],
  ['Vincular nós (relação tipada)', 'a nota aberta é a origem', linkCmd],
  ['Alternar foco da teia', '', () => toggleFocus()],
  ['Ajustar teia à tela', '', () => teia.fit()],
  ['Alternar edição / visualização', '', () => $('#mode-btn').click()],
  ['Salvar nota', 'Ctrl+S', () => save()],
  ['Reindexar vault', '', async () => { await api('/api/reindex', {}); await loadGraph(); }],
];
async function linkCmd() {
  if (!S.cur) return alert('Abra uma nota para usá-la como origem.');
  const relation = prompt('Relação (ex.: utiliza, depende-de, resolve, alternativa-a):', 'utiliza'); if (!relation) return;
  const target = prompt('Título da nota de destino:'); if (!target) return;
  try { await api('/api/link', { source: S.cur, target, relation }); await loadGraph(); S.node = await api('/api/node/' + encodeURIComponent(S.cur)); $('#raw').value = S.node.raw; renderEditor(); } catch (e) { alert(e.message); }
}
function openPalette(mode) {
  P = { mode, items: [], sel: 0 }; pal.hidden = false; palIn.value = '';
  palIn.placeholder = mode === 'cmd' ? 'Buscar comandos' : 'Buscar conhecimento: palavras, perguntas, relações';
  fill(); palIn.focus();
}
function fill() {
  const q = palIn.value.trim().toLowerCase();
  if (P.mode === 'cmd') P.items = COMMANDS.filter(c => c[0].toLowerCase().includes(q)).map(([label, hint, run]) => ({ label, hint, run }));
  drawPal();
}
function drawPal() {
  palList.innerHTML = P.items.map((it, i) => `<li role="option" data-i="${i}" aria-selected="${i === P.sel}"><span>${it.glyph || ''} ${esc(it.label)}</span>${it.hint ? `<small>${esc(it.hint)}</small>` : ''}</li>`).join('') || '<li class="muted">Nada encontrado.</li>';
}
palIn.addEventListener('input', () => {
  P.sel = 0;
  if (P.mode === 'cmd') return fill();
  clearTimeout(timer);
  timer = setTimeout(async () => {
    const q = palIn.value.trim(); if (!q) { P.items = []; return drawPal(); }
    const res = await api('/api/search?q=' + encodeURIComponent(q)).catch(() => []);
    P.items = res.map(r => ({ glyph: glyph(r), label: r.title, hint: `${r.type} · ${r.relevance}${r.via !== 'texto' ? ' · via ' + r.via : ''} · ${r.snippet}`, run: () => openNode(r.id) }));
    drawPal();
  }, 140);
});
palIn.addEventListener('keydown', e => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); P.sel = (P.sel + (e.key === 'ArrowDown' ? 1 : -1) + P.items.length) % (P.items.length || 1); drawPal(); palList.querySelector('[aria-selected=true]')?.scrollIntoView({ block: 'nearest' }); }
  else if (e.key === 'Enter') { const it = P.items[P.sel]; if (it) { pal.hidden = true; it.run(); } }
  else if (e.key === 'Escape') pal.hidden = true;
});
palList.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) { const it = P.items[+li.dataset.i]; pal.hidden = true; it.run(); } });
pal.addEventListener('mousedown', e => { if (e.target === pal) pal.hidden = true; });
$('#search-btn').onclick = () => openPalette('search');
$('#palette-btn').onclick = () => openPalette('cmd');

// ───────── teia: foco, imersão, atalhos ─────────
function immersive(force) {
  const on = force ?? !document.body.classList.contains('immersive');
  document.body.classList.toggle('immersive', on); $('#immersive-btn').setAttribute('aria-pressed', String(on));
  requestAnimationFrame(() => { teia.resize(); teia.settle(150); teia.fit(); });
}
function toggleFocus() { teia.setFocus(!teia.focus); $('#focus-btn').setAttribute('aria-pressed', String(teia.focus)); }
$('#immersive-btn').onclick = () => immersive();
$('#focus-btn').onclick = toggleFocus;
$('#fit-btn').onclick = () => teia.fit();
document.querySelectorAll('#mobile-nav button').forEach(b => b.onclick = () => { document.body.dataset.pane = b.dataset.pane; setTimeout(() => { teia.resize(); teia.settle(150); teia.fit(); }, 30); });

addEventListener('keydown', e => {
  const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
  if (mod && k === 'p') { e.preventDefault(); openPalette('cmd'); }
  else if (mod && k === 'k') { e.preventDefault(); openPalette('search'); }
  else if (mod && k === 'g') { e.preventDefault(); immersive(); }
  else if (mod && k === 's') { e.preventDefault(); save().catch(x => alert(x.message)); }
  else if (e.key === 'Escape' && document.body.classList.contains('immersive') && pal.hidden) immersive(false);
});
addEventListener('beforeunload', e => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

// ───────── sincronização: o vault pode mudar fora da aplicação (Obsidian, agentes via MCP) ─────────
setInterval(async () => {
  if (document.hidden) return;
  const r = await api('/api/revision').catch(() => null); if (!r) return;
  $('#prop-count').textContent = r.proposals || '';
  if (r.revision === S.rev) return;
  await loadGraph();
  if (S.cur && !S.dirty) {
    const n = await api('/api/node/' + encodeURIComponent(S.cur)).catch(() => null);
    if (n) { S.node = n; $('#raw').value = n.raw; renderEditor(); } else { S.cur = S.node = null; renderEditor(); }
  }
}, 2500);

await loadGraph();
renderEditor();
