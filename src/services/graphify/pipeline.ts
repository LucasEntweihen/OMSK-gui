/**
 * Mente em Teia — Master Graphify Pipeline
 * Orquestrador dos 7 estágios do Graphify:
 * 1. detect -> 2. extract -> 3. build -> 4. cluster -> 5. analyze -> 6. report -> 7. export
 */

import type {
  GraphifyNode,
  GraphifyEdge,
  GraphifyCommunity,
  GraphifyReport,
  ObsidianCanvasData,
} from "./types";
import { detectCommunities } from "./cluster";
import {
  detectGodNodes,
  detectSurprisingConnections,
  detectCycles,
  generateSuggestedQuestions,
} from "./analyze";
import {
  exportToObsidianCanvas,
  generateGraphReportMarkdown,
  exportToGraphJson,
} from "./export";

export interface GraphifyPipelineResult {
  nodes: GraphifyNode[];
  edges: GraphifyEdge[];
  communities: GraphifyCommunity[];
  report: GraphifyReport;
  canvasData: ObsidianCanvasData;
  graphJson: string;
}

/**
 * Executa o Pipeline Completo do Graphify sobre o Grafo da Mente em Teia
 */
export function runGraphifyPipeline(
  rawNodes: GraphifyNode[],
  rawEdges: GraphifyEdge[],
  vaultPath = "C:/Users/guerr/Desktop/Mente em Teia"
): GraphifyPipelineResult {
  // 1. DETECT & VALIDATE: Normalização e validação estrutural
  const nodes: GraphifyNode[] = rawNodes.map((n) => ({
    ...n,
    tags: Array.isArray(n.tags) ? n.tags : [],
  }));

  const nodeMap = new Map<string, GraphifyNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // 2. EXTRACT & REORDER: Atribuição de níveis de confiança e pesos
  const edges: GraphifyEdge[] = rawEdges
    .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
    .map((e) => {
      const isExplicitRelation = Boolean(e.relation && e.relation.trim().length > 0);
      return {
        ...e,
        confidenceLevel: e.ai ? "INFERRED" : isExplicitRelation ? "EXTRACTED" : "EXTRACTED",
        weight: e.ai ? 0.75 : 1.0,
        _src: e.source,
        _tgt: e.target,
      };
    });

  // 3. BUILD: Cálculo de graus (Degree, In-Degree, Out-Degree)
  const inDegreeMap = new Map<string, number>();
  const outDegreeMap = new Map<string, number>();

  for (const e of edges) {
    outDegreeMap.set(e.source, (outDegreeMap.get(e.source) || 0) + 1);
    inDegreeMap.set(e.target, (inDegreeMap.get(e.target) || 0) + 1);
  }

  for (const n of nodes) {
    n.inDegree = inDegreeMap.get(n.id) || 0;
    n.outDegree = outDegreeMap.get(n.id) || 0;
    n.degree = n.inDegree + n.outDegree;
    n.hub = n.degree >= 3;
  }

  // 4. CLUSTER: Detecção de Comunidades Semânticas e Cálculo de Coesão
  const communities = detectCommunities(nodes, edges);

  // Associa cada nó à sua respectiva comunidade
  const commMap = new Map<string, GraphifyCommunity>();
  for (const c of communities) {
    for (const mId of c.memberIds) {
      commMap.set(mId, c);
    }
  }

  for (const n of nodes) {
    const comm = commMap.get(n.id);
    if (comm) {
      n.communityId = comm.id;
      n.communityLabel = comm.label;
      n.cohesionScore = comm.cohesionScore;
    }
  }

  // 5. ANALYZE: God Nodes, Surprising Connections, Ciclos e Perguntas Sugeridas
  const godNodes = detectGodNodes(nodes, edges, 6);
  const godNodeIds = new Set(godNodes.map((g) => g.nodeId));
  for (const n of nodes) {
    n.isGodNode = godNodeIds.has(n.id);
  }

  const surprisingConnections = detectSurprisingConnections(nodes, edges, communities, 8);
  const cycles = detectCycles(nodes, edges);
  const suggestedQuestions = generateSuggestedQuestions(
    nodes,
    edges,
    communities,
    godNodes,
    surprisingConnections,
    cycles
  );

  // Calcula coesão média
  const totalCohesion = communities.reduce((acc, c) => acc + c.cohesionScore, 0);
  const averageCohesion = communities.length > 0 ? totalCohesion / communities.length : 0;

  // 6. REPORT: Geração do relatório executivo
  const reportPayload: GraphifyReport = {
    timestamp: new Date().toLocaleString("pt-BR"),
    vaultPath,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    totalCommunities: communities.length,
    averageCohesion: Number(averageCohesion.toFixed(3)),
    godNodes,
    communities,
    surprisingConnections,
    suggestedQuestions,
    cycles,
    markdownReport: "",
  };

  reportPayload.markdownReport = generateGraphReportMarkdown(reportPayload);

  // 7. EXPORT: Geração de formatos Obsidian Canvas e Graph JSON
  const canvasData = exportToObsidianCanvas(nodes, edges, communities);
  const graphJson = exportToGraphJson(nodes, edges, communities);

  return {
    nodes,
    edges,
    communities,
    report: reportPayload,
    canvasData,
    graphJson,
  };
}
