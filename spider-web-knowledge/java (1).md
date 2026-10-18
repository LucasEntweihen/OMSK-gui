import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Engine, USER } from '../src/core/engine.js';
import { callTool } from '../src/agent/tools.js';
import { parseNote } from '../src/core/markdown.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const sandbox = () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'teia-'));
  fs.cpSync(path.join(here, '../knowledge'), path.join(d, 'knowledge'), { recursive: true });
  return new Engine({ root: path.join(d, 'knowledge') });
};

test('parser: frontmatter, relações tipadas, tags e código ignorado', () => {
  const n = parseNote('---\nid: x\ntype: concept\ntags: [a, b]\n---\n# X\n\n- utiliza:: [[PostgreSQL]]\n- resolve:: [[Cache]] ✦\nVeja [[Java|a linguagem]] #java\n`utiliza:: [[Falso]]`\n```\n[[Falso2]]\n```\n', 'x.md');
  assert.deepEqual(n.links.map(l => [l.target, l.relation, l.ai]), [['PostgreSQL', 'utiliza', false], ['Cache', 'resolve', true], ['Java', 'relaciona-se-com', false]]);
  assert.ok(n.tags.includes('java') && n.tags.includes('a'));
});

test('grafo: arestas tipadas, nós pendentes, hubs e conflito', () => {
  const e = sandbox(), g = e.graph();
  assert.ok(g.edges.some(x => x.source === 'fluxar' && x.target === 'postgresql' && x.relation === 'utiliza'));
  assert.ok(g.edges.some(x => x.source === 'fluxar' && x.target === 'redis' && x.ai));
  assert.ok(g.nodes.some(n => n.ghost && n.title === 'Encapsulamento'));
  assert.ok(g.nodes.find(n => n.id === 'fluxar').hub);
  assert.equal(g.nodes.find(n => n.id === 'redis').trust, 'AI_GENERATED');
  assert.equal(g.nodes.find(n => n.id === 'usar-postgresql').trust, 'CONFLICTING');
  assert.equal(e.conflicts().length, 1);
});

test('conflito por categoria exclusiva (heurística) é detectado e resolvido por substituição', () => {
  const e = sandbox();
  e.createNode({ title: 'Projeto X', type: 'project', body: 'utiliza:: [[PostgreSQL]]\nutiliza:: [[MongoDB]]' }, USER);
  assert.equal(e.conflicts().length, 1, 'MongoDB já foi substituído: não conflita');
  e.createNode({ title: 'CouchDB', type: 'technology', meta: { category: 'banco-de-dados' } }, USER);
  e.linkNodes({ source: 'projeto-x', target: 'CouchDB', relation: 'utiliza' }, USER);
  assert.ok(e.conflicts().length > 1);
});

test('busca híbrida encontra o que importa', () => {
  const e = sandbox();
  assert.ok(e.search('como conectar meu programa Java ao banco').slice(0, 2).some(r => r.id === 'jdbc'));
  assert.equal(e.search('Redis')[0].id, 'redis');
  assert.ok(e.search('por que escolhemos PostgreSQL').slice(0, 2).some(r => r.id === 'usar-postgresql'));
  assert.ok(e.search('herança', { mode: 'lexical' }).some(r => r.id === 'java-poo-heranca'));
});

test('context builder inclui subteia, relações e conflitos', () => {
  const e = sandbox(), c = e.context({ query: 'melhorar o banco do Fluxar', budget: 4000 });
  assert.ok(c.nodes.some(n => n.id === 'fluxar') && c.nodes.some(n => n.id === 'postgresql'));
  assert.ok(c.chars <= 4400);
  assert.match(c.text, /Relações entre os nós/);
});

test('permissões por perfil', () => {
  const e = sandbox();
  assert.throws(() => callTool(e, 'create_node', { title: 'N', type: 'idea' }, { profile: 'observer' }), /Permissão negada/);
  assert.throws(() => callTool(e, 'link_nodes', { source: 'java', target: 'JVM', relation: 'x' }, { profile: 'observer' }), /LINK/);
  assert.throws(() => callTool(e, 'delete_node', { node: 'cache' }, { profile: 'editor' }), /DELETE/);
  assert.ok(callTool(e, 'search_knowledge', { query: 'java' }, { profile: 'observer' }).length);
});

test('escrita de agente: proveniência de IA e aprovação humana para nós verificados', () => {
  const e = sandbox();
  const r = callTool(e, 'create_node', { title: 'Memcached avaliado', type: 'idea', body: 'Alternativa ao [[Redis]].' }, { profile: 'editor', agent: 'claude' });
  const n = e.getNode(r.id);
  assert.equal(n.source, 'ai'); assert.equal(n.verified, false); assert.equal(n.trust, 'AI_GENERATED');

  const l = callTool(e, 'link_nodes', { source: 'java', target: 'Redis', relation: 'integra-com' }, { profile: 'researcher', agent: 'claude' });
  assert.equal(l.status, 'linked');
  assert.ok(e.graph().edges.some(x => x.source === 'java' && x.target === 'redis' && x.ai));

  const u = callTool(e, 'update_node', { node: 'cache', append: 'Nota do agente.' }, { profile: 'editor', agent: 'claude' });
  assert.equal(u.status, 'pending_human_approval');
  assert.ok(!e.getNode('cache').body.includes('Nota do agente'));
  assert.equal(e.proposals().length, 1);
  e.decide(u.proposal, true);
  assert.ok(e.getNode('cache').body.includes('Nota do agente'));
  assert.ok(e.history('cache').versions.length >= 1);

  const v = callTool(e, 'update_node', { node: 'memcached-avaliado', append: 'Mais um detalhe.' }, { profile: 'editor', agent: 'claude' });
  assert.equal(v.status, 'updated');
});

test('usuário: criar, editar, excluir (lixeira) e decisão registrada', () => {
  const e = sandbox();
  const c = e.createNode({ title: 'Nota Teste', type: 'concept', body: 'Olá [[Java]]' }, USER);
  assert.ok(e.graph().edges.some(x => x.source === c.id && x.target === 'java'));
  e.updateNode(c.id, { raw: e.getNode(c.id).raw + '\nMais texto.' }, USER);
  assert.match(e.getNode(c.id).body, /Mais texto/);
  const d = e.recordDecision({ title: 'Adotar Redis', decision: 'Usar Redis como cache', reason: 'Latência', alternatives: ['Memcached'], project: 'Fluxar' }, USER);
  assert.ok(e.graph().edges.some(x => x.source === d.id && x.target === 'fluxar' && x.relation === 'decide-sobre'));
  assert.equal(e.deleteNode(c.id, USER).status, 'deleted');
  assert.throws(() => e.getNode(c.id), /não encontrado/);
  assert.ok(e.events().some(x => x.type === 'DecisionRecorded'));
});

test('caminhos fora do vault são recusados', () => {
  const e = sandbox();
  assert.throws(() => e.abs('../fora.md'), /inválido/);
  const r = e.createNode({ title: 'x', type: 'idea', folder: '../../etc' }, USER);
  assert.ok(!r.path.includes('..'));
});
