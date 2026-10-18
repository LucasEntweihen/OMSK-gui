/**
 * Mente em Teia — Graphify Topological Analyzer
 * Implementação inspirada em graphify/analyze.py
 * Identificação de God Nodes, Conexões Surpreendentes (Pontes), Ciclos e Perguntas Sugeridas.
 */

import type {
  GraphifyNode,
  GraphifyEdge,
  GraphifyCommunity,
  GraphifyGodNode,
  GraphifySurprisingConnection,
  GraphifySuggestedQuestion,
  GraphifyCycle,
  GraphifyDiff,
} from "./types";

/**
 * Detecta God Nodes — As abstrações e nós nucleares com maior centralidade e grau.
 */
export function detectGodNodes(
  nodes: GraphifyNode[],
  edges: GraphifyEdge[],
  topN = 6
): GraphifyGodNode[] {
  if (nodes.length === 0) return [];

  const inDegreeMap = new Map<string, number>();
  const outDegreeMap = new Map<string, number>();

  for (const e of edges) {
    outDegreeMap.set(e.source, (outDegreeMap.get(e.source) || 0) + 1);
    inDegreeMap.set(e.target, (inDegreeMap.get(e.target) || 0) + 1);
  }

  // Filtra nós fantasmas para priorizar nós reais como god nodes
  const realNodes = nodes.filter((n) => !n.ghost);
  const pool = realNodes.length > 0 ? realNodes : nodes;

  const ranked = pool
    .map((n) => {
      const inDeg = inDegreeMap.get(n.id) || 0;
      const outDeg = outDegreeMap.get(n.id) || 0;
      const totalDeg = inDeg + outDeg;

      // Papel conceitual atribuído com base nas proporções e tipo
      let role = "Pilar Conceitual";
      if (inDeg > outDeg * 2) {
        role = "Atraidor de Dependências (Alta Citação)";
      } else if (outDeg > inDeg * 2) {
        role = "Orquestrador / Conector Central";
      } else if (n.type === "decision") {
        role = "Decisão Arquitetural Mestra";
      } else if (n.type === "memory") {
        role = "Memória de Longo Prazo da IA";
      } else if (n.type === "technology") {
        role = "Fundação Tecnológica";
      }

      return {
        nodeId: n.id,
        title: n.title,
        type: n.type,
        degree: totalDeg,
        inDegree: inDeg,
        outDegree: outDeg,
        communityId: n.communityId,
        communityLabel: n.communityLabel,
        percentile: 0,
        role,
      };
    })
    .sort((a, b) => b.degree - a.degree);

  // Calcula percentil
  const total = ranked.length;
  const result = ranked.slice(0, topN).map((item, idx) => ({
    ...item,
    percentile: total > 1 ? Number(((1 - idx / (total - 1)) * 100).toFixed(1)) : 100,
  }));

  return result;
}

/**
 * Detecta Conexões Surpreendentes (Surprising Connections) — Pontes que cruzam comunidades distintas
 * ou conectam ontologias heterogêneas de alto impacto.
 */
