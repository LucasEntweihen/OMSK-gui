import { create } from "zustand";
import {
  apiGetVaultInfo,
  apiSetVaultPath,
  apiGetGraph,
  apiGetNode,
  apiCreateNode,
  apiUpdateNode,
  apiDeleteNode,
  apiSaveMemory,
  apiGetTeiaContext,
  type TeiaGraph,
  type TeiaNode,
  type TeiaNodeType,
  type VaultInfo,
} from "@/services/teiaEngine";

export type TeiaViewMode = "split" | "graph" | "editor" | "preview";
export type TeiaContextTab = "ctx" | "agent" | "time" | "prop";

interface TeiaState {
  vaultInfo: VaultInfo | null;
  graph: TeiaGraph;
  activeNode: TeiaNode | null;
  selectedNodeId: string | null;
  viewMode: TeiaViewMode;
  activeContextTab: TeiaContextTab;
  searchQuery: string;
  draftContent: string;
  isDirty: boolean;
  isLoading: boolean;
  agentContextResult: { nodesCount: number; text: string } | null;

  loadVault: () => Promise<void>;
  setVaultLocation: (path: string) => Promise<void>;
  selectNode: (id: string | null) => Promise<void>;
  openNode: (id: string, editMode?: boolean) => Promise<void>;
  saveCurrentNode: () => Promise<void>;
  createNote: (title: string, type: TeiaNodeType, body?: string) => Promise<string>;
  deleteCurrentNode: () => Promise<void>;
  setViewMode: (mode: TeiaViewMode) => void;
  setActiveContextTab: (tab: TeiaContextTab) => void;
  setSearchQuery: (query: string) => void;
  setDraftContent: (content: string) => void;
  requestAgentContext: (query?: string) => Promise<void>;
  recordAIMemory: (title: string, content: string, type?: "memory" | "preference" | "decision") => Promise<string>;
}

export const useTeiaStore = create<TeiaState>((set, get) => ({
  vaultInfo: null,
  graph: { nodes: [], edges: [], conflicts: [], revision: 0 },
  activeNode: null,
  selectedNodeId: null,
  viewMode: "split",
  activeContextTab: "ctx",
  searchQuery: "",
  draftContent: "",
  isDirty: false,
  isLoading: false,
  agentContextResult: null,

  loadVault: async () => {
    set({ isLoading: true });
    try {
      const [info, graphData] = await Promise.all([
        apiGetVaultInfo().catch(() => null),
        apiGetGraph().catch(() => ({ nodes: [], edges: [], conflicts: [], revision: 0 })),
      ]);

      set({
        vaultInfo: info,
        graph: graphData,
        isLoading: false,
      });

      // Se há um nó ativo, recarrega ele
      const curId = get().activeNode?.id;
      if (curId) {
        const refreshed = graphData.nodes.find((n) => n.id === curId);
        if (refreshed && !refreshed.ghost) {
          const fullNode = await apiGetNode(curId).catch(() => null);
          if (fullNode) {
            set({ activeNode: fullNode, draftContent: fullNode.raw, isDirty: false });
          }
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },

  setVaultLocation: async (newPath: string) => {
    set({ isLoading: true });
    try {
      await apiSetVaultPath(newPath);
      await get().loadVault();
    } finally {
      set({ isLoading: false });
    }
  },

  selectNode: async (id: string | null) => {
    set({ selectedNodeId: id });
    if (!id) return;
    try {
      const full = await apiGetNode(id);
      set({ activeNode: full, selectedNodeId: id });
    } catch {
      // Nó fantasma ou indisponível
    }
  },

  openNode: async (id: string, editMode = false) => {
    if (get().isDirty && !window.confirm("Descartar alterações não salvas na nota atual?")) {
      return;
    }
    set({ isLoading: true });
    try {
      const full = await apiGetNode(id);
      set({
        activeNode: full,
        selectedNodeId: full.id,
        draftContent: full.raw,
        isDirty: false,
        viewMode: editMode ? "editor" : get().viewMode === "graph" ? "split" : get().viewMode,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  saveCurrentNode: async () => {
    const node = get().activeNode;
    if (!node || !get().isDirty) return;
    const raw = get().draftContent;
    set({ isLoading: true });
    try {
      await apiUpdateNode(node.id, raw);
      set({ isDirty: false, isLoading: false });
      await get().loadVault();
    } catch {
      set({ isLoading: false });
    }
  },

  createNote: async (title: string, type: TeiaNodeType, body = "") => {
    set({ isLoading: true });
    try {
      const res = await apiCreateNode({ title, type, body, source: "user" });
      await get().loadVault();
      await get().openNode(res.id, true);
      set({ isLoading: false });
      return res.id;
    } catch (err: unknown) {
      set({ isLoading: false });
      throw err;
    }
  },

  deleteCurrentNode: async () => {
    const node = get().activeNode;
    if (!node) return;
    if (!window.confirm(`Excluir permanentemente a nota "${node.title}"?`)) return;
    set({ isLoading: true });
    try {
      await apiDeleteNode(node.id);
      set({ activeNode: null, selectedNodeId: null, draftContent: "", isDirty: false, isLoading: false });
      await get().loadVault();
    } catch {
      set({ isLoading: false });
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveContextTab: (tab) => set({ activeContextTab: tab }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setDraftContent: (content) => set({ draftContent: content, isDirty: true }),

  requestAgentContext: async (query = "") => {
    try {
      const ctx = await apiGetTeiaContext(query);
      set({ agentContextResult: ctx });
    } catch {
      // falha
    }
  },

  recordAIMemory: async (title, content, type = "memory") => {
    const msg = await apiSaveMemory({ title, content, type });
    await get().loadVault();
    return msg;
  },
}));
