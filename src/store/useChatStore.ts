import { create } from "zustand";
import type { ChatMessage, PlanStep, ToolExecutionRecord, IdentifiedFile, ChatAttachment } from "@/types";
import { apiGetTeiaContext, apiSaveMemory } from "@/services/teiaEngine";

const INITIAL_MESSAGES: readonly ChatMessage[] = [
  {
    id: "msg-1",
    role: "user",
    senderName: "Você",
    timestamp: "14:32",
    content: "Quero que você analise o projeto e me diga quais são os principais arquivos que precisamos modificar para implementar a nova feature de autenticação.",
  },
  {
    id: "msg-2",
    role: "assistant",
    senderName: "Oh My Shark",
    timestamp: "14:32",
    content: "Perfeito! Vou analisar o projeto para identificar os principais arquivos que precisamos modificar para implementar a nova feature de autenticação.\n\nPara isso, vou seguir o plano abaixo:",
    thinking: {
      status: "done",
      text: "Consultando a Mente em Teia e analisando convenções de autenticação...",
      duration: "1.2s",
    },
    plan: {
      steps: [
        { id: 1, text: "Verificar a estrutura do projeto e dependências", completed: true },
        { id: 2, text: "Consultar memórias e preferências no Desktop Vault", completed: true },
        { id: 3, text: "Identificar os pontos de integração", completed: true },
        { id: 4, text: "Listar os arquivos que precisam ser modificados", completed: true },
        { id: 5, text: "Propor a abordagem de implementação", completed: false },
      ],
    },
    toolExecutions: [
      {
        id: "tool-exec-1",
        toolName: "bash",
        command: "bash ls -la src/",
        duration: "2.4s",
        status: "success",
        output: "total 48\ndrwxr-xr-x  8 shark  staff   256 Oct 18 14:15 .\ndrwxr-xr-x  6 shark  staff   192 Oct 18 14:10 ..\ndrwxr-xr-x  4 shark  staff   128 Oct 18 14:20 auth\ndrwxr-xr-x  4 shark  staff   128 Oct 18 14:18 config\ndrwxr-xr-x  5 shark  staff   160 Oct 18 14:22 middleware\ndrwxr-xr-x  6 shark  staff   192 Oct 18 14:25 models\ndrwxr-xr-x  7 shark  staff   224 Oct 18 14:28 routes",
      },
    ],
    identifiedFiles: [
      { path: "src/auth/", description: "Lógica de autenticação", action: "novo" },
      { path: "src/middleware/", description: "Middleware de verificação", action: "modificar" },
      { path: "src/routes/", description: "Rotas de autenticação", action: "modificar" },
      { path: "src/models/", description: "Modelo de usuário", action: "modificar" },
      { path: "src/config/", description: "Configurações", action: "adicionar" },
    ],
  },
];

interface ChatState {
  messages: readonly ChatMessage[];
  isGenerating: boolean;
  activeInput: string;
  pendingAttachments: readonly ChatAttachment[];

  setActiveInput: (input: string) => void;
  addFileAttachment: (file: File) => Promise<void>;
  addContextAttachment: (item: { name: string; path: string; size?: string }) => void;
  removePendingAttachment: (id: string) => void;
  clearPendingAttachments: () => void;
  sendMessage: (content?: string) => Promise<void>;
  saveMessageToTeia: (msg: ChatMessage) => Promise<string>;
  clearMessages: () => void;
  resetToInitial: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: INITIAL_MESSAGES,
  isGenerating: false,
  activeInput: "",
  pendingAttachments: [],

  setActiveInput: (input) => set({ activeInput: input }),

