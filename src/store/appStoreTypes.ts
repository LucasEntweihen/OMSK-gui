import type {
  AIModel,
  AIProvider,
  NavigationId,
} from "@/types";

export type InspectorTab = "agent" | "tasks" | "tools" | "context" | "providers";

export interface AppNotification {
  id: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

export interface AppState {
  currentRoute: NavigationId;
  availableModels: readonly AIModel[];
  authenticatedProviders: readonly string[];
  realProviders: readonly AIProvider[];
  sidebarCollapsed: boolean;
  inspectorOpen: boolean;
  activeInspectorTab: InspectorTab;
  activeModel: AIModel;
  activeScope: string;
  gitBranch: string;
  tokenUsage: {
    used: number;
    total: number;
    percent: number;
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
  syncSystemStats: () => Promise<void>;
}