export function detectSurprisingConnections(
  nodes: GraphifyNode[],
  edges: GraphifyEdge[],
  communities: GraphifyCommunity[],
  topN = 8
): GraphifySurprisingConnection[] {
  if (edges.length === 0 || communities.length === 0) return [];

  const nodeMap = new Map<string, GraphifyNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // Mapeia cada nó à sua comunidade
  const nodeCommMap = new Map<string, GraphifyCommunity>();
  for (const c of communities) {
    for (const mId of c.memberIds) {
      nodeCommMap.set(mId, c);
    }
  }

  const surprises: GraphifySurprisingConnection[] = [];

  for (const e of edges) {
    const sNode = nodeMap.get(e.source);
    const tNode = nodeMap.get(e.target);
    if (!sNode || !tNode) continue;

    const sComm = nodeCommMap.get(e.source);
    const tComm = nodeCommMap.get(e.target);

    let score = 0;
    const reasons: string[] = [];

    // 1. Conexão Inter-comunitária (Cross-Community Bridge)
    if (sComm && tComm && sComm.id !== tComm.id) {
      score += 40;
      reasons.push(`Ponte entre ${sComm.label} e ${tComm.label}`);
      e.isCrossCommunity = true;
    }

    // 2. Conexão Cross-Ontology (Ex: preferência com arquitetura, ou problema com tecnologia)
    if (sNode.type !== tNode.type) {
      score += 25;
      reasons.push(`Fusão ontológica (${sNode.type} ↔ ${tNode.type})`);
    }

    // 3. Relação semântica de alta criticidade
    const relLower = (e.relation || "").toLowerCase();
    if (
      relLower.includes("bloqueia") ||
      relLower.includes("impede") ||
      relLower.includes("refatora") ||
      relLower.includes("conflita")
    ) {
      score += 35;
      reasons.push(`Relação de impacto crítico ('${e.relation}')`);
    } else if (relLower.includes("depende") || relLower.includes("armazena") || relLower.includes("implementa")) {
      score += 15;
    }

    // 4. Conexão inferida pela IA ou com glifo de memória
    if (e.ai) {
      score += 15;
      reasons.push("Associação inferida pelo motor de IA");
    }

    if (score >= 40) {
      e.surpriseScore = score;
      e.surpriseReasons = reasons;

      surprises.push({
        sourceId: sNode.id,
        sourceTitle: sNode.title,
        sourceType: sNode.type,
        sourceCommunity: sComm?.label,
        targetId: tNode.id,
        targetTitle: tNode.title,
        targetType: tNode.type,
        targetCommunity: tComm?.label,
        relation: e.relation || "relacionado",
        score,
        reasons,
      });
    }
  }

  return surprises.sort((a, b) => b.score - a.score).slice(0, topN);
}

/**
 * Detecta Ciclos e Dependências Circulares entre notas no grafo direcionado.
 */