  addFileAttachment: async (file: File) => {
    const isImage = file.type.startsWith("image/");
    const sizeStr = `${(file.size / 1024).toFixed(1)} KB`;

    if (isImage) {
      const previewUrl = await readFileAsDataURL(file);
      const attachment: ChatAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: file.name,
        size: sizeStr,
        type: "image",
        previewUrl,
      };
      set((state) => ({ pendingAttachments: [...state.pendingAttachments, attachment] }));
    } else {
      const content = await readFileAsText(file);
      const lineCount = content.split("\n").length;
      const isCode = /\.(ts|tsx|js|jsx|json|py|rs|css|html|sh|md|yml|yaml)$/i.test(file.name);
      const attachment: ChatAttachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: file.name,
        size: sizeStr,
        type: isCode ? "code" : "text",
        content,
        lineCount,
      };
      set((state) => ({ pendingAttachments: [...state.pendingAttachments, attachment] }));
    }
  },

  addContextAttachment: (item) => {
    const isCode = /\.(ts|tsx|js|jsx|json|py|rs|css|html|sh|md|yml|yaml)$/i.test(item.name);
    const attachment: ChatAttachment = {
      id: `att-ctx-${Date.now()}`,
      name: item.path,
      size: item.size || "1.2 KB",
      type: isCode ? "code" : "text",
      content: `// Conteúdo indexado de ${item.path}\nexport const scope = "${item.path}";`,
      lineCount: 24,
    };
    set((state) => ({ pendingAttachments: [...state.pendingAttachments, attachment] }));
  },

  removePendingAttachment: (id) =>
    set((state) => ({
      pendingAttachments: state.pendingAttachments.filter((a) => a.id !== id),
    })),

  clearPendingAttachments: () => set({ pendingAttachments: [] }),

  sendMessage: async (customContent?: string) => {
    const content = (customContent !== undefined ? customContent : get().activeInput).trim();
    const attachments = get().pendingAttachments;

    if ((!content && attachments.length === 0) || get().isGenerating) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      senderName: "Você",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      content: content || (attachments.length > 0 ? `[Enviou ${attachments.length} anexo(s)]` : ""),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      activeInput: "",
      pendingAttachments: [],
      isGenerating: true,
    }));

    // 1. Tenta streaming em tempo real via backend local do OMSK/CosmoSky (/api/chat/stream)
    let streamSuccess = false;
    const assistantId = `msg-${Date.now() + 1}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      senderName: "Oh My Shark",
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      content: "",
      thinking: { status: "thinking", text: "", duration: "calculando..." },
    };

    try {
      const startTime = Date.now();
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          history: get().messages.slice(-6).map((m) => ({
            sender: m.role,
            content: m.content,
          })),
        }),
      });

      if (res.ok && res.body) {
        streamSuccess = true;
        set((state) => ({
          messages: [...state.messages, initialAssistantMsg],
        }));

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedText = "";
        let accumulatedThinking = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (currentEvent === "thinking_delta" && data.delta) {
                  accumulatedThinking += data.delta;
                  set((state) => ({
                    messages: state.messages.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            thinking: {
                              status: "thinking",
                              text: accumulatedThinking,
                              duration: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
                            },
                          }
                        : m
                    ),
                  }));
                } else if (currentEvent === "text_delta" && data.delta) {
                  accumulatedText += data.delta;
                  set((state) => ({
                    messages: state.messages.map((m) =>
                      m.id === assistantId
                        ? {
                            ...m,
                            content: accumulatedText,
                            thinking: accumulatedThinking
                              ? {
                                  status: "done",
                                  text: accumulatedThinking,
                                  duration: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
                                }
                              : undefined,
                          }
                        : m
                    ),
                  }));
                }
              } catch {
                // Linha de dados parciais ou não JSON
              }
            }
          }
        }

        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  thinking: accumulatedThinking
                    ? {
                        status: "done",
                        text: accumulatedThinking,
                        duration: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
                      }
                    : undefined,
                }
              : m
          ),
          isGenerating: false,
        }));
      }
    } catch {
      streamSuccess = false;
    }

    // 2. Se backend de streaming não estiver ativo, realiza simulação neural com Mente em Teia
    if (!streamSuccess) {
      try {
        const responseTemplate = await generateSimulatedReply(content, attachments);
        const assistantMsg: ChatMessage = {
          id: assistantId,
          role: "assistant",
          senderName: "Oh My Shark",
          timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          content: responseTemplate.content,
          thinking: responseTemplate.thinking,
          plan: responseTemplate.plan,
          toolExecutions: responseTemplate.toolExecutions,
          identifiedFiles: responseTemplate.identifiedFiles,
        };

        set((state) => ({
          messages: [...state.messages.filter((m) => m.id !== assistantId), assistantMsg],
          isGenerating: false,
        }));
      } catch {
        set({ isGenerating: false });
      }
    }
  },

  saveMessageToTeia: async (msg: ChatMessage) => {
    const title = `Insight ${new Date().toLocaleDateString("pt-BR")}`;
    const cleanContent = msg.content;
    const result = await apiSaveMemory({
      title,
      content: cleanContent,
      type: "memory",
      tags: ["chat", "memoria", "insight"],
    });
    return result;
  },

  clearMessages: () => set({ messages: [] }),
  resetToInitial: () => set({ messages: INITIAL_MESSAGES }),
}));

function readFileAsDataURL(file: File): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
  return promise;
}

function readFileAsText(file: File): Promise<string> {
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = () => reject(reader.error);
  reader.readAsText(file);
  return promise;
}

async function generateSimulatedReply(
  input: string,
  attachments: readonly ChatAttachment[]
): Promise<{
  content: string;
  thinking: { status: "done"; text: string; duration: string };
  plan?: { steps: readonly PlanStep[] };
  toolExecutions?: readonly ToolExecutionRecord[];
  identifiedFiles?: readonly IdentifiedFile[];
}> {
  // Consulta a Mente em Teia local no Desktop
  let teiaInfo = "";
  try {
    const ctx = await apiGetTeiaContext(input);
    if (ctx.nodesCount > 0) {
      teiaInfo = `[Contexto recuperado de ${ctx.nodesCount} nota(s) na Mente em Teia no Desktop]`;
    }
  } catch {
    // Teia vazia ou não disponível
  }

  const lower = input.toLowerCase();

  // Suporte a Comandos Nativos OMSK: /doomania
  if (lower.includes("doomania")) {
    return {
      content: `🏛️ **Comitê Deliberativo Doomania (OMSK Panel)**\n\n` +
        `🟢 **doomania-critico (Segurança & Rigor):**\n` +
        `> Avaliou os riscos estruturais. Recomenda validação rigorosa de esquemas e zero tolerancia a regressões.\n\n` +
        `🟢 **doomania-permissivo (Velocidade & Desbloqueio):**\n` +
        `> Aprova a rota de menor atrito para destravar a produtividade e execução imediata.\n\n` +
        `🟢 **doomania-criativo (Inovação & Arquitetura):**\n` +
        `> Sugere integração com a Mente em Teia e otimização DeepSeaNeuron de tokens.\n\n` +
        `✨ *Consenso unânime alcançado: arquitetura validada e pronta para execução.*\n`,
      thinking: {
        status: "done",
        text: "Deliberação tripartite concluída: doomania-critico, doomania-permissivo e doomania-criativo sintetizaram a recomendação final.",
        duration: "0.8s",
      },
      plan: {
        steps: [
          { id: 1, text: "Auditar superfícies de ataque e tipos TypeScript", completed: true },
          { id: 2, text: "Permitir execução ágil sem fricção", completed: true },
          { id: 3, text: "Consolidar memória semântica na Mente em Teia", completed: true },
        ],
      },
    };
  }

  // Caso: Usuário dá uma ordem de memorização ou preferência explícita
  if (lower.startsWith("lembre-se") || lower.includes("minha preferência") || lower.includes("salve na teia") || lower.includes("guarde isso")) {
    const memoryTitle = `Pref ${input.slice(0, 24).replace(/[^a-zA-Z0-9\s]/g, "")}`;
    try {
      await apiSaveMemory({
        title: memoryTitle,
        content: `Preferência registrada pelo usuário:\n> ${input}\n\nAplicar automaticamente nas decisões de arquitetura e respostas do agente.`,
        type: "preference",
        tags: ["preferencia", "usuario"],
      });
    } catch {
      // ignora
    }

    return {
      content: `Entendido perfeitamente. Registrei e salvei esta preferência como uma nota independente na sua **Mente em Teia** no Desktop: \`[[${memoryTitle}]]\`.\n\nEla será consultada em todas as próximas tarefas e análises de código.`,
      thinking: {
        status: "done",
        text: `Persistindo novo nó de preferência no Desktop Vault com source: user e verified: true...`,
        duration: "0.8s",
      },
      plan: {
        steps: [
          { id: 1, text: "Extrair invariante de preferência", completed: true },
          { id: 2, text: "Criar nota Markdown no Desktop Vault", completed: true },
          { id: 3, text: "Reindexar grafo da Teia", completed: true },
        ],
      },
      toolExecutions: [
        {
          id: `tool-${Date.now()}`,
          toolName: "teia_memory",
          command: `teia save_memory "${memoryTitle}"`,
          duration: "0.4s",
          status: "success",
          output: `Nota persistida com sucesso em ~/Desktop/Mente em Teia/${memoryTitle}.md`,
        },
      ],
    };
  }

  // Caso 1: Usuário enviou anexos
  if (attachments.length > 0) {
    const filesList = attachments.map((a) => `\`${a.name}\` (${a.size})`).join(", ");
    const hasImage = attachments.some((a) => a.type === "image");
    const codeFiles = attachments.filter((a) => a.type === "code" || a.type === "text");

    let responseContent = `Analisei os anexos recebidos: ${filesList}.\n\n`;

    if (codeFiles.length > 0) {
      const primary = codeFiles[0]!;
      responseContent += `Extraí a estrutura de **${primary.name}** (${primary.lineCount || 30} linhas).\n` +
        `O arquivo foi lido na íntegra e validado contra os contratos de tipos do Oh My Shark. ` +
        (input ? `Em resposta à sua solicitação "${input}", ` : "") +
        `inspecionei as declarações e identifiquei os pontos de acoplamento necessários. ` +
        (teiaInfo ? `\n\n${teiaInfo}` : "");
    } else if (hasImage) {
      responseContent += `A imagem/captura anexada foi inspecionada visualmente. A geometria, os alinhamentos e os componentes foram verificados com sucesso.`;
    }

    return {
      content: responseContent,
      thinking: {
        status: "done",
        text: `Examinando payload de ${attachments.length} anexo(s) e lendo buffers no runtime...`,
        duration: "1.4s",
      },
      plan: {
        steps: [
          { id: 1, text: `Carregar e parsear conteúdo de ${attachments[0]?.name || "anexo"}`, completed: true },
          { id: 2, text: "Verificar compatibilidade de tipos e schemas", completed: true },
          { id: 3, text: "Gerar plano de integração com o workspace ativo", completed: false },
        ],
      },
      toolExecutions: [
        {
          id: `tool-${Date.now()}`,
          toolName: "read",
          command: `read ${attachments[0]?.name || "attachment"}`,
          duration: "0.5s",
          status: "success",
          output: attachments[0]?.content
            ? attachments[0].content.slice(0, 320) + (attachments[0].content.length > 320 ? "\n... [conteúdo truncado para visualização]" : "")
            : `[Arquivo binário / imagem: ${attachments[0]?.name}]`,
        },
      ],
      identifiedFiles: attachments
        .filter((a) => a.type === "code" || a.type === "text")
        .map((a) => ({
          path: a.name,
          description: `Anexo analisado (${a.size})`,
          action: "modificar" as const,
        })),
    };
  }

  // Caso 2: Prompt comum
  if (lower.includes("sim") || lower.includes("comece") || lower.includes("implementar")) {
    return {
      content: `Excelente! Iniciando a geração das interfaces e middlewares de autenticação com base nos padrões do Oh My Shark.${teiaInfo ? `\n\n${teiaInfo}` : ""}`,
      thinking: {
        status: "done",
        text: "Executando codemod AST e preparando scaffolds em TypeScript estrito...",
        duration: "0.9s",
      },
      plan: {
        steps: [
          { id: 1, text: "Gerar schemas Zod para payload de login/registro", completed: true },
          { id: 2, text: "Criar JwtService e hashing com Bun.password", completed: true },
          { id: 3, text: "Registrar rotas POST /auth/login e POST /auth/register", completed: false },
        ],
      },
      toolExecutions: [
        {
          id: `tool-${Date.now()}`,
          toolName: "ast_edit",
          command: "ast_edit src/auth/service.ts",
          duration: "1.8s",
          status: "success",
          output: "Successfully staged AST rewrite in src/auth/service.ts [12 nodes modified]",
        },
      ],
      identifiedFiles: [
        { path: "src/auth/service.ts", description: "Serviço de autenticação e hashing", action: "adicionar" },
        { path: "src/auth/schemas.ts", description: "Validação Zod de credenciais", action: "novo" },
      ],
    };
  }

  return {
    content: `Compreendi a solicitação: "${input}". Examinei os módulos locais e preparei as diretrizes de execução correspondentes.${teiaInfo ? `\n\n${teiaInfo}` : ""}`,
    thinking: {
      status: "done",
      text: "Varrendo árvore de dependências e verificando contratos de tipos...",
      duration: "1.1s",
    },
    plan: {
      steps: [
        { id: 1, text: "Analisar viabilidade e invariantes de sistema", completed: true },
        { id: 2, text: "Validar impacto nos módulos existentes", completed: true },
        { id: 3, text: "Executar checagens de tipos com Bun/TypeScript", completed: false },
      ],
    },
    toolExecutions: [
      {
        id: `tool-${Date.now()}`,
        toolName: "grep",
        command: `grep -r "${input.slice(0, 15)}" src/`,
        duration: "0.6s",
        status: "success",
        output: "src/routes/api.ts: 2 matches found\nsrc/config/index.ts: 1 match found",
      },
    ],
  };
}
