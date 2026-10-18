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
  apiSaveObsidianCanvas,
  apiSaveGraphReport,
  runGraphifyPipeline,
  type TeiaGraph,
  type TeiaNode,
  type TeiaNodeType,
  type VaultInfo,
  type GraphifyPipelineResult,
  type GraphifyNode,
  type GraphifyEdge,
} from "@/services/teiaEngine";

export type TeiaViewMode = "split" | "graph" | "editor" | "preview";
export type TeiaContextTab = "ctx" | "agent" | "prop" | "graphify";

interface TeiaState {
  vaultInfo: VaultInfo | null;
  graph: TeiaGraph;
  pipelineResult: GraphifyPipelineResult | null;
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

  // Ações do Motor Graphify
  runGraphifyAnalysis: () => Promise<GraphifyPipelineResult | null>;
  exportObsidianCanvas: () => Promise<string>;
  exportGraphReport: () => Promise<string>;
  downloadCanvasJson: () => void;
  downloadGraphReport: () => void;
}

export const useTeiaStore = create<TeiaState>((set, get) => ({
  vaultInfo: null,
  graph: { nodes: [], edges: [], conflicts: [], revision: 0 },
  pipelineResult: null,
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
        apiGetGraph().catch((): TeiaGraph => ({ nodes: [], edges: [], conflicts: [], revision: 0 })),
      ]);

      // Processa pipeline Graphify localmente se necessário
      const pipeline =
        graphData.pipelineResult ||
        runGraphifyPipeline(
          graphData.nodes as GraphifyNode[],
          graphData.edges as GraphifyEdge[],
          info?.vaultPath
        );

      set({
        vaultInfo: info,
        graph: {
          ...graphData,
          pipelineResult: pipeline,
          communities: pipeline.communities,
          godNodes: pipeline.report.godNodes,
          surprisingConnections: pipeline.report.surprisingConnections,
          suggestedQuestions: pipeline.report.suggestedQuestions,
        },
        pipelineResult: pipeline,
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

  // ─────────────────────────────────────────────────────────────────────────
  // AÇÕES GRAPHIFY-GRADE
  // ─────────────────────────────────────────────────────────────────────────

  runGraphifyAnalysis: async () => {
    const { graph, vaultInfo } = get();
    set({ isLoading: true });
    try {
      const pipeline = runGraphifyPipeline(
        graph.nodes as GraphifyNode[],
        graph.edges as GraphifyEdge[],
        vaultInfo?.vaultPath
      );

      set({
        pipelineResult: pipeline,
        graph: {
          ...graph,
          nodes: pipeline.nodes,
          edges: pipeline.edges,
          communities: pipeline.communities,
          godNodes: pipeline.report.godNodes,
          surprisingConnections: pipeline.report.surprisingConnections,
          suggestedQuestions: pipeline.report.suggestedQuestions,
          pipelineResult: pipeline,
        },
        isLoading: false,
      });

      return pipeline;
    } catch {
      set({ isLoading: false });
      return null;
    }
  },

  exportObsidianCanvas: async () => {
    const pipeline = get().pipelineResult || (await get().runGraphifyAnalysis());
    if (!pipeline) throw new Error("Falha ao gerar dados do Canvas");
    const res = await apiSaveObsidianCanvas(pipeline.canvasData);
    return res.filePath;
  },

  exportGraphReport: async () => {
    const pipeline = get().pipelineResult || (await get().runGraphifyAnalysis());
    if (!pipeline) throw new Error("Falha ao gerar relatório");
    const res = await apiSaveGraphReport(pipeline.report.markdownReport);
    return res.filePath;
  },

  downloadCanvasJson: () => {
    const pipeline = get().pipelineResult;
    if (!pipeline) return;
    const blob = new Blob([JSON.stringify(pipeline.canvasData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mente-em-teia.canvas";
    a.click();
    URL.revokeObjectURL(url);
  },

  downloadGraphReport: () => {
    const pipeline = get().pipelineResult;
    if (!pipeline) return;
    const blob = new Blob([pipeline.report.markdownReport], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GRAPH_REPORT.md";
    a.click();
    URL.revokeObjectURL(url);
  },
}));
