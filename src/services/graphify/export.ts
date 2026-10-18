/**
 * Mente em Teia — Graphify Export Engine
 * Implementação inspirada em graphify/export.py
 * Exportação para Obsidian JSON Canvas (.canvas), GRAPH_REPORT.md e Graph JSON universal.
 */

import type {
  GraphifyNode,
  GraphifyEdge,
  GraphifyCommunity,
  GraphifyReport,
  ObsidianCanvasData,
  ObsidianCanvasNode,
  ObsidianCanvasEdge,
} from "./types";

/**
 * Converte o grafo para o formato oficial Obsidian JSON Canvas (.canvas)
 * Permite visualização e arrasto bidimensional nativo no app Obsidian Desktop.
 */
export function exportToObsidianCanvas(
  nodes: GraphifyNode[],
  edges: GraphifyEdge[],
  communities: GraphifyCommunity[]
): ObsidianCanvasData {
  const canvasNodes: ObsidianCanvasNode[] = [];
  const canvasEdges: ObsidianCanvasEdge[] = [];

  // Mapeia comunidade por nó
  const nodeCommunityMap = new Map<string, GraphifyCommunity>();
  for (const c of communities) {
    for (const mId of c.memberIds) {
      nodeCommunityMap.set(mId, c);
    }
  }

  // Agrupa nós por comunidade para layout espacial em grid
  const communityGroups = new Map<number, GraphifyNode[]>();
  for (const n of nodes) {
    const comm = nodeCommunityMap.get(n.id);
    const commId = comm ? comm.id : 0;
    if (!communityGroups.has(commId)) {
      communityGroups.set(commId, []);
    }
    communityGroups.get(commId)!.push(n);
  }

  // Coordenadas espaciais dos clusters
  const clusterSpacingX = 800;
  const clusterSpacingY = 700;
  const cols = Math.max(1, Math.ceil(Math.sqrt(communityGroups.size || 1)));

  let clusterIdx = 0;
  for (const [commId, commNodes] of communityGroups.entries()) {
    const clusterCol = clusterIdx % cols;
    const clusterRow = Math.floor(clusterIdx / cols);
    const baseX = clusterCol * clusterSpacingX;
    const baseY = clusterRow * clusterSpacingY;

    const commObj = communities.find((c) => c.id === commId);
    const commColor = commObj ? commObj.color : "#7A82E6";

    commNodes.forEach((node, nodeIdx) => {
      const nodeCol = nodeIdx % 2;
      const nodeRow = Math.floor(nodeIdx / 2);
      const x = baseX + nodeCol * 320;
      const y = baseY + nodeRow * 180;

      const cardText = `## ${node.title}\n**Tipo:** \`${node.type}\` | **Grau:** ${node.degree || 0}\n\n${
        node.body ? node.body.slice(0, 140) + "..." : "Nota do vault."
      }`;

      canvasNodes.push({
        id: node.id,
        x,
        y,
        width: 280,
        height: 140,
        type: "text",
        text: cardText,
        color: commColor,
      });
    });

    clusterIdx++;
  }

  // Arestas direcionadas no Canvas
  edges.forEach((edge, idx) => {
    canvasEdges.push({
      id: `edge-${idx}-${edge.source}-${edge.target}`,
      fromNode: edge.source,
      fromSide: "right",
      toNode: edge.target,
      toSide: "left",
      label: edge.relation || undefined,
      color: edge.isCrossCommunity ? "#FFB86C" : undefined,
    });
  });

  return {
    nodes: canvasNodes,
    edges: canvasEdges,
  };
}

/**
 * Gera o relatório executivo oficial GRAPH_REPORT.md inspirado no Graphify report.py
 */
