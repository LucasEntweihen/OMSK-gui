# Mente em Teia

Infraestrutura **local-first** de conhecimento pessoal: Markdown + grafo semântico + busca híbrida + memória persistente para agentes de IA (via MCP).

> Cada informação é um ponto. Cada relação é um fio. O conjunto forma uma mente.

Zero dependências: precisa só do **Node.js 18+** (testado no 22). Sem `npm install`, sem build, sem rede.

## Rodando

```bash
npm start            # interface em http://localhost:4317  (PORT=4400 npm start para trocar a porta)
npm test             # 9 testes do núcleo (parser, grafo, busca, permissões, propostas)
npm run mcp          # servidor MCP (stdio) para agentes
```

A pasta `knowledge/` é o seu vault (já vem com notas de exemplo). Aponte para outro com `TEIA_ROOT=/caminho/do/vault npm start`. Dados derivados (versões, eventos, lixeira, propostas) ficam em `.teia/`, ao lado do vault. Pode apagar `.teia/` sem perder conhecimento: o Markdown é a fonte da verdade.

## Escrevendo na Teia

```markdown
---
id: fluxar
type: project            # concept, project, technology, decision, problem, idea…
title: Fluxar
tags: [projeto, java]
confidence: 1            # 0–1
source: user             # user | ai | ai-inferred | <fonte>
verified: true
---
# Fluxar
Veja também [[Java]].            ← link simples (relaciona-se-com)

## Relações
- utiliza:: [[PostgreSQL]]       ← relação tipada: "como" as notas se relacionam
- utiliza:: [[Redis]] ✦          ← ✦ = relação criada por IA
```

- Links para notas inexistentes viram **nós pendentes** (tracejados) até você escrevê-las.
- Código (crases e blocos) é ignorado pelo parser.
- O vault abre também no Obsidian; mudanças feitas fora da aplicação são reindexadas automaticamente.
- **Conflitos** são detectados por `contradiz:: [[X]]`, por `status: conflicting` ou quando um nó "utiliza" duas tecnologias da mesma categoria exclusiva (`category: banco-de-dados`, lista em `EXCLUSIVE_CATEGORIES`). Nada é apagado em silêncio.
- **Proveniência**: `USER_VERIFIED`, `SOURCE_VERIFIED`, `AI_GENERATED`, `AI_INFERRED`, `UNVERIFIED`, `CONFLICTING`. Na interface cada estado tem forma própria (● ✦ ◌ !), nunca só cor.

## Interface

| Área | O que faz |
|---|---|
| Explorer | Estrutura física (pastas). Pendentes numa seção própria. |
| Editor | Visualizar (links, relações, tags, prévia ao passar o mouse) e Editar (Markdown cru). |
| Contexto | Tipo, proveniência, relações diretas, backlinks, conceitos parecidos, conflitos. |
| Agente | Mostra a **subteia** que um agente receberia para uma pergunta (Context Builder) e a destaca na teia. |
| Timeline | Eventos: NodeCreated, NodeUpdated, NodeLinked, DecisionRecorded, Proposal*… |
| Propostas | Alterações de agentes em notas verificadas, para você aprovar ou rejeitar (com diff). |
| Knowledge Web | Teia procedural: hubs com mais massa, fios curvos, foco no nó ativo, LOD por zoom. Clique seleciona, duplo clique abre, arrastar move, roda dá zoom. |

Atalhos: `Ctrl+P` comandos · `Ctrl+K` busca · `Ctrl+G` teia imersiva · `Ctrl+S` salvar · `Esc` fecha. Em telas < 768 px os painéis viram abas.

## Agentes (MCP)

O servidor MCP fala JSON-RPC por stdio e expõe estas ferramentas, filtradas pelo perfil:

`search_knowledge` · `search_semantic` · `read_node` · `find_related` · `query_graph` · `get_context` · `get_project_context` · `list_conflicts` · `node_history` · `create_node` · `update_node` · `record_decision` · `link_nodes` · `delete_node`

