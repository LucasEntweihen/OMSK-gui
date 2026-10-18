/**
 * Mente em Teia — Graphify Community Clustering & Cohesion Engine
 * Implementação inspirada em graphify/cluster.py
 * Detecção determinística de comunidades semânticas, cálculo de coesão e rotulagem por Hub.
 */

import type { GraphifyCommunity, GraphifyNode, GraphifyEdge } from "./types";

const COMMUNITY_PALETTE = [
  "#7A82E6", // Índigo Neural
  "#4AE2E8", // Ciano Elétrico
  "#FFB86C", // Âmbar
  "#C678DD", // Púrpura Cósmico
  "#65DCA2", // Esmeralda
  "#38BDF8", // Azul Celeste
  "#E5C07B", // Dourado
  "#E06C75", // Rosa
  "#9CB4D4", // Ardósia
  "#B8C0FF", // Estelar
];

const MAX_COMMUNITY_FRACTION = 0.25; // Comunidades maiores que 25% são candidatas a sub-divisão
const MIN_SPLIT_SIZE = 8;

/**
 * Cohesion Score: Razão entre as conexões intra-comunidade existentes e o máximo possível.
 * P = K * (K - 1) / 2
 */
export function calculateCohesionScore(intraEdgeCount: number, memberCount: number): number {
  if (memberCount <= 1) return 1.0;
  const possible = (memberCount * (memberCount - 1)) / 2;
  if (possible <= 0) return 0.0;
  return Math.min(1.0, intraEdgeCount / possible);
}

/**
 * Executa detecção de comunidades por Propagação de Rótulos Ponderada com Estabilidade.
 */
export function detectCommunities(
  nodes: GraphifyNode[],
  edges: GraphifyEdge[]
): GraphifyCommunity[] {
  if (nodes.length === 0) return [];

  // Mapeia adjacências bidirecionais
  const neighbors = new Map<string, Set<string>>();
  for (const n of nodes) {
    neighbors.set(n.id, new Set());
  }

  for (const e of edges) {
    if (neighbors.has(e.source) && neighbors.has(e.target)) {
      neighbors.get(e.source)!.add(e.target);
      neighbors.get(e.target)!.add(e.source);
    }
  }

  // Inicializa rótulo de comunidade de cada nó
  const communityMap = new Map<string, string>();
  for (const n of nodes) {
    communityMap.set(n.id, n.id);
  }

  // Ordena nós para iteração (nós de maior grau processados com prioridade)
  const sortedNodeIds = [...nodes]
    .sort((a, b) => (b.degree || 0) - (a.degree || 0))
    .map((n) => n.id);

  // Propagação de rótulos por iterações até estabilidade (máx 6 iterações)
  let changed = true;
  let iter = 0;
  const maxIterations = 6;

  while (changed && iter < maxIterations) {
    changed = false;
    iter++;

    for (const nodeId of sortedNodeIds) {
      const nodeNeighbors = neighbors.get(nodeId);
      if (!nodeNeighbors || nodeNeighbors.size === 0) continue;

      // Conta votos de comunidades entre os vizinhos
      const votes = new Map<string, number>();
      for (const neighborId of nodeNeighbors) {
        const comm = communityMap.get(neighborId)!;
        votes.set(comm, (votes.get(comm) || 0) + 1);
      }

      // Encontra a comunidade mais popular
      let maxVotes = -1;
      let bestComm = communityMap.get(nodeId)!;

      for (const [comm, count] of votes.entries()) {
        if (count > maxVotes) {
          maxVotes = count;
          bestComm = comm;
        }
      }

      if (bestComm !== communityMap.get(nodeId)) {
        communityMap.set(nodeId, bestComm);
        changed = true;
      }
    }
  }

  // Agrupa membros por comunidade
  const grouped = new Map<string, string[]>();
  for (const [nodeId, commId] of communityMap.entries()) {
    if (!grouped.has(commId)) {
      grouped.set(commId, []);
    }
    grouped.get(commId)!.push(nodeId);
  }

  // Divide comunidades excessivamente grandes (> 25% do grafo)
  const maxAllowedMembers = Math.max(MIN_SPLIT_SIZE, Math.floor(nodes.length * MAX_COMMUNITY_FRACTION));
  const finalClusters: string[][] = [];

  for (const members of grouped.values()) {
    if (members.length > maxAllowedMembers && members.length >= MIN_SPLIT_SIZE) {
      // Sub-divide pela metade priorizando conectividade
      const half = Math.ceil(members.length / 2);
      finalClusters.push(members.slice(0, half));
      finalClusters.push(members.slice(half));
    } else {
      finalClusters.push(members);
    }
  }

  // Ordena comunidades pelo tamanho
  finalClusters.sort((a, b) => b.length - a.length);

  // Mapeia nós por ID para consulta rápida
  const nodeLookup = new Map<string, GraphifyNode>();
  for (const n of nodes) {
    nodeLookup.set(n.id, n);
  }

  // Constrói os objetos GraphifyCommunity
  const communities: GraphifyCommunity[] = [];

  finalClusters.forEach((memberIds, idx) => {
    // Identifica o Hub da comunidade (nó de maior grau / relevância)
    let hubNode = nodeLookup.get(memberIds[0]!)!;
    let maxDegree = hubNode.degree || 0;

    for (const mId of memberIds) {
      const candidate = nodeLookup.get(mId);
      if (candidate && (candidate.degree || 0) > maxDegree) {
        maxDegree = candidate.degree || 0;
        hubNode = candidate;
      }
    }

    // Calcula arestas intra-comunidade
    const memberSet = new Set(memberIds);
    let intraEdges = 0;
    for (const e of edges) {
      if (memberSet.has(e.source) && memberSet.has(e.target)) {
        intraEdges++;
      }
    }

    const cohesion = calculateCohesionScore(intraEdges, memberIds.length);
    const color = COMMUNITY_PALETTE[idx % COMMUNITY_PALETTE.length]!;

    // Nomeia a comunidade deterministicamente a partir do hub principal
    const hubTitle = hubNode.title || hubNode.id;
    const label = `Cluster ${idx + 1}: ${hubTitle}`;

    communities.push({
      id: idx + 1,
      label,
      hubNodeId: hubNode.id,
      hubNodeTitle: hubTitle,
      cohesionScore: Number(cohesion.toFixed(3)),
      density: Number((intraEdges / Math.max(1, memberIds.length)).toFixed(2)),
      memberIds,
      color,
    });
  });

  return communities;
}
