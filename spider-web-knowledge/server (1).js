// Ferramentas expostas aos agentes (via MCP). Cada ferramenta declara a permissão que exige.
import { can } from './permissions.js';

const obj = (properties, required = []) => ({ type: 'object', properties, required });
const s = description => ({ type: 'string', description });
const n = description => ({ type: 'number', description });

export const TOOLS = [
  { name: 'search_knowledge', permission: 'SEARCH',
    description: 'Busca híbrida (lexical + semântica + grafo) na base de conhecimento. Retorna nós com relevância, proveniência (trust) e trecho.',
    inputSchema: obj({ query: s('Consulta em linguagem natural ou palavras-chave'), mode: { type: 'string', enum: ['hybrid', 'lexical', 'semantic'] }, type: s('Filtra por tipo (concept, project, decision…)'), tag: s('Filtra por tag'), since_days: n('Só nós atualizados nos últimos N dias'), limit: n('Máximo de resultados (padrão 8)') }, ['query']),
    run: (e, a) => e.search(a.query, { mode: a.mode, type: a.type, tag: a.tag, sinceDays: a.since_days, limit: a.limit }) },
  { name: 'search_semantic', permission: 'SEARCH',
    description: 'Busca apenas semântica (similaridade de significado), útil para perguntas vagas como "como eu fiz aquele sistema de autenticação?".',
    inputSchema: obj({ query: s('Consulta'), limit: n('Máximo de resultados') }, ['query']),
    run: (e, a) => e.search(a.query, { mode: 'semantic', limit: a.limit }) },
  { name: 'read_node', permission: 'READ',
    description: 'Lê um nó (por id ou título): corpo Markdown, metadados, proveniência, relações de saída e backlinks.',
    inputSchema: obj({ node: s('id ou título do nó') }, ['node']),
    run: (e, a) => { const r = e.getNode(a.node); delete r.raw; return r; } },
  { name: 'find_related', permission: 'READ',
    description: 'Nós relacionados: vizinhos diretos no grafo (com o tipo da relação) e nós semanticamente parecidos.',
    inputSchema: obj({ node: s('id ou título'), limit: n('Máximo') }, ['node']),
    run: (e, a) => e.related(a.node, a.limit) },
  { name: 'query_graph', permission: 'READ',
    description: 'Retorna a subteia ao redor de um nó (BFS), opcionalmente filtrando por tipo de relação (ex.: utiliza).',
    inputSchema: obj({ node: s('nó de partida'), depth: n('Profundidade (1–4, padrão 2)'), relation: s('Filtra por relação') }, ['node']),
    run: (e, a) => e.subgraph(a.node, { depth: a.depth, relation: a.relation }) },
  { name: 'get_context', permission: 'READ',
    description: 'Context Builder: monta um contexto Markdown compacto (subteia relevante, relações, decisões, conflitos) para uma consulta ou nó, dentro de um orçamento de caracteres.',
    inputSchema: obj({ query: s('Pergunta/tarefa'), node: s('Alternativa: nó central'), budget: n('Caracteres (padrão 6000)'), depth: n('Saltos no grafo (1–3)') }),
    run: (e, a) => e.context({ query: a.query, node: a.node, budget: a.budget, depth: a.depth }).text },
  { name: 'get_project_context', permission: 'READ',
    description: 'Contexto completo de um projeto: tecnologias, problemas, decisões anteriores e documentação ligada (2 saltos).',
    inputSchema: obj({ project: s('título ou id do projeto'), budget: n('Caracteres') }, ['project']),
    run: (e, a) => e.context({ node: a.project, depth: 2, budget: a.budget }).text },
  { name: 'list_conflicts', permission: 'READ',
    description: 'Lista conflitos detectados (informações contraditórias). Nunca resolva em silêncio: pergunte ao usuário ou busque evidências.',
    inputSchema: obj({}), run: e => e.conflicts() },
  { name: 'node_history', permission: 'READ',
    description: 'Histórico de um nó: versões anteriores e eventos (quem mudou o quê). Responde "como chegamos a essa decisão?".',
    inputSchema: obj({ node: s('id ou título') }, ['node']), run: (e, a) => e.history(a.node) },
  { name: 'create_node', permission: 'WRITE',
    description: 'Cria uma nota. Conteúdo criado por agente é gravado como source: ai, verified: false e fica marcado com ✦ até um humano verificar.',
    inputSchema: obj({ title: s('Título'), type: s('concept, project, technology, decision, problem, solution, idea, reference…'), body: s('Corpo em Markdown; use [[Links]] e `relacao:: [[Alvo]]`'), tags: { type: 'array', items: { type: 'string' } }, confidence: n('0–0.9') }, ['title', 'type']),
    run: (e, a, actor) => e.createNode({ title: a.title, type: a.type, body: a.body, tags: a.tags, confidence: a.confidence }, actor) },
  { name: 'update_node', permission: 'WRITE',
    description: 'Atualiza uma nota (substitui o corpo ou acrescenta texto). Se o nó foi verificado por humano, a mudança vira PROPOSTA e exige aprovação.',
    inputSchema: obj({ node: s('id ou título'), body: s('Novo corpo completo'), append: s('Texto a acrescentar no fim'), tags: { type: 'array', items: { type: 'string' } }, confidence: n('0–0.9') }, ['node']),
    run: (e, a, actor) => e.updateNode(a.node, { body: a.body, append: a.append, tags: a.tags, confidence: a.confidence }, actor) },
  { name: 'record_decision', permission: 'WRITE',
    description: 'Registra uma decisão (motivo, alternativas, resultado) ligada a um projeto. Memória de decisão para consultas futuras.',
    inputSchema: obj({ title: s('Título da decisão'), decision: s('O que foi decidido'), reason: s('Motivo'), alternatives: { type: 'array', items: { type: 'string' } }, result: s('Resultado'), project: s('Projeto relacionado') }, ['title', 'decision']),
    run: (e, a, actor) => e.recordDecision(a, actor) },
  { name: 'link_nodes', permission: 'LINK',
    description: 'Cria uma relação tipada entre dois nós (ex.: Redis —resolve→ Cache). A relação criada por agente é marcada com ✦.',
    inputSchema: obj({ source: s('nó de origem'), target: s('nó de destino (título; cria nó pendente se não existir)'), relation: s('utiliza, depende-de, resolve, alternativa-a, parte-de, contradiz…') }, ['source', 'target', 'relation']),
    run: (e, a, actor) => e.linkNodes(a, actor) },
  { name: 'delete_node', permission: 'DELETE',
    description: 'Remove uma nota (vai para a lixeira, recuperável). Notas verificadas por humano viram proposta de exclusão.',
    inputSchema: obj({ node: s('id ou título') }, ['node']),
    run: (e, a, actor) => e.deleteNode(a.node, actor) },
];

export function callTool(engine, name, args = {}, { profile = 'observer', agent = 'agent' } = {}) {
  const t = TOOLS.find(x => x.name === name);
  if (!t) throw new Error(`Ferramenta desconhecida: ${name}`);
  if (!can(profile, t.permission)) throw new Error(`Permissão negada: o perfil '${profile}' não possui ${t.permission}.`);
  return t.run(engine, args, { name: `ai:${agent}`, agent: true });
}
