import { create } from "zustand";
import type { AIModel, NavigationId } from "@/types";

export const AVAILABLE_MODELS: readonly AIModel[] = [
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    contextWindow: "200k",
    maxOutput: "8k",
    pricing: { input: "$3.00 / 1M", output: "$15.00 / 1M" },
    latencyMs: 380,
    isDefault: true,
    tags: ["Raciocínio Rápido", "Visão", "Código"],
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    contextWindow: "128k",
    maxOutput: "4k",
    pricing: { input: "$2.50 / 1M", output: "$10.00 / 1M" },
    latencyMs: 420,
    isDefault: false,
    tags: ["Multimodal", "Velocidade"],
  },
  {
    id: "gemini-1-5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    contextWindow: "2M",
    maxOutput: "8k",
    pricing: { input: "$1.25 / 1M", output: "$5.00 / 1M" },
    latencyMs: 490,
    isDefault: false,
    tags: ["Contexto Extremo", "Multimodal"],
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    contextWindow: "64k",
    maxOutput: "8k",
    pricing: { input: "$0.55 / 1M", output: "$2.19 / 1M" },
    latencyMs: 650,
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
}

export const useAppStore = create<AppState>((set) => ({
  currentRoute: "chat",
  sidebarCollapsed: false,
  inspectorOpen: true,
  activeInspectorTab: "agent",
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
}));
