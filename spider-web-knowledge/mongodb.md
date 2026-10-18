// Knowledge Web — a teia desenhada proceduralmente (Canvas 2D) com física de força direcionada.
// Hubs têm mais massa e gravidade; fios são curvas tensionadas; o foco ilumina a subteia do nó ativo.
// Para > ~1.500 nós, troque o renderizador por WebGL/PixiJS e a repulsão por Barnes-Hut (ver README).
const C = { node: '#d8dce5', active: '#ffffff', hub: '#b8c0ff', accent: '#7a82e6', warn: '#d29922', bad: '#f85149', ai: '#c6a8ff', muted: '#8b949e', edge: '180,188,220' };
const TAU = Math.PI * 2;
const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };

export function stepPhysics(nodes, edges, alpha, aspect = 1) {
  const n = nodes.length;
  for (let i = 0; i < n; i++) {
    const p = nodes[i];
    for (let j = i + 1; j < n; j++) {
      const q = nodes[j];
      let dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
      if (d2 > 360000) continue;
      if (d2 < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 1; }
      const d = Math.sqrt(d2);
      const m = (1 + 0.08 * Math.min(p.degree, 10)) * (1 + 0.08 * Math.min(q.degree, 10)); // repulsão ∝ 1/r², hubs pesam mais
      const f = (2600 * m * alpha) / d2, fx = (dx / d) * f, fy = (dy / d) * f;
      p.vx += fx; p.vy += fy; q.vx -= fx; q.vy -= fy;
    }
  }
  for (const e of edges) { // tensão do fio: F = -k·Δx
    const dx = e.t.x - e.s.x, dy = e.t.y - e.s.y, d = Math.hypot(dx, dy) || 1;
    const f = (d - (85 + (e.s.r + e.t.r) * 2.5)) * 0.035 * alpha, fx = (dx / d) * f, fy = (dy / d) * f;
    e.s.vx += fx; e.s.vy += fy; e.t.vx -= fx; e.t.vy -= fy;
  }
  for (const p of nodes) { // gravidade ao centro: hubs puxam mais
    const g = 0.01 * alpha * (1 + 0.25 * Math.min(p.degree, 8));
    p.vx -= (p.x * g) / aspect; p.vy -= p.y * g * aspect; // painel largo => teia mais larga que alta
    p.vx *= 0.8; p.vy *= 0.8;
    const sp = Math.hypot(p.vx, p.vy);
    if (sp > 25) { p.vx *= 25 / sp; p.vy *= 25 / sp; }
    if (p.pinned) p.vx = p.vy = 0; else { p.x += p.vx; p.y += p.vy; }
  }
}

export class Teia {
  constructor(canvas, handlers = {}) {
    Object.assign(this, { cv: canvas, ctx: canvas.getContext('2d'), h: handlers, nodes: [], edges: [], map: new Map(), adj: new Map(),
      cam: { x: 0, y: 0, k: 1 }, alpha: 0, active: null, hover: null, focus: true, highlight: null, raf: 0, fitted: false, w: 300, hgt: 200, fading: false });
    this.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.bind();
    new ResizeObserver(() => { this.resize(); this.requestDraw(); }).observe(canvas.parentElement);
    this.resize();
  }

  resize() {
    const r = this.cv.parentElement.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    this.w = Math.max(r.width, 1); this.hgt = Math.max(r.height, 1);
    this.aspect = Math.sqrt(Math.min(Math.max(this.w / this.hgt, 1), 4));
    this.cv.width = this.w * dpr; this.cv.height = this.hgt * dpr; this.dpr = dpr;
  }

  setData(nodes, edges) {
    const old = this.map;
    this.map = new Map();
    this.nodes = nodes.map((n, i) => {
      const o = old.get(n.id), a = (i / Math.max(nodes.length, 1)) * TAU, rad = 40 + Math.sqrt(nodes.length) * 30;
      const m = { ...n, x: o ? o.x : Math.cos(a) * rad + (Math.random() - 0.5) * 20, y: o ? o.y : Math.sin(a) * rad + (Math.random() - 0.5) * 20, vx: 0, vy: 0, fade: o ? o.fade : 1, pinned: false };
      m.r = (n.ghost ? 3.5 : 4.5) + Math.sqrt(n.degree || 0) * 1.8 + (n.hub ? 3 : 0);
      this.map.set(n.id, m);
      return m;
    });
    this.edges = edges.filter(e => this.map.has(e.source) && this.map.has(e.target)).map(e => {
      const h = hash(e.source + e.target);
      return { ...e, s: this.map.get(e.source), t: this.map.get(e.target), bend: (h % 2 ? 1 : -1) * (0.06 + (h % 5) * 0.02) };
    });
    this.adj = new Map(this.nodes.map(n => [n.id, new Set()]));
    this.edges.forEach(e => { this.adj.get(e.source).add(e.target); this.adj.get(e.target).add(e.source); });
    if (!this.fitted && this.nodes.length) { this.settle(300); this.fit(); this.fitted = true; } else this.reheat(old.size ? 0.35 : 1);
    this.requestDraw();
  }