| Perfil (`TEIA_PROFILE`) | Permissões |
|---|---|
| `observer` | READ, SEARCH |
| `researcher` (padrão) | + LINK |
| `editor` | + WRITE |
| `administrator` | + DELETE, EXECUTE |

Regras de segurança do conhecimento:

- Tudo que um agente cria entra como `source: ai`, `verified: false`, confiança ≤ 0.9, e aparece com ✦.
- Agentes **não podem marcar `verified`** nem alterar `source`.
- Alterar ou excluir uma nota `verified: true` **não é aplicado**: vira *proposta* aguardando sua aprovação na interface.
- Exclusões vão para `.teia/trash/`; toda edição guarda a versão anterior em `.teia/versions/<id>/`.

Configuração (use caminhos absolutos):

```json
{
  "mcpServers": {
    "mente-em-teia": {
      "command": "node",
      "args": ["/CAMINHO/mente-em-teia/src/agent/mcp-server.js"],
      "env": { "TEIA_ROOT": "/CAMINHO/mente-em-teia/knowledge", "TEIA_PROFILE": "editor" }
    }
  }
}
```

Claude Code: `claude mcp add mente-em-teia -e TEIA_ROOT=/CAMINHO/knowledge -e TEIA_PROFILE=editor -- node /CAMINHO/src/agent/mcp-server.js`.
Oh My Pi ou qualquer cliente que fale MCP via stdio: use o mesmo `command`/`args`/`env`.

## API HTTP

`GET /api/graph` · `/api/node/:id` · `/api/search?q=&mode=&type=&tag=&since=` · `/api/related/:id` · `/api/context?query=|node=&budget=` · `/api/history/:id` · `/api/events` · `/api/conflicts` · `/api/proposals` · `POST /api/node` · `PUT /api/node/:id` · `DELETE /api/node/:id` · `POST /api/link` · `POST /api/proposals/:id/approve|reject` · `POST /api/reindex`.

O servidor escuta só em `127.0.0.1`, valida `Host`/`Origin` (contra DNS rebinding e sites que tentem escrever no seu vault) e serve a interface com CSP restritiva.

## Arquitetura (spec → código)

```
web/            Interface (vanilla JS + Canvas, sem build)       → Interface do usuário
src/core/       markdown.js · engine.js · search.js              → Knowledge Engine / Knowledge Base / AI Context Layer
src/agent/      tools.js · permissions.js · mcp-server.js        → Agent Interface
src/server.js   API HTTP local
knowledge/      Vault Markdown (fonte da verdade)
.teia/          versões, eventos, lixeira, propostas (derivado)
```

Busca híbrida (`engine.search`): BM25 + vetor semântico local + expansão pelo grafo + filtros (tipo, tag, período), fundidos por RRF. O embedder atual (`HashEmbedder`: palavras, trigramas e bigramas com hashing) **não é um modelo de linguagem**: acerta bem similaridade lexical e morfológica, mas não sinônimos. A interface `embed(text) → Map` é plugável.

## O que este MVP ainda não faz (próximos passos)

- **Embeddings reais** (Ollama/OpenAI) e armazenamento em SQLite ou PostgreSQL + pgvector; hoje o índice é reconstruído em memória a cada mudança (instantâneo até alguns milhares de notas).
- **Escala da teia**: Canvas 2D e repulsão O(n²) servem até ~1.500 nós. Depois, PixiJS/WebGL, Barnes-Hut, clusters colapsáveis e LOD por comunidade.
- **Editor**: trocar o `<textarea>` por CodeMirror 6 com Live Preview.
- **Chat com LLM** dentro da interface (hoje o agente é externo, via MCP; a aba Agente mostra o contexto que ele receberia).
- Timeline com *diff* de versões e restauração; resolução assistida de conflitos; relações temporais.
- Mais recursos MCP (resources/prompts) e autenticação por agente.
