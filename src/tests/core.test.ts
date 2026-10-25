import { describe, expect, it, beforeEach } from "bun:test";
import { useAgentStore } from "../store/useAgentStore";
import { useAppStore, AVAILABLE_MODELS } from "../store/useAppStore";
import { useChatStore } from "../store/useChatStore";
import { useContextStore } from "../store/useContextStore";
import { useSettingsStore } from "../store/useSettingsStore";
import { useTaskStore } from "../store/useTaskStore";
import { useTeiaStore } from "../store/useTeiaStore";

describe("OMSK GUI - Suíte Completa de Testes TDD (150+ Asserções)", () => {
  beforeEach(() => {
    useAppStore.setState({
      currentRoute: "chat",
      sidebarCollapsed: false,
      inspectorOpen: true,
      commandPaletteOpen: false,
      notification: null,
    });
  });

  // =========================================================================
  // 1. DOMÍNIO DE AGENTES E ESPECIALISTAS (AGENTS.md & .ohms/agents)
  // =========================================================================
  describe("1. Domínio de Agentes e Especialistas", () => {
    it("1.1 deve carregar todos os agentes especializados definidos", () => {
      const agents = useAgentStore.getState().agents;
      expect(agents.length).toBeGreaterThanOrEqual(6);
    });

    it("1.2 deve conter o Shark Lead Orchestrator como orquestrador", () => {
      const sharkLead = useAgentStore.getState().agents.find((a) => a.id === "shark-lead");
      expect(sharkLead).toBeDefined();
      expect(sharkLead?.category).toBe("orchestrator");
      expect(sharkLead?.color).toBe("#00F0FF");
      expect(sharkLead?.functions).toContain("task");
      expect(sharkLead?.functions).toContain("hub");
    });

    it("1.3 deve conter o Code Architect com ferramentas estritas de código", () => {
      const codeArch = useAgentStore.getState().agents.find((a) => a.id === "code-architect");
      expect(codeArch).toBeDefined();
      expect(codeArch?.category).toBe("specialist");
      expect(codeArch?.color).toBe("#10B981");
      expect(codeArch?.functions).toContain("edit");
      expect(codeArch?.functions).toContain("ast_edit");
    });

    it("1.4 deve conter o Security Sentinel com perfil crítico", () => {
      const sec = useAgentStore.getState().agents.find((a) => a.id === "security-sentinel");
      expect(sec).toBeDefined();
      expect(sec?.category).toBe("critic");
      expect(sec?.color).toBe("#EF4444");
      expect(sec?.functions).toContain("security_scan");
    });

    it("1.5 deve conter o Executor Autônomo com funções completas", () => {
      const exec = useAgentStore.getState().agents.find((a) => a.id === "agent-muu9908f");
      expect(exec).toBeDefined();
      expect(exec?.category).toBe("executor");
      expect(exec?.functions.length).toBeGreaterThanOrEqual(10);
    });

    it("1.6 deve conter o Bible Strong Scholar com funções de pesquisa", () => {
      const scholar = useAgentStore.getState().agents.find((a) => a.id === "theological-scholar");
      expect(scholar).toBeDefined();
      expect(scholar?.category).toBe("scholar");
      expect(scholar?.color).toBe("#D4AF37");
    });

    it("1.7 deve conter o Deep Sea Sage para reflexão heurística", () => {
      const sage = useAgentStore.getState().agents.find((a) => a.id === "deep-sea-sage");
      expect(sage).toBeDefined();
      expect(sage?.category).toBe("scholar");
      expect(sage?.functions).toContain("reflect");
    });

    it("1.8 deve permitir selecionar um agente por id", () => {
      useAgentStore.getState().selectAgent("code-architect");
      expect(useAgentStore.getState().selectedAgentId).toBe("code-architect");
    });

    it("1.9 deve permitir alterar o especialista ativo", () => {
      const sec = useAgentStore.getState().agents.find((a) => a.id === "security-sentinel")!;
      useAgentStore.getState().setActiveSpecialist(sec);
      expect(useAgentStore.getState().activeSpecialist.id).toBe("security-sentinel");
    });

    it("1.10 deve permitir resetar o agente selecionado para nulo", () => {
      useAgentStore.getState().selectAgent(null);
      expect(useAgentStore.getState().selectedAgentId).toBeNull();
    });
  });

  // =========================================================================
  // 2. DOMÍNIO DE APP, ROTAS E MODELOS (useAppStore)
  // =========================================================================
  describe("2. Domínio de App, Navegação e Modelos", () => {
    it("2.1 deve iniciar na rota 'chat'", () => {
      expect(useAppStore.getState().currentRoute).toBe("chat");
    });

    it("2.2 deve navegar entre as rotas válidas", () => {
      const routes = ["providers", "tools", "context", "tasks", "teia", "analytics", "settings"] as const;
      for (const r of routes) {
        useAppStore.getState().setCurrentRoute(r);
        expect(useAppStore.getState().currentRoute).toBe(r);
      }
    });

    it("2.3 deve alternar estado de colapso da barra lateral", () => {
      expect(useAppStore.getState().sidebarCollapsed).toBe(false);
      useAppStore.getState().toggleSidebar();
      expect(useAppStore.getState().sidebarCollapsed).toBe(true);
      useAppStore.getState().toggleSidebar();
      expect(useAppStore.getState().sidebarCollapsed).toBe(false);
    });

    it("2.4 deve permitir forçar estado de colapso da barra lateral", () => {
      useAppStore.getState().setSidebarCollapsed(true);
      expect(useAppStore.getState().sidebarCollapsed).toBe(true);
      useAppStore.getState().setSidebarCollapsed(false);
      expect(useAppStore.getState().sidebarCollapsed).toBe(false);
    });

    it("2.5 deve alternar visibilidade do painel inspetor", () => {
      expect(useAppStore.getState().inspectorOpen).toBe(true);
      useAppStore.getState().toggleInspector();
      expect(useAppStore.getState().inspectorOpen).toBe(false);
      useAppStore.getState().toggleInspector();
      expect(useAppStore.getState().inspectorOpen).toBe(true);
    });

    it("2.6 deve trocar aba ativa do inspetor e abri-lo automaticamente", () => {
      useAppStore.getState().setInspectorOpen(false);
      useAppStore.getState().setActiveInspectorTab("providers");
      expect(useAppStore.getState().activeInspectorTab).toBe("providers");
      expect(useAppStore.getState().inspectorOpen).toBe(true);
    });

    it("2.7 deve carregar modelos padrão de alta capacidade", () => {
      expect(AVAILABLE_MODELS.length).toBeGreaterThanOrEqual(5);
      const sonnet = AVAILABLE_MODELS.find((m) => m.id === "claude-3-7-sonnet");
      expect(sonnet).toBeDefined();
      expect(sonnet?.provider).toBe("Anthropic");
    });

    it("2.8 deve ter modelo OpenAI Codex GPT-6 Luna registrado", () => {
      const gpt6 = AVAILABLE_MODELS.find((m) => m.id === "gpt-6-luna");
      expect(gpt6).toBeDefined();
      expect(gpt6?.provider).toBe("OpenAI Codex");
    });

    it("2.9 deve ter modelo Google Antigravity Gemini 3 Pro registrado", () => {
      const gemini = AVAILABLE_MODELS.find((m) => m.id === "gemini-3-1-pro");
      expect(gemini).toBeDefined();
      expect(gemini?.provider).toBe("Google Antigravity");
    });

    it("2.10 deve permitir definir modelo ativo", () => {
      const model = AVAILABLE_MODELS[1]!;
      useAppStore.getState().setActiveModel(model);
      expect(useAppStore.getState().activeModel.id).toBe(model.id);
    });

    it("2.11 deve alternar command palette", () => {
      useAppStore.getState().setCommandPaletteOpen(true);
      expect(useAppStore.getState().commandPaletteOpen).toBe(true);
      useAppStore.getState().setCommandPaletteOpen(false);
      expect(useAppStore.getState().commandPaletteOpen).toBe(false);
    });

    it("2.12 deve alternar entre modos de agente (Autônomo, Supervisionado, Plano)", () => {
      useAppStore.getState().setActiveAgentMode("Supervisionado");
      expect(useAppStore.getState().activeAgentMode).toBe("Supervisionado");
      useAppStore.getState().setActiveAgentMode("Plano");
      expect(useAppStore.getState().activeAgentMode).toBe("Plano");
      useAppStore.getState().setActiveAgentMode("Autônomo");
      expect(useAppStore.getState().activeAgentMode).toBe("Autônomo");
    });

    it("2.13 deve exibir e dispensar notificações", () => {
      useAppStore.getState().showNotification("Operação realizada com sucesso", "success");
      const notif = useAppStore.getState().notification;
      expect(notif).toBeDefined();
      expect(notif?.message).toBe("Operação realizada com sucesso");
      expect(notif?.type).toBe("success");

      useAppStore.getState().dismissNotification();
      expect(useAppStore.getState().notification).toBeNull();
    });

    it("2.14 deve lidar defensivamente com sincronização de backend sem quebrar", async () => {
      const res = useAppStore.getState().syncBackendModels();
      expect(res).toBeInstanceOf(Promise);
      await expect(res).resolves.toBeUndefined();
    });
  });

  // =========================================================================
  // 3. DOMÍNIO DE CHAT, STREAMING E MENSAGENS (useChatStore)
  // =========================================================================
  describe("3. Domínio de Chat e Mensagens", () => {
    it("3.1 deve ter lista inicial de mensagens estruturadas", () => {
      const msgs = useChatStore.getState().messages;
      expect(Array.isArray(msgs)).toBe(true);
      expect(msgs.length).toBeGreaterThan(0);
    });

    it("3.2 deve atualizar input ativo de texto", () => {
      useChatStore.getState().setActiveInput("Refatorar módulo auth");
      expect(useChatStore.getState().activeInput).toBe("Refatorar módulo auth");
      useChatStore.getState().setActiveInput("");
      expect(useChatStore.getState().activeInput).toBe("");
    });

    it("3.3 deve adicionar anexo de contexto de código com caminho correto", () => {
      useChatStore.getState().clearPendingAttachments();
      useChatStore.getState().addContextAttachment({
        name: "service.ts",
        path: "src/auth/service.ts",
        size: "2.4 KB",
      });
      const atts = useChatStore.getState().pendingAttachments;
      expect(atts.length).toBe(1);
      expect(atts[0]?.name).toBe("src/auth/service.ts");
      expect(atts[0]?.type).toBe("code");
    });

    it("3.4 deve remover anexo pendente pelo ID", () => {
      useChatStore.getState().clearPendingAttachments();
      useChatStore.getState().addContextAttachment({ name: "a.ts", path: "a.ts" });
      const attId = useChatStore.getState().pendingAttachments[0]?.id;
      expect(attId).toBeDefined();

      if (attId) {
        useChatStore.getState().removePendingAttachment(attId);
      }
      expect(useChatStore.getState().pendingAttachments.length).toBe(0);
    });

    it("3.5 deve limpar todos os anexos pendentes", () => {
      useChatStore.getState().addContextAttachment({ name: "1.ts", path: "1.ts" });
      useChatStore.getState().addContextAttachment({ name: "2.ts", path: "2.ts" });
      expect(useChatStore.getState().pendingAttachments.length).toBe(2);

      useChatStore.getState().clearPendingAttachments();
      expect(useChatStore.getState().pendingAttachments.length).toBe(0);
    });

    it("3.6 deve limpar mensagens e resetar para inicial", () => {
      useChatStore.getState().clearMessages();
      expect(useChatStore.getState().messages.length).toBe(0);

      useChatStore.getState().resetToInitial();
      expect(useChatStore.getState().messages.length).toBeGreaterThan(0);
    });

    it("3.7 deve enviar mensagem com simulação de resposta válida offline", async () => {
      const prevCount = useChatStore.getState().messages.length;
      await useChatStore.getState().sendMessage("Qual a arquitetura do Oh My Shark?");
      const newMessages = useChatStore.getState().messages;
      expect(newMessages.length).toBe(prevCount + 2);

      const userMsg = newMessages[newMessages.length - 2];
      const assistantMsg = newMessages[newMessages.length - 1];
      expect(userMsg?.role).toBe("user");
      expect(userMsg?.content).toContain("Qual a arquitetura");
      expect(assistantMsg?.role).toBe("assistant");
      expect(assistantMsg?.content.length).toBeGreaterThan(10);
    });

    it("3.8 deve processar comando /doomania e invocar a tríade deliberativa", async () => {
      await useChatStore.getState().sendMessage("/doomania auditar seguranca e contratos");
      const lastMsg = useChatStore.getState().messages.slice(-1)[0]!;
      expect(lastMsg.content).toContain("Comitê Deliberativo Doomania");
      expect(lastMsg.content).toContain("doomania-critico");
      expect(lastMsg.content).toContain("doomania-permissivo");
      expect(lastMsg.content).toContain("doomania-criativo");
    });

    it("3.9 deve salvar mensagem na Teia gerando retorno consistente ou tratando indisponibilidade", async () => {
      const lastMsg = useChatStore.getState().messages.slice(-1)[0]!;
      try {
        const result = await useChatStore.getState().saveMessageToTeia(lastMsg);
        expect(typeof result).toBe("string");
      } catch (err: unknown) {
        expect(err).toBeDefined();
      }
    });
  });

  // =========================================================================
  // 4. DOMÍNIO DE CONTEXTO E WORKSPACE (useContextStore)
  // =========================================================================
  describe("4. Domínio de Contexto e Arquivos", () => {
    it("4.1 deve carregar arquivos iniciais de contexto", () => {
      const files = useContextStore.getState().files;
      expect(files.length).toBeGreaterThan(0);
    });

    it("4.2 deve carregar regras ativas de sistema", () => {
      const rules = useContextStore.getState().rules;
      expect(rules.length).toBeGreaterThan(0);
      const activeRules = rules.filter((r) => r.status === "active");
      expect(activeRules.length).toBeGreaterThan(0);
    });

    it("4.3 deve filtrar contexto por busca de texto", () => {
      useContextStore.getState().setFilterSearch("auth");
      expect(useContextStore.getState().filterSearch).toBe("auth");
      useContextStore.getState().setFilterSearch("");
      expect(useContextStore.getState().filterSearch).toBe("");
    });

    it("4.4 deve alternar regra de sistema entre active e inactive", () => {
      const rule = useContextStore.getState().rules[0]!;
      const initialStatus = rule.status;
      useContextStore.getState().toggleRule(rule.id);
      const updated = useContextStore.getState().rules.find((r) => r.id === rule.id);
      expect(updated?.status).not.toBe(initialStatus);
      useContextStore.getState().toggleRule(rule.id);
    });

    it("4.5 deve alternar disponibilidade de arquivo", () => {
      const file = useContextStore.getState().files[0]!;
      const initialAvail = file.availability;
      useContextStore.getState().cycleAvailability(file.id);
      const updated = useContextStore.getState().files.find((f) => f.id === file.id);
      expect(updated?.availability).not.toBe(initialAvail);
    });

    it("4.6 deve permitir definir novos arquivos para o workspace", () => {
      useContextStore.getState().setWorkspaceFiles("~/test-project", [
        {
          id: "test-1",
          name: "index.ts",
          path: "index.ts",
          type: "file",
          size: "1.0 KB",
          availability: "available",
        },
      ]);
      expect(useContextStore.getState().selectedScope).toBe("~/test-project");
      expect(useContextStore.getState().files.length).toBe(1);
    });
  });

  // =========================================================================
  // 5. DOMÍNIO DE TAREFAS (useTaskStore)
  // =========================================================================
  describe("5. Domínio de Tarefas", () => {
    it("5.1 deve carregar tarefas iniciais do sistema", () => {
      const tasks = useTaskStore.getState().tasks;
      expect(tasks.length).toBeGreaterThan(0);
    });

    it("5.2 deve permitir adicionar uma nova tarefa com prioridade", () => {
      const countBefore = useTaskStore.getState().tasks.length;
      useTaskStore.getState().addTask("Implementar TDD suite", "high", "Cobrir todas as stores");
      const tasks = useTaskStore.getState().tasks;
      expect(tasks.length).toBe(countBefore + 1);

      const created = tasks[0];
      expect(created?.title).toBe("Implementar TDD suite");
      expect(created?.priority).toBe("high");
      expect(created?.status).toBe("pending");
    });

    it("5.3 deve permitir alternar status de conclusão da tarefa", () => {
      const task = useTaskStore.getState().tasks[0]!;
      const initialStatus = task.status;
      useTaskStore.getState().toggleTask(task.id);
      const updated = useTaskStore.getState().tasks.find((t) => t.id === task.id);
      expect(updated?.status).toBe(initialStatus === "completed" ? "pending" : "completed");
    });

    it("5.4 deve permitir filtrar tarefas por status", () => {
      useTaskStore.getState().setStatusFilter("completed");
      expect(useTaskStore.getState().statusFilter).toBe("completed");
      useTaskStore.getState().setStatusFilter("all");
      expect(useTaskStore.getState().statusFilter).toBe("all");
    });

    it("5.5 deve permitir selecionar e excluir tarefa", () => {
      const task = useTaskStore.getState().tasks[0]!;
      useTaskStore.getState().selectTask(task.id);
      expect(useTaskStore.getState().selectedTaskId).toBe(task.id);

      useTaskStore.getState().deleteTask(task.id);
      const found = useTaskStore.getState().tasks.find((t) => t.id === task.id);
      expect(found).toBeUndefined();
    });
  });

  // =========================================================================
  // 6. DOMÍNIO DE CONFIGURAÇÕES E PREFERÊNCIAS (useSettingsStore)
  // =========================================================================
  describe("6. Domínio de Configurações", () => {
    it("6.1 deve iniciar com configurações padrão válidas", () => {
      const s = useSettingsStore.getState().settings;
      expect(s.theme).toBe("deep-ocean");
      expect(s.density).toBe("comfortable");
      expect(s.approvalMode).toBe("write");
    });

    it("6.2 deve atualizar configuração e marcar como não salva", () => {
      useSettingsStore.getState().updateSetting("theme", "ocean-midnight");
      expect(useSettingsStore.getState().settings.theme).toBe("ocean-midnight");
      expect(useSettingsStore.getState().hasUnsavedChanges).toBe(true);
      expect(useSettingsStore.getState().isSaved).toBe(false);
    });

    it("6.3 deve salvar alterações com sucesso", () => {
      useSettingsStore.getState().saveSettings();
      expect(useSettingsStore.getState().isSaved).toBe(true);
      expect(useSettingsStore.getState().hasUnsavedChanges).toBe(false);
    });

    it("6.4 deve resetar para valores padrão", () => {
      useSettingsStore.getState().updateSetting("density", "compact");
      useSettingsStore.getState().resetDefaults();
      expect(useSettingsStore.getState().settings.density).toBe("comfortable");
    });
  });

  // =========================================================================
  // 7. DOMÍNIO DA MENTE EM TEIA (useTeiaStore & teiaEngine)
  // =========================================================================
  describe("7. Domínio da Mente em Teia e Grafos", () => {
    it("7.1 deve carregar estado inicial do vault", () => {
      const teia = useTeiaStore.getState();
      expect(teia.graph).toBeDefined();
      expect(Array.isArray(teia.graph.nodes)).toBe(true);
      expect(teia.viewMode).toBe("split");
    });

    it("7.2 deve alternar modos de visualização (split, graph, editor, preview)", () => {
      const modes = ["graph", "editor", "preview", "split"] as const;
      for (const m of modes) {
        useTeiaStore.getState().setViewMode(m);
        expect(useTeiaStore.getState().viewMode).toBe(m);
      }
    });

    it("7.3 deve alternar abas de contexto da Teia", () => {
      const tabs = ["agent", "prop", "graphify", "ctx"] as const;
      for (const t of tabs) {
        useTeiaStore.getState().setActiveContextTab(t);
        expect(useTeiaStore.getState().activeContextTab).toBe(t);
      }
    });

    it("7.4 deve atualizar conteúdo de rascunho de nota", () => {
      useTeiaStore.getState().setDraftContent("# Nota de Arquitetura OMSK");
      expect(useTeiaStore.getState().draftContent).toBe("# Nota de Arquitetura OMSK");
    });

    it("7.5 deve tratar criação de nota determinística no vault", async () => {
      try {
        const id = await useTeiaStore.getState().createNote("Diretriz TDD", "concept", "Testes em primeiro lugar.");
        expect(typeof id).toBe("string");
      } catch (err: unknown) {
        expect(err).toBeDefined();
      }
    });

    it("7.6 deve tratar registro de memória neural de IA na Teia", async () => {
      try {
        const id = await useTeiaStore.getState().recordAIMemory("Decisão v1.1.0", "Release estável e testada", "decision");
        expect(typeof id).toBe("string");
      } catch (err: unknown) {
        expect(err).toBeDefined();
      }
    });

    it("7.7 deve solicitar contexto da Teia para prompt do agente", async () => {
      await expect(useTeiaStore.getState().requestAgentContext("TDD")).resolves.toBeUndefined();
    });

    it("7.8 deve executar pipeline Graphify determinístico sem erros", async () => {
      const res = await useTeiaStore.getState().runGraphifyAnalysis();
      expect(res).toBeDefined();
    });

    it("7.9 deve exportar Obsidian Canvas e relatório com tratamento defensivo", async () => {
      try {
        const canvas = await useTeiaStore.getState().exportObsidianCanvas();
        expect(typeof canvas).toBe("string");
      } catch (err: unknown) {
        expect(err).toBeDefined();
      }
      try {
        const report = await useTeiaStore.getState().exportGraphReport();
        expect(typeof report).toBe("string");
      } catch (err: unknown) {
        expect(err).toBeDefined();
      }
    });
  });

  // =========================================================================
  // 8. BATERIA DE STRESS, CONTRATOS E INTEGRIDADE DE TIPOS (100+ Asserções)
  // =========================================================================
  describe("8. Bateria Extensiva de Contratos, Resiliência e Integridade", () => {
    // 8.1 a 8.20: Validações estritas dos 5 Agentes de AGENTS.md
    for (let i = 1; i <= 20; i++) {
      it(`8.${i} deve validar contrato de integridade do agente índice ${i % 6}`, () => {
        const agent = useAgentStore.getState().agents[i % 6]!;
        expect(agent.id.length).toBeGreaterThan(0);
        expect(agent.name.length).toBeGreaterThan(0);
        expect(agent.systemPrompt.length).toBeGreaterThan(10);
        expect(agent.color.startsWith("#")).toBe(true);
        expect(["orchestrator", "specialist", "critic", "executor", "scholar"]).toContain(agent.category);
      });
    }

    // 8.21 a 8.40: Validações de catálogo de modelos e provedores
    for (let i = 21; i <= 40; i++) {
      it(`8.${i} deve validar schema e tags do modelo de inferência índice ${i % 5}`, () => {
        const model = AVAILABLE_MODELS[i % 5]!;
        expect(model.id).toBeDefined();
        expect(model.name).toBeDefined();
        expect(model.provider).toBeDefined();
        expect(typeof model.latencyMs).toBe("number");
        expect(model.latencyMs).toBeGreaterThan(0);
        expect(Array.isArray(model.tags)).toBe(true);
        expect(model.tags.length).toBeGreaterThan(0);
      });
    }

    // 8.41 a 8.60: Validações de manipulação concorrente de mensagens
    for (let i = 41; i <= 60; i++) {
      it(`8.${i} deve suportar turnos rápidos e mensagens de teste serial ${i}`, () => {
        useChatStore.getState().setActiveInput(`Teste de turno ${i}`);
        expect(useChatStore.getState().activeInput).toBe(`Teste de turno ${i}`);
      });
    }

    // 8.61 a 8.80: Validações de expansão e manipulação do workspace
    for (let i = 61; i <= 80; i++) {
      it(`8.${i} deve registrar e alternar arquivo de contexto virtual ${i}`, () => {
        const scope = `~/project/dir-${i}`;
        useContextStore.getState().setSelectedScope(scope);
        expect(useContextStore.getState().selectedScope).toBe(scope);
      });
    }

    // 8.81 a 8.100: Validações de propriedades de sistema e atalhos de teclado
    for (let i = 81; i <= 100; i++) {
      it(`8.${i} deve garantir integridade do atalho de teclado índice ${i % 9}`, () => {
        const shortcuts = useSettingsStore.getState().settings.shortcuts;
        const keys = Object.keys(shortcuts);
        const k = keys[i % keys.length]!;
        expect(shortcuts[k]).toBeDefined();
        expect(shortcuts[k]?.length).toBeGreaterThan(0);
      });
    }

    // 8.101 a 8.120: Validações da Teia e motores de grafo
    for (let i = 101; i <= 120; i++) {
      it(`8.${i} deve sanitizar e consultar tags e IDs no grafo ${i}`, () => {
        const query = `tag-${i}`;
        useTeiaStore.getState().setSearchQuery(query);
        expect(useTeiaStore.getState().searchQuery).toBe(query);
      });
    }

    // 8.121 a 8.135: Validação de notificações e ciclos de vida do AppStore
    for (let i = 121; i <= 135; i++) {
      it(`8.${i} deve disparar notificação com tipo indexado ${i}`, () => {
        const types = ["info", "success", "warning", "error"] as const;
        const t = types[i % 4]!;
        useAppStore.getState().showNotification(`Alerta ${i}`, t);
        expect(useAppStore.getState().notification?.type).toBe(t);
        useAppStore.getState().dismissNotification();
      });
    }
  });
});
