// Servidor local da Mente em Teia: API HTTP + interface web estática. Escuta apenas em 127.0.0.1 (local-first).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Engine, USER } from './core/engine.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 4317);
const root = process.env.TEIA_ROOT || path.resolve(here, '../knowledge');
const WEB = path.resolve(here, '../web');
const engine = new Engine({ root, dataDir: process.env.TEIA_DATA });
const HOSTS = new Set([`127.0.0.1:${PORT}`, `localhost:${PORT}`]);

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json' };
const routes = [];
const route = (method, pattern, fn) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '([^/]+)') + '$'), fn });

route('GET', '/api/graph', () => engine.graph());
route('GET', '/api/revision', () => ({ revision: (engine.ensureFresh(), engine.revision), proposals: engine.proposals().length }));
route('GET', '/api/stats', () => engine.stats());
route('POST', '/api/reindex', () => engine.reindex());
route('GET', '/api/node/:id', ({ p }) => engine.getNode(p[0]));
route('GET', '/api/preview/:id', ({ p }) => engine.preview(p[0]));
route('POST', '/api/node', ({ body }) => engine.createNode(body, USER));
route('PUT', '/api/node/:id', ({ p, body }) => engine.updateNode(p[0], { raw: body.raw }, USER));
route('DELETE', '/api/node/:id', ({ p }) => engine.deleteNode(p[0], USER));
route('GET', '/api/search', ({ q }) => engine.search(q.get('q') || '', { mode: q.get('mode') || 'hybrid', type: q.get('type') || undefined, tag: q.get('tag') || undefined, sinceDays: +q.get('since') || undefined, limit: +q.get('limit') || 8 }));
route('GET', '/api/related/:id', ({ p }) => engine.related(p[0]));
route('GET', '/api/context', ({ q }) => engine.context({ query: q.get('query') || undefined, node: q.get('node') || undefined, budget: +q.get('budget') || 6000, depth: +q.get('depth') || 1 }));
route('POST', '/api/link', ({ body }) => engine.linkNodes(body, USER));
route('GET', '/api/history/:id', ({ p }) => engine.history(p[0]));
route('GET', '/api/events', () => engine.events(100));
route('GET', '/api/conflicts', () => engine.conflicts());
route('GET', '/api/proposals', () => engine.proposals());
route('POST', '/api/proposals/:id/approve', ({ p }) => engine.decide(p[0], true));
route('POST', '/api/proposals/:id/reject', ({ p }) => engine.decide(p[0], false));

const json = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
};
const readBody = req => new Promise((resolve, reject) => {
  let size = 0; const chunks = [];
  req.on('data', c => { size += c.length; if (size > 2e6) { reject(Object.assign(new Error('Corpo muito grande'), { status: 413 })); req.destroy(); } else chunks.push(c); });
  req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}); } catch { reject(Object.assign(new Error('JSON inválido'), { status: 400 })); } });
});

http.createServer(async (req, res) => {
  try {
    // Proteção contra DNS rebinding e requisições de outros sites (a API escreve arquivos locais).
    if (!HOSTS.has(req.headers.host || '')) return json(res, 403, { error: 'Host não permitido' });
    if (req.headers.origin && !HOSTS.has(new URL(req.headers.origin).host)) return json(res, 403, { error: 'Origem não permitida' });
    const u = new URL(req.url, `http://${req.headers.host}`);

    if (u.pathname.startsWith('/api/')) {
      for (const r of routes) {
        const m = r.method === req.method && u.pathname.match(r.re);
        if (!m) continue;
        const body = ['POST', 'PUT', 'DELETE'].includes(req.method) ? await readBody(req) : {};
        return json(res, 200, await r.fn({ p: m.slice(1).map(decodeURIComponent), q: u.searchParams, body }));
      }
      return json(res, 404, { error: 'Rota não encontrada' });
    }

    const file = path.join(WEB, decodeURIComponent(u.pathname === '/' ? '/index.html' : u.pathname));
    if (!file.startsWith(WEB + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); return res.end('Não encontrado'); }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'",
    });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    json(res, e.status || 500, { error: e.message });
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`\n  Mente em Teia  →  http://localhost:${PORT}\n  vault: ${root}\n  ${JSON.stringify(engine.stats())}\n`);
}).on('error', e => { console.error(e.code === 'EADDRINUSE' ? `Porta ${PORT} em uso. Rode com PORT=4400 npm start` : e.message); process.exit(1); });
