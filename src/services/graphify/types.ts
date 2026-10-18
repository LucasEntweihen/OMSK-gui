/**
 * Mente em Teia — Graphify Architecture Core Types
 * Baseado na especificação arquitetural de Graphify-Labs/graphify
 * Pipeline de 7 fases: detect -> extract -> build -> cluster -> analyze -> report -> export
 */

import type { TeiaNode, TeiaEdge, TeiaNodeType, TeiaTrust } from "../teiaEngine";

export type GraphifyConfidence = "EXTRACTED" | "INFERRED" | "AMBIGUOUS";

/**
 * Entidade normalizada no grafo
 */
export interface GraphifyNode extends TeiaNode {
  communityId?: number;
  communityLabel?: string;
  cohesionScore?: number;
  inDegree?: number;
  outDegree?: number;
  isGodNode?: boolean;
  centralityRank?: number;
}

/**
 * Aresta enriquecida com confiança, direcionalidade e métricas de surpresa
 */
export interface GraphifyEdge extends TeiaEdge {
  confidenceLevel: GraphifyConfidence;
  weight: number;
  isCrossCommunity?: boolean;
  surpriseScore?: number;
  surpriseReasons?: string[];
  _src?: string;
  _tgt?: string;
}

/**
 * Comunidade semântica (Cluster de conhecimento)
 */
export interface GraphifyCommunity {
  id: number;
  label: string;
  hubNodeId: string;
  hubNodeTitle: string;
  cohesionScore: number;
  density: number;
  memberIds: string[];
  color: string;
}

/**
 * God Node — Abstração nuclear de alta centralidade
 */
export interface GraphifyGodNode {
  nodeId: string;
  title: string;
  type: TeiaNodeType;
  degree: number;
  inDegree: number;
  outDegree: number;
  communityId?: number;
  communityLabel?: string;
  percentile: number;
  role: string;
}

/**
 * Surprising Connection — Conexão / ponte entre comunidades distintas
 */
export interface GraphifySurprisingConnection {
  sourceId: string;
  sourceTitle: string;
  sourceType: TeiaNodeType;
  sourceCommunity?: string;
  targetId: string;
  targetTitle: string;
  targetType: TeiaNodeType;
  targetCommunity?: string;
  relation: string;
  score: number;
  reasons: string[];
}

/**
 * Pergunta sugerida gerada a partir da topologia do grafo
 */
export interface GraphifySuggestedQuestion {
  id: string;
  category: "bridge" | "hub" | "isolation" | "cohesion" | "cycle";
  question: string;
  rationale: string;
  targetNodeIds: string[];
}

/**
 * Ciclo / Dependência circular
 */
export interface GraphifyCycle {
  nodes: string[];
  length: number;
  description: string;
}

/**
 * Comparação entre duas revisões do grafo
 */
export interface GraphifyDiff {
  addedNodes: string[];
  removedNodes: string[];
  addedEdges: Array<{ source: string; target: string; relation: string }>;
  removedEdges: Array<{ source: string; target: string; relation: string }>;
  cohesionDelta: number;
  summary: string;
}

/**
 * Relatório Executivo Completo do Grafo
 */
export interface GraphifyReport {
  timestamp: string;
  vaultPath: string;
  totalNodes: number;
  totalEdges: number;
  totalCommunities: number;
  averageCohesion: number;
  godNodes: GraphifyGodNode[];
  communities: GraphifyCommunity[];
  surprisingConnections: GraphifySurprisingConnection[];
  suggestedQuestions: GraphifySuggestedQuestion[];
  cycles: GraphifyCycle[];
  markdownReport: string;
}

/**
 * Formato oficial Obsidian JSON Canvas (.canvas)
 */
export interface ObsidianCanvasNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "file" | "text" | "group";
  file?: string;
  text?: string;
  label?: string;
  color?: string;
}

export interface ObsidianCanvasEdge {
  id: string;
  fromNode: string;
  fromSide: "top" | "right" | "bottom" | "left";
  toNode: string;
  toSide: "top" | "right" | "bottom" | "left";
  label?: string;
  color?: string;
}

export interface ObsidianCanvasData {
  nodes: ObsidianCanvasNode[];
  edges: ObsidianCanvasEdge[];
}