export function detectCycles(nodes: GraphifyNode[], edges: GraphifyEdge[]): GraphifyCycle[] {
  const adj = new Map<string, string[]>();
  for (const n of nodes) {
    adj.set(n.id, []);
  }

  for (const e of edges) {
    if (adj.has(e.source)) {
      adj.get(e.source)!.push(e.target);
    }
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();
  const path: string[] = [];
  const cycles: GraphifyCycle[] = [];

  function dfs(curr: string) {
    visited.add(curr);
    inStack.add(curr);
    path.push(curr);

    const neighbors = adj.get(curr) || [];
    for (const next of neighbors) {
      if (!visited.has(next)) {
        dfs(next);
      } else if (inStack.has(next)) {
        // Encontrou ciclo!
        const cycleStartIndex = path.indexOf(next);
        if (cycleStartIndex !== -1) {
          const cycleNodes = path.slice(cycleStartIndex);
          cycles.push({
            nodes: cycleNodes,
            length: cycleNodes.length,
            description: `Ciclo: ${cycleNodes.join(" → ")} → ${next}`,
          });
        }
      }
    }

    path.pop();
    inStack.delete(curr);
  }

  for (const n of nodes) {
    if (!visited.has(n.id)) {
      dfs(n.id);
    }
  }

  return cycles.slice(0, 5);
}

/**
 * Gera Perguntas Sugeridas Inteligentes a partir da Topologia do Grafo
 * Inspirado no analyze.suggest_questions() do Graphify.
 */
export function generateSuggestedQuestions(
  nodes: GraphifyNode[],
  edges: GraphifyEdge[],
  communities: GraphifyCommunity[],
  godNodes: GraphifyGodNode[],
  surprises: GraphifySurprisingConnection[],
  cycles: GraphifyCycle[]
): GraphifySuggestedQuestion[] {
  const questions: GraphifySuggestedQuestion[] = [];

  // 1. Perguntas baseadas em Pontes Surpreendentes (Bridges)
  for (const s of surprises.slice(0, 3)) {
    questions.push({
      id: `q-bridge-${s.sourceId}-${s.targetId}`,
      category: "bridge",
      question: `Como a relação entre '${s.sourceTitle}' e '${s.targetTitle}' une os clusters '${s.sourceCommunity || "Geral"}' e '${s.targetCommunity || "Geral"}'?`,
      rationale: `Esta aresta possui score de surpresa ${s.score} por conectar domínios distintos: ${s.reasons.join(", ")}.`,
      targetNodeIds: [s.sourceId, s.targetId],
    });
  }

  // 2. Perguntas baseadas em God Nodes (Alta Centralidade)
  for (const g of godNodes.slice(0, 2)) {
    questions.push({
      id: `q-hub-${g.nodeId}`,
      category: "hub",
      question: `A nota '${g.title}' concentra ${g.degree} conexões como ${g.role}. Ela deve ser refatorada em submódulos para evitar sobrecarga conceitual?`,
      rationale: `Nós com alta centralidade podem se tornar gargalos de conhecimento se acumularem responsabilidades excessivas.`,
      targetNodeIds: [g.nodeId],
    });
  }

  // 3. Perguntas baseadas em Ciclos e Feedback Loops
  for (const c of cycles.slice(0, 1)) {
    questions.push({
      id: `q-cycle-${c.nodes[0]}`,
      category: "cycle",
      question: `Detectada uma referência circular entre ${c.nodes.join(" e ")}. É possível linearizar essa dependência hierárquica?`,
      rationale: `Dependências circulares em grafos de conhecimento podem gerar raciocínios redundantes na IA.`,
      targetNodeIds: c.nodes,
    });
  }

  // 4. Perguntas baseadas em Coesão Baixa de Comunidades
  const lowCohesion = communities.filter((c) => c.memberIds.length >= 4 && c.cohesionScore < 0.25);
  for (const c of lowCohesion.slice(0, 2)) {
    questions.push({
      id: `q-cohesion-${c.id}`,
      category: "cohesion",
      question: `O ${c.label} possui baixa coesão interna (${Math.round(c.cohesionScore * 100)}%). Os conceitos deste cluster pertencem realmente ao mesmo contexto?`,
      rationale: `Baixa densidade de conexões indica que o cluster pode ser um agrupamento acidental de tópicos dispersos.`,
      targetNodeIds: c.memberIds.slice(0, 3),
    });
  }

  // 5. Perguntas sobre Nós com Pouca Conexão (Isolamento)
  const lowConnected = nodes.filter((n) => !n.ghost && (n.degree === 0 || n.degree === 1));
  if (lowConnected.length > 0) {
    const sample = lowConnected.slice(0, 2);
    questions.push({
      id: `q-isolation-batch`,
      category: "isolation",
      question: `As notas '${sample.map((s) => s.title).join("', '")}' possuem poucas conexões. Quais relações podem integrá-las à rede principal?`,
      rationale: `Nós isolados não são aproveitados eficientemente pela IA durante injeções de memória contextual.`,
      targetNodeIds: sample.map((s) => s.id),
    });
  }

  return questions.slice(0, 7);
}

/**
 * Compara dois snapshots do grafo e calcula as mutações estruturais.
 */
export function computeGraphDiff(
  oldNodes: GraphifyNode[],
  oldEdges: GraphifyEdge[],
  newNodes: GraphifyNode[],
  newEdges: GraphifyEdge[]
): GraphifyDiff {
  const oldNodeIds = new Set(oldNodes.map((n) => n.id));
  const newNodeIds = new Set(newNodes.map((n) => n.id));

  const addedNodes = newNodes.filter((n) => !oldNodeIds.has(n.id)).map((n) => n.title);
  const removedNodes = oldNodes.filter((n) => !newNodeIds.has(n.id)).map((n) => n.title);

  const oldEdgeSet = new Set(oldEdges.map((e) => `${e.source}->${e.target}:${e.relation}`));
  const newEdgeSet = new Set(newEdges.map((e) => `${e.source}->${e.target}:${e.relation}`));

  const addedEdges = newEdges
    .filter((e) => !oldEdgeSet.has(`${e.source}->${e.target}:${e.relation}`))
    .map((e) => ({ source: e.source, target: e.target, relation: e.relation }));

  const removedEdges = oldEdges
    .filter((e) => !newEdgeSet.has(`${e.source}->${e.target}:${e.relation}`))
    .map((e) => ({ source: e.source, target: e.target, relation: e.relation }));

  const summary = `Diff: +${addedNodes.length}/-${removedNodes.length} nós, +${addedEdges.length}/-${removedEdges.length} arestas`;

  return {
    addedNodes,
    removedNodes,
    addedEdges,
    removedEdges,
    cohesionDelta: 0,
    summary,
  };
}
