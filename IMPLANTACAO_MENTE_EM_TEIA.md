# GUIA DEFINITIVO DE IMPLANTAÇÃO: MENTE EM TEIA & GRAPHIFY ENGINE
## Integração no Ecossistema Oh My Shark (`https://github.com/LucasEntweihen/oh-my-shark.git`)

---

### Resumo Executivo da Arquitetura

Este documento estabelece o procedimento técnico, completo e exaustivo para implantar o subsistema **Mente em Teia** — com a arquitetura de conhecimento **Graphify-Grade** (baseada na especificação do Graphify-Labs), design system próprio **Neural Obsidian / Cosmic Void v3.0**, persistência em Desktop Vault físico (`~/Desktop/Mente em Teia`) e exportação nativa para o formato oficial **Obsidian JSON Canvas (.canvas)** — no repositório central **Oh My Shark** ([https://github.com/LucasEntweihen/oh-my-shark.git](https://github.com/LucasEntweihen/oh-my-shark.git)).

A implantação une a infraestrutura do **Oh My Shark** (Deep Ocean Interface, React 19, Bun runtime, Zustand, Vite, agente OMP harness) ao poder de indexação topológica, detecção de comunidades por coesão modular, identificação de God Nodes, conexões surpreendentes (pontes) e persistência de memórias de IA em Markdown padrão Obsidian.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 OH MY SHARK CORE                                       │
│   (Deep Ocean Design System: --ocean-950 a --ocean-800, --blue-500, Bun + React 19)    │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
┌──────────────────────────────────────┐     ┌───────────────────────────────────────────┐
│        APP SHELL & ROTEADOR          │     │          VITE DEV & BACKEND APIS          │
│ • data-environment="teia" (Dual DS)  │     │ • /api/teia/vault-info, graph, node, mem  │
│ • Sidebar com transição Obsidian     │     │ • /api/teia/save-canvas, save-report      │
│ • Supressão do Inspector global      │     │ • /api/fs/browse, tree (Navegador OS)     │
└──────────────────┬───────────────────┘     └─────────────────────┬─────────────────────┘
                   │                                               │
                   ▼                                               ▼
┌──────────────────────────────────────┐     ┌───────────────────────────────────────────┐
│       MENTE EM TEIA WORKSPACE        │     │         PIPELINE GRAPHIFY (7 FASES)       │
│ • TeiaWorkspaceHeader (Status Vault) │     │ 1. detect   -> Ontologia de nós           │
│ • TeiaExplorer (Busca & Árvore)      │     │ 2. extract  -> Frontmatter & Wikilinks    │
│ • TeiaCanvas (Física Force-Directed) │◄────┤ 3. build    -> Matriz & Arestas           │
│ • TeiaInspector (4 Abas Contextuais) │     │ 4. cluster  -> Cohesion Score & Leiden    │
│ • TeiaHoverCard (Previsão Flutuante) │     │ 5. analyze  -> God Nodes, Pontes, Ciclos  │
└──────────────────┬───────────────────┘     │ 6. report   -> GRAPH_REPORT.md            │
                   │                         │ 7. export   -> mente-em-teia.canvas       │
                   │                         └─────────────────────┬─────────────────────┘
                   ▼                                               │
┌──────────────────────────────────────────────────────────────────┴─────────────────────┐
│                            DESKTOP VAULT FÍSICO DO USUÁRIO                             │
│                     Caminho: ~/Desktop/Mente em Teia (Auto-Scaffold)                   │
│ • Arquivos .md individuais com Frontmatter YAML e Wikilinks [[...]]                    │
│ • mente-em-teia.canvas (Compatível nativamente com o app desktop Obsidian)             │
│ • GRAPH_REPORT.md (Relatório analítico topológico gerado automaticamente)              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Princípios Arquiteturais e Restrições Inegociáveis

1. **Design System Dual Sem Conflito**:
   - O Oh My Shark opera nativamente sob o **Deep Ocean Interface** (`--ocean-950` a `--ocean-850`, destaque em `--blue-500` `#2678FF`).
   - O Mente em Teia opera sob o **Neural Obsidian / Cosmic Void v3.0** (`--teia-void` `#07080C`, superfícies cósmicas e destaque estelar `--teia-accent` `#7A82E6`).
   - A transição ocorre dinamicamente no `AppShell` através do atributo `data-environment="teia"`, sem poluir ou quebrar as variáveis CSS das outras rotas (`/chat`, `/tasks`, `/context`, etc.).
2. **Estética Técnica Rigorosa (Linear / VS Code Grade)**:
   - **Zero Emojis Clichês**: Estritamente proibido o uso de emojis (como 🤖, 🧠, ⚡, ✨, 🚀, 🔮) em botões, abas, títulos ou notificações. Glifos técnicos discretos em SVG puro (`Icon.tsx`) são a única representação visual aceita.
   - **Zero Badges Intrusivos**: Não poluir a interface com atalhos de teclado espalhados (`⌘K`, `Ctrl+X`) em botões de ação comum. O atalho global de busca fica restrito à paleta de comandos.
3. **Persistência Baseada em Arquivos Físicos (File-over-App)**:
   - Nenhum dado é encapsulado em banco proprietário ou blob binário fechado. Toda nota é um arquivo Markdown legível em disco, com YAML Frontmatter e Wikilinks padrão Obsidian (`[[Nome da Nota]]` e relações semânticas tipadas `relacao:: [[Alvo]]`).
   - Sincronização nativa com o diretório `~/Desktop/Mente em Teia`. O usuário pode abrir essa pasta no aplicativo Obsidian Desktop e ver seus nós, conexões e o canvas renderizados de forma idêntica.
4. **TypeScript Estrito e APIs Nativas do Bun**:
   - Zero uso de `any`, `@ts-ignore` ou `as unknown as Type` sem validação.
   - Uso de `fs/promises`, `path`, `os` no backend e React 19 com Zustand 5 no frontend.

---

## 2. Requisitos de Ambiente e Dependências

O repositório `oh-my-shark` utiliza Bun como gerenciador de pacotes e runtime principal.

### 2.1 Verificação de Versões
- **Bun**: `^1.2.0` ou `^1.4.2`
- **Node.js** (quando aplicável): `>= 20.0.0`
- **TypeScript**: `^5.8.0`
- **Vite**: `^6.0.0` ou `^8.3.0`

### 2.2 Dependências Necessárias no `package.json`

Verifique se o `package.json` do `oh-my-shark` contém as seguintes bibliotecas:

```json
{
  "dependencies": {
    "framer-motion": "^14.3.0",
    "react": "^19.3.1",
    "react-dom": "^19.3.1",
    "react-router-dom": "^7.18.4",
    "recharts": "^3.10.1",
    "zod": "^4.6.7",
    "zustand": "^5.0.15"
  },
  "devDependencies": {
    "@types/node": "^26.6.5",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "@vitejs/plugin-react": "^6.1.2",
    "typescript": "^5.8.0",
    "vite": "^8.3.4"
  }
}
```

Se faltar alguma dependência, instale via Bun:
```bash
bun add zustand framer-motion react-router-dom zod recharts
bun add -d @types/node typescript vite @vitejs/plugin-react
```

### 2.3 Aliases no `tsconfig.json`
Certifique-se de que o alias `@/*` está mapeado para `./src/*`:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 3. Matriz Completa de Arquivos a Serem Implantados

A tabela abaixo descreve cada arquivo componente do subsistema Mente em Teia que deve existir na árvore do `oh-my-shark`:

| Arquivo de Destino | Responsabilidade Técnica |
| :--- | :--- |
| `src/styles/teia-tokens.css` | Especificação completa de tokens de cor, tipografia e classes utilitárias do Design System Cosmic Void v3.0 |
| `src/styles/globals.css` | Ponto de montagem global com importação de `@import "./teia-tokens.css";` |
| `src/components/icons/vectors.tsx` | Registro do glifo SVG `WebNetIcon` (rede neural/aranha estilizada) |
| `src/components/icons/index.tsx` | Exportação pública do `WebNetIcon` |
| `src/services/nativeDirectoryPicker.ts` | Bridge de File System Access API nativa (`window.showDirectoryPicker`) e cliente `/api/fs` |
| `src/services/graphify/types.ts` | Definições de tipos do pipeline Graphify (Comunidades, God Nodes, Pontes, Canvas JSON, Ciclos) |
| `src/services/graphify/cluster.ts` | Algoritmo de propagação de rótulos ponderada, cálculo do Cohesion Score e sub-divisão de clusters |
| `src/services/graphify/analyze.ts` | Detectores topológicos: God Nodes, Surprising Connections, Ciclos DFS e Perguntas Sugeridas |
| `src/services/graphify/export.ts` | Exportador para Obsidian JSON Canvas (`.canvas`), `GRAPH_REPORT.md` e Graph JSON |
| `src/services/graphify/pipeline.ts` | Orquestrador das 7 fases do Graphify |
| `src/services/graphify/index.ts` | Barrel file do módulo Graphify |
| `src/services/teiaEngine.ts` | Motor central: renderizador Markdown de Wikilinks, física Force-Directed e cliente HTTP das APIs locais |
| `src/store/useTeiaStore.ts` | Store reativo Zustand: sincronização de vault, seleção de nós, dirty state, canvas sync e execução de pipeline |
| `src/features/teia/TeiaPage.tsx` | Página principal de visualização: Split, Canvas puro, Editor Markdown e Preview |
| `src/features/teia/components/TeiaWorkspaceHeader.tsx` | Cabeçalho do workspace: status de conexão, botões de ação, métricas e modal de novo nó |
| `src/features/teia/components/TeiaExplorer.tsx` | Barra lateral esquerda: filtro de busca, estatísticas e listagem agrupada de nós |
| `src/features/teia/components/TeiaCanvas.tsx` | Canvas HTML5 2D interativo com renderização de nós coloridos por cluster, links e física contínua |
| `src/features/teia/components/TeiaHoverCard.tsx` | Card flutuante disparado ao passar o cursor sobre os nós do Canvas |
| `src/features/teia/components/TeiaInspector.tsx` | Painel direito com 4 abas técnicas: Conexões, Memória IA, Propriedades e Análise Graphify |
| `src/components/layout/AppShell.tsx` | Integração de ambiente dual: `[data-environment="teia"]` e supressão contextual do Inspector global |
| `src/components/layout/Sidebar.tsx` | Inclusão do item de navegação "Mente em Teia" com tema Obsidian reativo |
| `src/router.tsx` | Mapeamento da rota `/teia` apontando para `TeiaPage` |
| `vite.config.ts` | Servidor backend embutido: middleware para rotas `/api/teia/*` e `/api/fs/*` |

---

## 4. Camada de Middleware Backend e Armazenamento Físico (`vite.config.ts`)

A comunicação entre a UI do Oh My Shark e o sistema de arquivos local do usuário ocorre através de um middleware embutido no servidor de desenvolvimento do Vite (ou transferível para um servidor Bun standalone).

### 4.1 Resolução do Diretório do Vault Físico
O vault físico padrão é alocado em:
```typescript
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

let teiaVaultDir = path.join(os.homedir(), "Desktop", "Mente em Teia");

function ensureTeiaVault(vaultPath: string): string {
  try {
    if (!fs.existsSync(vaultPath)) {
      fs.mkdirSync(vaultPath, { recursive: true });
    }
    return vaultPath;
  } catch (err) {
    // Fallback gracioso para pasta local do projeto caso ocorra restrição de permissão
    const fallback = path.join(process.cwd(), "mente-em-teia-vault");
    if (!fs.existsSync(fallback)) {
      fs.mkdirSync(fallback, { recursive: true });
    }
    return fallback;
  }
}
```

### 4.2 Especificação dos Endpoints REST

Insira no `vite.config.ts` dentro de `plugins: [{ name: "teia-api-middleware", configureServer(server) { ... } }]`:

#### 1. `GET /api/teia/vault-info`
- **Retorno**: `{ path: string, exists: boolean, totalNotes: number, totalEdges: number, ghostNotes: number }`
- **Operação**: Avalia a integridade do diretório do Desktop, varre as notas Markdown e conta conexões e nós fantasmas.

#### 2. `POST /api/teia/set-vault`
- **Payload**: `{ path: string }`
- **Retorno**: `{ success: boolean, currentPath: string }`
- **Operação**: Permite ao usuário trocar a pasta do Vault para qualquer diretório do computador em tempo de execução.

#### 3. `GET /api/teia/graph`
- **Retorno**: `{ nodes: TeiaNode[], edges: TeiaEdge[], communities?: any[] }`
- **Operação**: Realiza o parse das notas Markdown do vault:
  - Extrai YAML Frontmatter (`type`, `tags`, `trust`, `created`, `updated`).
  - Detecta Wikilinks via regex `/\[\[([^\]]+)\]\]/g`.
  - Detecta Relações Tipadas via regex `/([a-zA-Z0-9_\-]+)::\s*\[\[([^\]]+)\]\]/g`.
  - Constrói nós reais e gera automaticamente **nós fantasmas** (`ghost: true`) para links que apontam para notas ainda não criadas.

#### 4. `GET /api/teia/node/:id`
- **Retorno**: Objeto `TeiaNode` com o conteúdo cru do arquivo (`raw`) e dados estruturados.

#### 5. `POST /api/teia/node`
- **Payload**: `{ title: string, type: string, body?: string, tags?: string[], trust?: string }`
- **Operação**: Gera o arquivo Markdown formatado com frontmatter padrão e salva no disco:
```markdown
---
title: "Título da Nota"
type: "concept"
tags: []
trust: "USER_VERIFIED"
created: 2026-10-18T16:00:00.000Z
updated: 2026-10-18T16:00:00.000Z
---

Conteúdo da nota em Markdown com [[Wikilinks]] e relacao:: [[Alvo]].
```

#### 6. `PUT /api/teia/node/:id`
- **Payload**: `{ raw: string }`
- **Operação**: Sobrescreve o arquivo no disco preservando modificações feitas no editor.

#### 7. `DELETE /api/teia/node/:id`
- **Operação**: Remove o arquivo físico correspondente no Desktop Vault.

#### 8. `POST /api/teia/memory`
- **Payload**: `{ title: string, content: string, type: "memory" | "preference" | "decision" }`
- **Operação**: Endpoint dedicado para o motor de IA do Oh My Shark gravar aprendizados, decisões do usuário ou preferências no grafo, com tag `#ia-memoria` e `trust: "AI_GENERATED"`.

#### 9. `POST /api/teia/save-canvas`
- **Payload**: Objeto completo `ObsidianCanvasData` gerado pela fase 7 do Graphify.
- **Operação**: Grava o arquivo físico `mente-em-teia.canvas` diretamente na raiz de `~/Desktop/Mente em Teia`.

#### 10. `POST /api/teia/save-report`
- **Payload**: `{ markdown: string }`
- **Operação**: Grava o arquivo físico `GRAPH_REPORT.md` diretamente na raiz de `~/Desktop/Mente em Teia`.

#### 11. `GET /api/teia/context?query=...`
- **Retorno**: `{ nodesCount: number, text: string }`
- **Operação**: Localiza os nós mais relevantes para o termo pesquisado e constrói um bloco de contexto textual ideal para ser injetado no prompt de LLMs.

#### 12. `GET /api/fs/browse` e `GET /api/fs/tree`
- **Operação**: Permite navegar pelas pastas da máquina do usuário e obter árvores de arquivos locais com segurança.

---

## 5. A Arquitetura de Conhecimento Graphify (Fórmulas e Pipeline de 7 Fases)

O diretório `src/services/graphify/` implementa o motor analítico de grafos com paridade algorítmica ao Graphify oficial.

```
       [1. DETECT]
Entidades & Ontologias
           │
           ▼
      [2. EXTRACT]
Frontmatter & Wikilinks
           │
           ▼
       [3. BUILD]
Matriz de Adjacência & Ghosts
           │
           ▼
      [4. CLUSTER]
Label Propagation & Cohesion Score
           │
           ▼
      [5. ANALYZE]
God Nodes, Pontes, Ciclos & Perguntas
           │
           ▼
      [6. REPORT] ──────────────────► GRAPH_REPORT.md
Métricas Executivas
           │
           ▼
      [7. EXPORT] ──────────────────► mente-em-teia.canvas
Layout Espacial em Grid
```

### 5.1 Fase 1: Detect (`types.ts`)
Classifica ontologicamente os nós do grafo em tipos fundamentais:
- `concept`: Abstrações teóricas e princípios de domínio.
- `technology`: Ferramentas, bancos de dados, linguagens e frameworks.
- `project`: Sistemas, repositórios e iniciativas de engenharia.
- `decision`: Registros de decisão arquitetural (ADRs).
- `problem` & `solution`: Diagnósticos e soluções técnicas implementadas.
- `preference` & `memory`: Aprendizados acumulados da interação com a IA.
- `reference`: Documentação externa e especificações.

### 5.2 Fase 2: Extract (`teiaEngine.ts`)
Executa a extração determinística via Regex de:
- Wikilinks simples: `[[Nome do Alvo]]` -> Aresta do tipo `references`
- Relações semânticas tipadas: `implementa:: [[Interface]]`, `depende:: [[Postgres]]` -> Aresta direcionada com rótulo semântico.
- Níveis de confiança (`trust`): `USER_VERIFIED`, `SOURCE_VERIFIED`, `AI_GENERATED`, `AI_INFERRED`, `UNVERIFIED`.

### 5.3 Fase 3: Build (`teiaEngine.ts` / `pipeline.ts`)
Constrói a matriz de adjacência unificada, resolve aliases, calcula o grau total ($K$) de cada nó e instancia nós fantasmas para referências pendentes.

### 5.4 Fase 4: Cluster & Cohesion Score (`cluster.ts`)
Implementa o algoritmo de **Propagação de Rótulos Ponderada com Estabilidade (LPA)**:
1. Inicialmente, cada nó recebe seu próprio rótulo de comunidade.
2. Em rodadas sucessivas (até convergência ou máximo de 20 iterações), cada nó adota o rótulo predominante entre seus vizinhos, ponderado pelo peso das arestas.
3. **Cálculo do Cohesion Score**:
   Para uma comunidade com $K$ membros e $E_{\text{intra}}$ conexões internas, a coesão $C$ é dada por:
   $$C = \frac{E_{\text{intra}}}{\frac{K \times (K - 1)}{2}} \quad (K > 1)$$
   Se $K \le 1$, $C = 1.0$.
4. **Heurística de Sub-divisão**:
   Comunidades que excedem $25\%$ do volume total do grafo com $K \ge 8$ são candidatas a refatoração e desmembramento.
5. **Rotulagem Automática**:
   O nome da comunidade é gerado a partir do nó central de maior grau (*Hub*), prefixado como `"Cluster: <Nome do Hub>"`.

### 5.5 Fase 5: Analyze (`analyze.ts`)
Executa diagnósticos topológicos profundos:

#### A. God Nodes (Abstrações Nucleares)
Identifica os nós de maior centralidade estrutural via score ponderado de grau e in-degree:
$$\text{Score}_{\text{god}}(v) = \text{Degree}(v) + \text{InDegree}(v) \times 0.5$$
Os nós do topo são rotulados com sua dominância percentual sobre o grafo.

#### B. Surprising Connections (Pontes Inter-Comunitárias)
Localiza arestas $(u, v)$ onde $u$ pertence à comunidade $A$ e $v$ pertence à comunidade $B$ ($A \ne B$). Calcula o score de surpresa:
$$\text{SurpriseScore}(u, v) = \frac{1}{\text{Pontes}(A, B)} + \text{DeltaTipo}(u, v)$$
Arestas entre ontologias heterogêneas (ex.: `concept` ligado a `technology`) recebem bônus de relevância.

#### C. Detecção de Ciclos
Executa busca em profundidade (DFS) com vetor de nós visitados e pilha de recursão para capturar todas as dependências circulares:
$$v_1 \rightarrow v_2 \rightarrow \dots \rightarrow v_k \rightarrow v_1$$

#### D. Perguntas Sugeridas Topológicas
Gera automaticamente perguntas de reflexão baseadas na estrutura do grafo:
- Perguntas de desacoplamento sobre God Nodes com grau excessivo.
- Perguntas de integração sobre comunidades isoladas com Cohesion Score baixo.
- Perguntas investigativas sobre nós fantasmas com múltiplos links entrantes.

### 5.6 Fase 6: Report (`export.ts`)
Gera o conteúdo textual completo de `GRAPH_REPORT.md` contendo:
- Indicadores globais: Total de Nós, Arestas, Densidade Topológica, Total de Comunidades e Nós Fantasmas.
- Tabela Markdown de God Nodes.
- Detalhamento de cada Comunidade com lista de membros, Hub e Cohesion Score percentual.
- Inventário de Conexões Surpreendentes (Pontes).
- Alertas de Ciclos e Dependências Circulares.
- Lista de Perguntas Topológicas Prioritárias para orientar a IA ou o usuário.

### 5.7 Fase 7: Export para Obsidian Canvas (`export.ts`)
Gera a estrutura JSON padrão do Obsidian Canvas:
- **Layout Espacial em Grid de Clusters**:
  Organiza as comunidades em uma grade bidimensional, calculando posições $(X, Y)$ com espaçamento de $800\text{px}$ na horizontal e $700\text{px}$ na vertical.
- **Nós de Grupo**: Cada comunidade é envolvida por um nó do tipo `"group"` com a cor do cluster.
- **Nós de Arquivo e Texto**: Cada nota do grafo é mapeada para um nó com largura de $260\text{px}$ e altura de $120\text{px}$.
- **Arestas Direcionadas**: Cria arcos com `fromSide: "right"` e `toSide: "left"` (ou superior/inferior baseado na distância vetorial).

---

## 6. O Design System Neural Obsidian / Cosmic Void v3.0

O arquivo `src/styles/teia-tokens.css` isola as variáveis cosméticas da Mente em Teia para garantir que a interface do Oh My Shark permaneça imaculada em outras rotas.

### 6.1 Mapeamento de Tokens CSS
```css
:root {
  /* Superfícies Cósmicas */
  --teia-void: #07080C;
  --teia-base: #0D0E15;
  --teia-p1: #12141F;
  --teia-p2: #181A29;
  --teia-p3: #212438;

  /* Bordas e Divisores */
  --teia-line: #1C2035;
  --teia-line-subtle: #141726;

  /* Cores de Realce (Índigo Neural) */
  --teia-accent: #7A82E6;
  --teia-accent-hover: #939BF5;
  --teia-accent-subtle: rgba(122, 130, 230, 0.12);
  --teia-accent-border: rgba(122, 130, 230, 0.35);

  /* Tipografia Técnica */
  --teia-text-bright: #F0F2FA;
  --teia-text: #D2D6EC;
  --teia-muted: #7E85A8;
  --teia-dim: #4B5070;

  /* Espectro Semântico dos Nós do Grafo */
  --teia-node-concept: #7A82E6;
  --teia-node-technology: #4AE2E8;
  --teia-node-project: #FFB86C;
  --teia-node-decision: #E5C07B;
  --teia-node-problem: #E06C75;
  --teia-node-solution: #65DCA2;
  --teia-node-idea: #C678DD;
  --teia-node-reference: #38BDF8;
  --teia-node-preference: #B8C0FF;
  --teia-node-memory: #9CB4D4;
  --teia-node-ghost: #5C6370;
}
```

### 6.2 Escopo no `AppShell.tsx`
No `src/components/layout/AppShell.tsx`, adicione a detecção da rota `/teia`:
```tsx
const location = useLocation();
const isTeia = location.pathname.startsWith("/teia");

return (
  <div
    className={`oms-app-shell ${isTeia ? "teia-environment" : ""}`}
    data-environment={isTeia ? "teia" : "ocean"}
    style={{
      backgroundColor: isTeia ? "var(--teia-void)" : "var(--color-bg)",
      color: isTeia ? "var(--teia-text)" : "var(--color-text)",
    }}
  >
    <TopBar />
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: isTeia ? "hidden" : "auto" }}>
        <Outlet />
      </main>
      {/* O Inspector global do Oh My Shark não concorre com o Inspetor próprio da Mente em Teia */}
      {!isTeia && <InspectorPanel />}
    </div>
    <StatusBar />
    <CommandPalette />
  </div>
);
```

---

## 7. Roteamento e Navegação (`Sidebar.tsx` e `router.tsx`)

### 7.1 Registro de Rota no `src/router.tsx`
Importe `TeiaPage` e registre na árvore de filhos do `AppShell`:
```tsx
import { TeiaPage } from "@/features/teia/TeiaPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <ChatPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "teia", element: <TeiaPage /> }, // Rota do Mente em Teia
      { path: "tasks", element: <TasksPage /> },
      { path: "context", element: <ContextPage /> },
      { path: "tools", element: <ToolsPage /> },
      { path: "providers", element: <ProvidersPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "system-prompt", element: <SystemPromptPage /> },
      { path: "specifications", element: <SpecificationsPage /> },
      { path: "agents", element: <AgentsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
```

### 7.2 Adição do Item na `Sidebar.tsx`
Na lista `navEntries` de `src/components/layout/Sidebar.tsx`:
```tsx
import { WebNetIcon } from "@/components/icons";

const navEntries = [
  { id: "chat", label: "Chat", path: "/", icon: <ChatIcon size={16} /> },
  { id: "teia", label: "Mente em Teia", path: "/teia", icon: <WebNetIcon size={16} /> },
  { id: "tasks", label: "Tarefas", path: "/tasks", icon: <TasksIcon size={16} />, badge: pendingTasksCount },
  // ...
];
```

---

## 8. Guia Passo a Passo de Implantação no Repositório Alvo

Existem dois caminhos de implantação comprovados para aplicar as alterações no repositório `https://github.com/LucasEntweihen/oh-my-shark.git`.

### Método A: Integração via Git Remoto e Cherry-Pick (Recomendado)

Se você já possui o repositório `oh-my-shark` clonado localmente:

1. **Acesse a pasta do repositório `oh-my-shark`**:
   ```bash
   cd /caminho/para/oh-my-shark
   git checkout main
   git pull origin main
   ```

2. **Crie uma branch isolada para a feature**:
   ```bash
   git checkout -b feat/mente-em-teia-integration
   ```

3. **Adicione o repositório da Mente em Teia como remote auxiliar**:
   ```bash
   git remote add teia-source https://github.com/LucasEntweihen/mente-em-teia.git
   git fetch teia-source
   ```

4. **Aplique os dois commits estruturais**:
   - Commit `7f9f56f`: Implementação base da Mente em Teia, componentes de UI e tokens.
   - Commit `ca4c156`: Pipeline Graphify, exportação Obsidian Canvas e análise topológica.
   ```bash
   git cherry-pick 7f9f56f
   git cherry-pick ca4c156
   ```

5. **Resolva eventuais conflitos simples** (normalmente restritos a `package.json` ou `src/router.tsx`) e confirme:
   ```bash
   git cherry-pick --continue
   ```

6. **Submeta para o repositório oficial**:
   ```bash
   git push origin feat/mente-em-teia-integration
   ```

---

### Método B: Implantação Manual Arquivo por Arquivo

Caso prefira copiar diretamente os arquivos da implementação atual (`mente-em-teia`):

1. **Copie as pastas principais**:
   - `src/features/teia/` -> copiar integralmente para `src/features/teia/` do `oh-my-shark`.
   - `src/services/graphify/` -> copiar integralmente para `src/services/graphify/`.
   - `src/services/teiaEngine.ts` -> copiar para `src/services/`.
   - `src/services/nativeDirectoryPicker.ts` -> copiar para `src/services/`.
   - `src/store/useTeiaStore.ts` -> copiar para `src/store/`.
   - `src/styles/teia-tokens.css` -> copiar para `src/styles/`.

2. **Atualize os arquivos compartilhados**:
   - Adicione `@import "./teia-tokens.css";` na linha 3 de `src/styles/globals.css`.
   - Adicione o `WebNetIcon` em `src/components/icons/vectors.tsx` e exporte em `src/components/icons/index.tsx`.
   - Atualize `src/components/layout/AppShell.tsx` com `data-environment={isTeia ? "teia" : "ocean"}` e supressão de `InspectorPanel`.
   - Adicione o item `Mente em Teia` em `src/components/layout/Sidebar.tsx`.
   - Adicione a rota `/teia` em `src/router.tsx`.
   - Copie os blocos de rota `/api/teia` e `/api/fs` para o `configureServer` de `vite.config.ts`.

3. **Valide a compilação estrita**:
   ```bash
   bun run build
   ```

---

## 9. Roteiro de Testes e Validação (Smoke Testing Checklist)

Após iniciar o servidor (`bun run dev`), execute a validação passo a passo:

- [ ] **1. Navegação**: Acesse `http://localhost:5173/teia`. A barra lateral deve transicionar visualmente para o modo *Neural Obsidian* e o `InspectorPanel` global do Oh My Shark deve desaparecer.
- [ ] **2. Inicialização do Vault**: Observe no cabeçalho o caminho `~/Desktop/Mente em Teia`. O sistema deve exibir a contagem de notas ou inicializar limpo sem travar.
- [ ] **3. Criação de Nota**: Clique em `Nova Nota`, informe título `"Arquitetura Oh My Shark"`, tipo `"concept"` e insira texto com `[[PostgreSQL]]`. Salve a nota.
- [ ] **4. Verificação no Disco**: Abra a pasta física `C:\Users\<usuario>\Desktop\Mente em Teia` e confirme a existência de `arquitetura-oh-my-shark.md` com YAML Frontmatter legível.
- [ ] **5. Detecção de Nó Fantasma**: No Canvas, verifique que `PostgreSQL` aparece com borda pontilhada cinza (`ghost: true`).
- [ ] **6. Execução do Pipeline Graphify**: No painel direito, abra a aba **Graphify** e clique em **Executar Pipeline Completo**. Verifique:
  - Comunidades semânticas detectadas com seus respectivos Cohesion Scores.
  - God Nodes identificados na tabela.
  - Alerta de nós fantasmas e perguntas topológicas sugeridas.
- [ ] **7. Exportação para Obsidian Canvas**: Clique em **Salvar Canvas no Desktop**. Verifique se o arquivo `mente-em-teia.canvas` foi criado na pasta física.
- [ ] **8. Abertura no Obsidian**: Abra o app oficial Obsidian, aponte o cofre para `~/Desktop/Mente em Teia` e abra `mente-em-teia.canvas`. Os cartões e arestas devem carregar posicionados no grid correto.
- [ ] **9. Exportação de Relatório Executivo**: Clique em **Salvar GRAPH_REPORT.md**. Verifique se o arquivo Markdown analítico foi gerado na pasta física.
- [ ] **10. Gravação de Memória IA**: No painel direito, aba **Memória IA**, registre um aprendizado e confirme que ele foi salvo com tag `#ia-memoria` e refletido no grafo em tempo real.

---

## 10. Resolução de Problemas e Casos de Borda

| Sintoma | Causa Raiz Provável | Solução Técnica |
| :--- | :--- | :--- |
| Erro `ENOENT: Desktop/Mente em Teia` no Windows | O usuário pode ter o Desktop redirecionado pelo OneDrive (`~/OneDrive/Área de Trabalho`). | O middleware em `vite.config.ts` possui fallback automático para pasta local do projeto caso a pasta de Desktop não tenha permissão de escrita. É possível também alterar a pasta a qualquer momento via modal do botão de engrenagem. |
| O Canvas do Obsidian abre em branco | O formato JSON Canvas possui nós sem dimensões `width` ou `height` válidas. | O exportador `exportToObsidianCanvas` injeta obrigatoriamente `width: 260` e `height: 120` em todos os nós, conforme a especificação JSON Canvas v1.0. |
| Nós fantasmas duplicados | Case sensitivity nos wikilinks (ex.: `[[react]]` vs `[[React]]`). | A normalização por `toSlug()` unifica referências equivalentes para o mesmo identificador sem criar arestas órfãs. |
| InspectorPanel global concorre com TeiaInspector | Condição `!isTeia` ausente no `AppShell.tsx`. | Garantir que o `AppShell` envolva o `<InspectorPanel />` com `{!isTeia && <InspectorPanel />}`. |

---

*Documento gerado com rigor técnico para o ecossistema Oh My Shark.*
*Autoridade de código e especificação: Lucas Guerriero (@LucasEntweihen).*