  settle(n) { let a = 1; for (let i = 0; i < n; i++) { stepPhysics(this.nodes, this.edges, a, this.aspect); a *= 0.985; } this.alpha = 0; }
  reheat(a) { if (this.reduced) this.settle(150); else { this.alpha = Math.max(this.alpha, a); this.requestDraw(); } }

  fit() {
    if (!this.nodes.length) return;
    const xs = this.nodes.map(n => n.x), ys = this.nodes.map(n => n.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const k = Math.min(this.w / (x1 - x0 + 180), this.hgt / (y1 - y0 + 150), 2);
    this.cam = { k, x: -((x0 + x1) / 2) * k, y: -((y0 + y1) / 2) * k };
    this.requestDraw();
  }
  setActive(id) {
    this.active = id; this.requestDraw();
    const n = this.map.get(id);
    if (!n) return;
    const sx = this.w / 2 + this.cam.x + n.x * this.cam.k, sy = this.hgt / 2 + this.cam.y + n.y * this.cam.k;
    if (sx < 30 || sy < 30 || sx > this.w - 30 || sy > this.hgt - 30) { this.cam.x = -n.x * this.cam.k; this.cam.y = -n.y * this.cam.k; }
  }
  setHighlight(ids) { this.highlight = ids && ids.size ? ids : null; this.requestDraw(); }
  setFocus(on) { this.focus = on; this.requestDraw(); }

  toWorld(px, py) { return { x: (px - this.w / 2 - this.cam.x) / this.cam.k, y: (py - this.hgt / 2 - this.cam.y) / this.cam.k }; }
  hit(px, py) {
    const p = this.toWorld(px, py);
    let best = null, bd = Infinity;
    for (const n of this.nodes) { const d = Math.hypot(n.x - p.x, n.y - p.y); if (d < n.r + 5 / this.cam.k && d < bd) { best = n; bd = d; } }
    return best;
  }

  bind() {
    const cv = this.cv;
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    let drag = null;
    cv.addEventListener('pointerdown', e => {
      cv.setPointerCapture(e.pointerId);
      const [x, y] = pos(e), n = this.hit(x, y);
      drag = { n, x, y, moved: false, cx: this.cam.x, cy: this.cam.y };
      if (n) { n.pinned = true; cv.style.cursor = 'grabbing'; }
    });
    cv.addEventListener('pointermove', e => {
      const [x, y] = pos(e);
      if (drag) {
        if (Math.hypot(x - drag.x, y - drag.y) > 3) drag.moved = true;
        if (drag.n && drag.moved) { const w = this.toWorld(x, y); drag.n.x = w.x; drag.n.y = w.y; this.reheat(0.3); }
        else if (!drag.n) { this.cam.x = drag.cx + x - drag.x; this.cam.y = drag.cy + y - drag.y; }
        this.requestDraw();
      } else {
        const n = this.hit(x, y), id = n ? n.id : null;
        if (id !== this.hover) { this.hover = id; cv.style.cursor = n ? 'pointer' : 'grab'; this.requestDraw(); }
      }
    });
    const up = () => {
      if (!drag) return;
      if (drag.n) { drag.n.pinned = false; if (!drag.moved) this.h.onSelect?.(drag.n.id); }
      cv.style.cursor = this.hover ? 'pointer' : 'grab'; drag = null;
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('pointerleave', () => { if (!drag && this.hover) { this.hover = null; this.requestDraw(); } });
    cv.addEventListener('dblclick', e => { const n = this.hit(...pos(e)); if (n) this.h.onOpen?.(n.id); });
    cv.addEventListener('wheel', e => {
      e.preventDefault();
      const [px, py] = pos(e), w = this.toWorld(px, py), k = Math.min(4, Math.max(0.15, this.cam.k * Math.exp(-e.deltaY * 0.0015)));
      this.cam = { k, x: px - this.w / 2 - w.x * k, y: py - this.hgt / 2 - w.y * k };
      this.requestDraw();
    }, { passive: false });
    cv.addEventListener('keydown', e => {
      if (e.key === '+' || e.key === '=') { this.cam.k = Math.min(4, this.cam.k * 1.2); }
      else if (e.key === '-') { this.cam.k = Math.max(0.15, this.cam.k / 1.2); }
      else if (e.key === '0') this.fit();
      else if (e.key === 'Enter' && this.active) this.h.onOpen?.(this.active);
      this.requestDraw();
    });
  }

  requestDraw() { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.frame(); }); }
  frame() {
    let moving = false;
    if (this.alpha > 0.02) { stepPhysics(this.nodes, this.edges, this.alpha, this.aspect); this.alpha *= 0.985; moving = true; }
    this.draw();
    if (moving || this.fading) this.requestDraw();
  }