export function generateGraphReportMarkdown(report: GraphifyReport): string {
  const lines: string[] = [];

  lines.push(`# GRAPH REPORT — MENTE EM TEIA`);
  lines.push(`**Gerado em:** ${report.timestamp} | **Caminho do Vault:** \`${report.vaultPath}\``);
  lines.push(``);
  lines.push(`## 1. Resumo Executivo da Topologia`);
  lines.push(`- **Total de Nós / Conceitos:** ${report.totalNodes}`);
  lines.push(`- **Total de Relações / Arestas:** ${report.totalEdges}`);
  lines.push(`- **Comunidades Semânticas Detectadas:** ${report.totalCommunities}`);
  lines.push(`- **Coesão Média dos Clusters:** ${(report.averageCohesion * 100).toFixed(1)}%`);
  lines.push(``);

  lines.push(`## 2. God Nodes — Abstrações Nucleares e Hubs Centrais`);
  lines.push(`| Nó / Título | Tipo | Grau Total | Entradas (←) | Saídas (→) | Papel Topológico |`);
  lines.push(`|---|---|---|---|---|---|`);
  for (const g of report.godNodes) {
    lines.push(
      `| **${g.title}** | \`${g.type}\` | ${g.degree} | ${g.inDegree} | ${g.outDegree} | ${g.role} |`
    );
  }
  lines.push(``);

  lines.push(`## 3. Comunidades Semânticas e Coesão`);
  for (const c of report.communities) {
    lines.push(`### ${c.label}`);
    lines.push(`- **Hub Principal:** ${c.hubNodeTitle}`);
    lines.push(`- **Coesão Interna:** ${(c.cohesionScore * 100).toFixed(1)}% (Densidade: ${c.density})`);
    lines.push(`- **Membros (${c.memberIds.length}):** ${c.memberIds.map((m) => `\`${m}\``).join(", ")}`);
    lines.push(``);
  }

  lines.push(`## 4. Conexões Surpreendentes (Pontes Interdisciplinares)`);
  if (report.surprisingConnections.length === 0) {
    lines.push(`*Nenhuma ponte de alto impacto detectada.*`);
  } else {
    lines.push(`| Origem | Relação | Destino | Escore | Razões da Surpresa |`);
    lines.push(`|---|---|---|---|---|`);
    for (const s of report.surprisingConnections) {
      lines.push(
        `| **${s.sourceTitle}** | \`${s.relation}\` | **${s.targetTitle}** | ${s.score} | ${s.reasons.join("; ")} |`
      );
    }
  }
  lines.push(``);

  lines.push(`## 5. Perguntas Estratégicas Sugeridas pela Topologia`);
  lines.push(`*Perguntas geradas a partir de anomalias, pontes e centralidade para guiar o orquestrador de IA do Oh My Shark.*`);
  lines.push(``);
  for (const q of report.suggestedQuestions) {
    lines.push(`- **[${q.category.toUpperCase()}]** ${q.question}`);
    lines.push(`  - *Fundamento:* ${q.rationale}`);
  }
  lines.push(``);

  if (report.cycles.length > 0) {
    lines.push(`## 6. Ciclos e Dependências Circulares`);
    for (const cycle of report.cycles) {
      lines.push(`- **${cycle.description}** (comprimento: ${cycle.length})`);
    }
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`*Relatório gerado pelo motor Graphify-Grade do Oh My Shark — Mente em Teia.*`);

  return lines.join("\n");
}

/**
 * Converte o grafo para formato Graph JSON (NetworkX / D3 compatível)
 */
export function exportToGraphJson(
  nodes: GraphifyNode[],
  edges: GraphifyEdge[],
  communities: GraphifyCommunity[]
): string {
  const payload = {
    directed: false,
    multigraph: false,
    graph: {
      name: "Mente em Teia Graph",
      generated_at: new Date().toISOString(),
      communities_count: communities.length,
    },
    nodes: nodes.map((n) => ({
      id: n.id,
      label: n.title,
      type: n.type,
      community: n.communityId,
      degree: n.degree,
      ghost: n.ghost || false,
    })),
    links: edges.map((e) => ({
      source: e.source,
      target: e.target,
      relation: e.relation,
      confidence: e.confidenceLevel,
      weight: e.weight,
      is_cross_community: e.isCrossCommunity || false,
    })),
  };

  return JSON.stringify(payload, null, 2);
}
