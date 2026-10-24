# OMSK GUI — Interface Gráfica Oficial do Oh My Shark (Deep Ocean)

[![CI/CD](https://github.com/LucasEntweihen/OMSK-gui/actions/workflows/ci.yml/badge.svg)](https://github.com/LucasEntweihen/OMSK-gui/actions)
[![Bun](https://img.shields.io/badge/Bun-1.4+-black?logo=bun)](https://bun.sh)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Interface gráfica nativa e reativa de alto desempenho para o ecossistema **Oh My Shark (OMSK)**. Projetada com o **Deep Ocean Design System** e suporte a conexões neurais da **Mente em Teia**, streaming em tempo real via Server-Sent Events (SSE) e seletor nativo de diretórios do sistema operacional.

---

## ⚡ Destaques & Arquitetura

- **Deep Ocean Design System**: Canvas escuro oceânico (`#020A16`), contraste otimizado, tipografia Manrope / JetBrains Mono e feedback visual tático.
- **Integração Real com Motor OMSK**: Suporte a streaming contínuo via SSE (`/api/chat/stream`), com blocos de raciocínio dinâmicos (`thinking_delta`) e texto (`text_delta`).
- **Mente em Teia (Desktop Vault)**: Suporte a grafos neurais, nós semânticos, backlinks e integração direta com arquivos Markdown/Obsidian Canvas.
- **Roster Alinhado com AGENTS.md**: Shark Lead Orchestrator, Code Architect, Security Sentinel, Bible Strong Scholar, Deep Sea Sage e Especialista Autônomo.
- **Modelos de IA de Alta Performance**: Claude 3.7 Sonnet (Thinking), GPT-6 Luna (Codex), Gemini 3.1 Pro (Antigravity), DeepSeek R1 e Llama 3.3 70B.
- **Otimizado para Qualquer Máquina**: Code splitting via Rollup/Rolldown (chunks separados para `vendor`, `motion` e `charts`), rodando de forma fluida em navegadores modernos, WebViews locais e Electron/Tauri.

---

## 🛠️ Instalação e Execução

### Requisitos
- [Bun](https://bun.sh) v1.2+ (ou Node.js v20+)

### Iniciar em Desenvolvimento
```bash
bun install
bun run dev
```

Acesse no navegador: `http://localhost:5173`

### Executar Testes e Lint
```bash
# Executa a suíte de testes unitários
bun test

# Verificação estática de tipos e código
bun run lint
bun run typecheck
```

### Compilar para Produção
```bash
bun run build
```
Os artefatos minificados e otimizados são gerados no diretório `dist/`.

---

## 📂 Estrutura do Projeto

```text
OMSK-gui/
├── src/
│   ├── components/      # UI primitives, layout (TopBar, Sidebar, Inspector) e ícones SVG
│   ├── features/        # Módulos: chat, teia, agents, providers, settings, analytics, tasks
│   ├── services/        # Motores locais, grafo teiaEngine, Graphify e seletor nativo de pastas
│   ├── store/           # Zustand stores reativos (chat, app, agents, teia, context, settings)
│   ├── tests/           # Testes automatizados (Bun test runner)
│   ├── types/           # Interfaces TypeScript estritas
│   └── styles/          # Tokens globais e estilos da Mente em Teia
├── dist/                # Bundle pronto para distribuição e auto-hospedagem
└── vite.config.ts       # Configuração de build, splitting e middleware local de FS
```
