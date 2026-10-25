import { create } from "zustand";
import type { AIModel, AIProvider } from "@/types";
import type { AppNotification, AppState, InspectorTab } from "./appStoreTypes";

export type { InspectorTab, AppNotification };

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


function getInitialActiveModel(): AIModel {
  try {
    const savedId = localStorage.getItem("oms_last_active_model_id");
    if (savedId) {
      const found = AVAILABLE_MODELS.find((m) => m.id === savedId);
      if (found) return found;
    }
  } catch {}
  return AVAILABLE_MODELS[0]!;
}

export const useAppStore = create<AppState>((set) => ({
  currentRoute: "chat",
  sidebarCollapsed: false,
  inspectorOpen: true,
  activeInspectorTab: "agent",
  availableModels: AVAILABLE_MODELS,
  authenticatedProviders: [],
  realProviders: [],
  activeModel: getInitialActiveModel(),
  activeScope: "~/projects/oh-my-shark",
  gitBranch: "main",
  tokenUsage: {
    used: 0,
    total: 2000000,
    percent: 0,
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
  setActiveModel: (model) => {
    try {
      localStorage.setItem("oms_last_active_model_id", model.id);
    } catch {}
    set({ activeModel: model });
  },
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
            activeModel: (() => {
              const savedId = (() => { try { return localStorage.getItem("oms_last_active_model_id"); } catch { return null; } })();
              if (savedId) {
                const match = mappedModels.find(m => m.id === savedId) || AVAILABLE_MODELS.find(m => m.id === savedId);
                if (match) return match;
              }
              return mappedModels[0]!;
            })(),
          });
        } else {
          set({ authenticatedProviders: authed });
        }
      }

      // Consulta provedores reais
      const provRes = await fetch("/api/providers");
      if (provRes.ok) {
        const provData = await provRes.json();
        if (provData && provData.ok && Array.isArray(provData.providers)) {
          const mappedProviders: AIProvider[] = provData.providers.map((p: any) => ({
            id: p.id,
            name: p.name,
            status: p.status,
            endpoint: p.isOAuth ? "OAuth 2.0 / Token Seguro" : "API Key / Endpoint Local",
            latency: p.status === "connected" ? "120ms" : "---",
            activeModelId: p.models?.[0]?.id || "",
            models: Array.isArray(p.models)
              ? p.models.map((m: any) => ({
                  id: m.id,
                  name: m.name,
                  provider: p.name,
                  contextWindow: "128k",
                  maxOutput: "8k",
                  pricing: { input: "Ativo", output: "Ativo" },
                  latencyMs: 120,
                  tags: [p.name],
                }))
              : [],
          }));
          set({ realProviders: mappedProviders });
        }
      }
    } catch {
      // Backend local em modo standalone; mantém modelos padrão
    }
  },

  syncSystemStats: async () => {
    try {
      const res = await fetch("/api/system/stats");
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.ok && data.stats) {
        const s = data.stats;
        const total = s.heapTotal || 2000000;
        const used = s.heapUsed || 0;
        const percent = Math.min(100, Math.round((used / total) * 100));
        set({
          activeScope: s.cwd || "~/projects/oh-my-shark",
          tokenUsage: {
            used,
            total,
            percent,
          },
        });
      }
    } catch {
      // Ignore
    }
  },
}));
