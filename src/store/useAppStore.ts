import { create } from "zustand";
import type { AIModel, NavigationId } from "@/types";

export const AVAILABLE_MODELS: readonly AIModel[] = [
  {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet (Thinking)",
    provider: "Anthropic",
    contextWindow: "200k",
    maxOutput: "64k",
    pricing: { input: "$3.00 / 1M", output: "$15.00 / 1M" },
    latencyMs: 280,
    isDefault: true,
    tags: ["Raciocínio Híbrido", "Visão", "Engenharia de Código"],
  },
  {
    id: "gpt-6-luna",
    name: "GPT-6 Luna (Codex)",
    provider: "OpenAI Codex",
    contextWindow: "256k",
    maxOutput: "32k",
    pricing: { input: "$2.00 / 1M", output: "$8.00 / 1M" },
    latencyMs: 310,
    isDefault: false,
    tags: ["Astral Codex", "Raciocínio Neural"],
  },
  {
    id: "gemini-3-1-pro",
    name: "Gemini 3.1 Pro (Mandatory Thinking)",
    provider: "Google Antigravity",
    contextWindow: "2M",
    maxOutput: "64k",
    pricing: { input: "$1.25 / 1M", output: "$5.00 / 1M" },
    latencyMs: 390,
    isDefault: false,
    tags: ["Contexto 2M", "Antigravity Cloud"],
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    contextWindow: "128k",
    maxOutput: "16k",
    pricing: { input: "$0.55 / 1M", output: "$2.19 / 1M" },
    latencyMs: 450,
    isDefault: false,
    tags: ["Raciocínio Puro", "Econômico"],
  },
  {
    id: "llama-3-3-70b",
    name: "Llama 3.3 70B",
    provider: "Meta / Groq",
    contextWindow: "128k",
    maxOutput: "8k",
    pricing: { input: "$0.59 / 1M", output: "$0.79 / 1M" },
    latencyMs: 140,
    isDefault: false,
    tags: ["Ultra Baixa Latência", "Open Weights"],
  },
];

export type InspectorTab = "agent" | "tasks" | "tools" | "context" | "providers";

export interface AppNotification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface AppState {
  currentRoute: NavigationId;
  availableModels: readonly AIModel[];
  authenticatedProviders: readonly string[];
  sidebarCollapsed: boolean;
  inspectorOpen: boolean;
  activeInspectorTab: InspectorTab;
  activeModel: AIModel;
  activeScope: string;
  gitBranch: string;
  tokenUsage: {
    used: number; // in tokens, e.g. 1800000
    total: number; // e.g. 4200000
    percent: number; // 42%
  };
  commandPaletteOpen: boolean;
  activeAgentMode: "Autônomo" | "Supervisionado" | "Plano";
  notification: AppNotification | null;

  setCurrentRoute: (route: NavigationId) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleInspector: () => void;
  setInspectorOpen: (open: boolean) => void;
  setActiveInspectorTab: (tab: InspectorTab) => void;
  setActiveModel: (model: AIModel) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setActiveAgentMode: (mode: "Autônomo" | "Supervisionado" | "Plano") => void;
  showNotification: (message: string, type?: AppNotification["type"]) => void;
  dismissNotification: () => void;
  syncBackendModels: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  currentRoute: "chat",
  sidebarCollapsed: false,
  inspectorOpen: true,
  activeInspectorTab: "agent",
  availableModels: AVAILABLE_MODELS,
  authenticatedProviders: ["google-antigravity", "openai-codex", "openrouter"],
  activeModel: AVAILABLE_MODELS[0]!,
  activeScope: "~/projects/oh-my-shark",
  gitBranch: "main",
  tokenUsage: {
    used: 1800000,
    total: 4200000,
    percent: 42,
  },
  commandPaletteOpen: false,
  activeAgentMode: "Autônomo",
  notification: null,

  setCurrentRoute: (route) => set({ currentRoute: route }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleInspector: () => set((state) => ({ inspectorOpen: !state.inspectorOpen })),
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  setActiveInspectorTab: (tab) => set({ activeInspectorTab: tab, inspectorOpen: true }),
  setActiveModel: (model) => set({ activeModel: model }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setActiveAgentMode: (mode) => set({ activeAgentMode: mode }),
  showNotification: (message, type = "info") => {
    const id = Math.random().toString(36).substring(7);
    set({ notification: { id, message, type } });
    setTimeout(() => {
      set((state) => (state.notification?.id === id ? { notification: null } : {}));
    }, 4000);
  },
  dismissNotification: () => set({ notification: null }),
  syncBackendModels: async () => {
    try {
      const res = await fetch("/api/models");
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.ok) {
        const authed = Array.isArray(data.authenticatedProviders) ? data.authenticatedProviders : [];
        if (Array.isArray(data.models) && data.models.length > 0) {
          const mappedModels: AIModel[] = data.models.map((m: any, idx: number) => ({
            id: m.id || m.selector,
            name: m.name || m.id,
            provider: m.provider || "OMSK",
            contextWindow: m.contextWindow ? `${Math.round(m.contextWindow / 1000)}k` : "128k",
            maxOutput: m.maxTokens ? `${Math.round(m.maxTokens / 1000)}k` : "8k",
            pricing: { input: "Conectado / Local", output: "Conectado / Local" },
            latencyMs: 120,
            isDefault: idx === 0,
            tags: [m.provider, m.reasoning ? "Raciocínio" : "Execução"],
          }));
          set({
            availableModels: [...mappedModels, ...AVAILABLE_MODELS],
            authenticatedProviders: authed,
            activeModel: mappedModels[0]!,
          });
        } else if (authed.length > 0) {
          set({ authenticatedProviders: authed });
        }
      }
    } catch {
      // Backend local em modo standalone; mantém modelos padrão
    }
  },
}));