  draw() {
    const { ctx, cam } = this, k = cam.k;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.hgt);
    if (!this.nodes.length) return this.latent();
    const focusId = this.hover || this.active;
    const set = focusId && this.focus ? new Set([focusId, ...(this.adj.get(focusId) || [])]) : null;
    this.fading = false;
    for (const n of this.nodes) {
      const target = this.highlight ? (this.highlight.has(n.id) ? 1 : 0.14) : set ? (set.has(n.id) ? 1 : 0.2) : 1;
      n.fade = this.reduced ? target : n.fade + (target - n.fade) * 0.22;
      if (Math.abs(target - n.fade) > 0.01) this.fading = true;
    }
    ctx.save();
    ctx.translate(this.w / 2 + cam.x, this.hgt / 2 + cam.y);
    ctx.scale(k, k);

    for (const e of this.edges) { // fios
      const on = focusId && (e.source === focusId || e.target === focusId);
      const a = Math.min(e.s.fade, e.t.fade);
      const mx = (e.s.x + e.t.x) / 2, my = (e.s.y + e.t.y) / 2, dx = e.t.x - e.s.x, dy = e.t.y - e.s.y;
      const cx = mx - dy * e.bend, cy = my + dx * e.bend;
      ctx.beginPath(); ctx.moveTo(e.s.x, e.s.y); ctx.quadraticCurveTo(cx, cy, e.t.x, e.t.y);
      ctx.setLineDash(e.ai ? [4 / k, 3 / k] : []);
      ctx.strokeStyle = on ? `rgba(122,130,230,${0.9 * a})` : `rgba(${C.edge},${(set ? 0.2 : 0.26) * a})`;
      ctx.lineWidth = (on ? 1.7 : 0.9) / k;
      ctx.stroke(); ctx.setLineDash([]);
      if (on) { // seta e rótulo da relação
        const ux = e.t.x - cx, uy = e.t.y - cy, ul = Math.hypot(ux, uy) || 1, s = 7 / k;
        const tx = e.t.x - (ux / ul) * (e.t.r + 2 / k), ty = e.t.y - (uy / ul) * (e.t.r + 2 / k);
        ctx.fillStyle = `rgba(122,130,230,${a})`; ctx.beginPath(); ctx.moveTo(tx, ty);
        ctx.lineTo(tx - (ux / ul) * s - (uy / ul) * s * 0.5, ty - (uy / ul) * s + (ux / ul) * s * 0.5);
        ctx.lineTo(tx - (ux / ul) * s + (uy / ul) * s * 0.5, ty - (uy / ul) * s - (ux / ul) * s * 0.5); ctx.fill();
      }
      if ((on && (this.hover ? k > 0.8 : k > 1.2)) || k > 2.2) { // rótulos só ao passar o mouse (ou com zoom), para não poluir
        ctx.font = `${10.5 / k}px Inter, system-ui, sans-serif`; ctx.textAlign = 'center';
        ctx.fillStyle = on ? `rgba(184,192,255,${a})` : `rgba(139,148,158,${0.7 * a})`;
        ctx.fillText(e.relation, 0.25 * e.s.x + 0.5 * cx + 0.25 * e.t.x, 0.25 * e.s.y + 0.5 * cy + 0.25 * e.t.y - 3 / k);
      }
    }
    for (const n of [...this.nodes].sort((a, b) => a.fade - b.fade)) this.drawNode(n, k, set);
    ctx.restore();
  }

  drawNode(n, k, set) {
    const { ctx } = this, act = n.id === this.active, rel = !!(this.active && this.adj.get(this.active)?.has(n.id));
    const ai = n.trust === 'AI_GENERATED' || n.trust === 'AI_INFERRED';
    let r = n.r; if (set && !set.has(n.id) && !this.highlight) r *= 0.7; // "distante": ponto pequeno
    ctx.globalAlpha = n.fade; ctx.lineWidth = 1.4 / k; ctx.setLineDash([]);
    ctx.shadowColor = C.accent; ctx.shadowBlur = act ? 18 : n.hub ? 10 : 0;
    let col = n.hub ? C.hub : C.node;
    if (n.ghost) {
      ctx.setLineDash([2 / k, 2 / k]); ctx.strokeStyle = C.muted; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, TAU); ctx.stroke();
    } else if (n.conflicting) {
      ctx.fillStyle = C.bad; ctx.beginPath(); ctx.arc(n.x, n.y, r + 1.5, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0; ctx.fillStyle = '#111'; ctx.font = `bold ${(r + 2) * 1.3}px Inter, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', n.x, n.y + 0.5); ctx.textBaseline = 'alphabetic';
    } else if (ai) {
      ctx.fillStyle = C.ai; ctx.beginPath();
      for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.5 : r * 1.6, a = (i * Math.PI) / 4 - Math.PI / 2; ctx.lineTo(n.x + Math.cos(a) * rr, n.y + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
    } else if (n.trust === 'UNVERIFIED') {
      ctx.setLineDash([3 / k, 2 / k]); ctx.strokeStyle = C.warn; ctx.lineWidth = 1.8 / k; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, TAU); ctx.stroke();
      ctx.fillStyle = 'rgba(210,153,34,.25)'; ctx.fill();
    } else if (rel && !n.hub && !act) {
      ctx.fillStyle = '#111'; ctx.strokeStyle = col; ctx.lineWidth = 1.8 / k; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, TAU); ctx.fill(); ctx.stroke();
    } else {
      ctx.fillStyle = act ? C.active : col; ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, TAU); ctx.fill();
    }
    ctx.shadowBlur = 0; ctx.setLineDash([]);
    if (n.hub && !n.ghost && !n.conflicting) { ctx.strokeStyle = 'rgba(184,192,255,.55)'; ctx.lineWidth = 1.2 / k; ctx.beginPath(); ctx.arc(n.x, n.y, r + 3.5, 0, TAU); ctx.stroke(); }
    if (act) { ctx.strokeStyle = C.accent; ctx.lineWidth = 2 / k; ctx.beginPath(); ctx.arc(n.x, n.y, r + 6, 0, TAU); ctx.stroke(); }

    const label = act || n.id === this.hover || k > 1.25 || (k > 0.55 && (n.hub || rel)) || (this.highlight && this.highlight.has(n.id));
    if (label) { // LOD: o nível de detalhe cresce com o zoom; o estado também aparece em texto, não só em cor
      const glyph = n.conflicting ? '! ' : ai ? '✦ ' : n.trust === 'UNVERIFIED' ? '◌ ' : '';
      ctx.font = `${(act ? 13 : 12) / k}px Inter, system-ui, sans-serif`; ctx.textAlign = 'center';
      ctx.fillStyle = act ? '#fff' : '#c9cdd6'; ctx.fillText(glyph + n.title, n.x, n.y + r + 14 / k);
      if (k > 1.8) { ctx.font = `${10 / k}px Inter, system-ui, sans-serif`; ctx.fillStyle = C.muted; ctx.fillText(n.type, n.x, n.y + r + 26 / k); }
    }
    ctx.globalAlpha = 1;
  }

  // Estado vazio: uma teia latente, quase invisível, que ganha vida com o primeiro nó.
  latent() {
    const { ctx } = this, cx = this.w / 2, cy = this.hgt / 2, R = Math.min(this.w, this.hgt) * 0.42;
    ctx.strokeStyle = 'rgba(180,188,220,.07)'; ctx.lineWidth = 1;
    for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); ctx.stroke(); }
    for (let ring = 1; ring <= 5; ring++) {
      const rr = (R * ring) / 5; ctx.beginPath();
      for (let i = 0; i <= 9; i++) {
        const a = (i / 9) * TAU, a2 = ((i + 0.5) / 9) * TAU;
        if (i === 0) ctx.moveTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        else ctx.quadraticCurveTo(cx + Math.cos(((i - 1 + 0.5) / 9) * TAU) * rr * 0.93, cy + Math.sin(((i - 1 + 0.5) / 9) * TAU) * rr * 0.93, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
        void a2;
      }
      ctx.stroke();
    }
    ctx.fillStyle = C.muted; ctx.font = '13px Inter, system-ui, sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('A teia começa com a primeira nota.', cx, cy + R + 22);
  }
}
