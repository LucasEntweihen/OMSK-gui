import React from "react";
import type {
  TeiaNode,
  GraphifyCommunity,
  GraphifyGodNode,
  GraphifySurprisingConnection,
  GraphifySuggestedQuestion,
} from "@/services/teiaEngine";
import { CopyIcon, CheckIcon, RefreshIcon } from "@/components/icons";

export interface TeiaInspectorProps {
  activeNode: TeiaNode | null;
  activeTab: "ctx" | "agent" | "prop" | "graphify";
  onTabChange: (tab: "ctx" | "agent" | "prop" | "graphify") => void;
  onOpenNode: (id: string) => void;
  agentQuery: string;
  onAgentQueryChange: (q: string) => void;
  onRequestAgentContext: (q?: string) => void;
  agentResult: { nodesCount: number; text: string } | null;
  vaultPath: string;
  communities?: GraphifyCommunity[];
  godNodes?: GraphifyGodNode[];
  surprisingConnections?: GraphifySurprisingConnection[];
  suggestedQuestions?: GraphifySuggestedQuestion[];
  onRunGraphifyAnalysis?: () => void;
  onSaveCanvas?: () => void;
  onSaveReport?: () => void;
  onDownloadCanvas?: () => void;
  onDownloadReport?: () => void;
}

export const TeiaInspector: React.FC<TeiaInspectorProps> = ({
  activeNode,
  activeTab,
  onTabChange,
  onOpenNode,
  agentQuery,
  onAgentQueryChange,
  onRequestAgentContext,
  agentResult,
  vaultPath,
  communities = [],
  godNodes = [],
  surprisingConnections = [],
  suggestedQuestions = [],
  onRunGraphifyAnalysis,
  onSaveCanvas,
  onSaveReport,
  onDownloadCanvas,
  onDownloadReport,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAgentContext = () => {
    if (!agentResult) return;
    navigator.clipboard.writeText(agentResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const averageCohesion =
    communities.length > 0
      ? communities.reduce((acc, c) => acc + c.cohesionScore, 0) / communities.length
      : 0;

  return (
    <aside
      className="teia-inspector"
      style={{
        width: "320px",
        backgroundColor: "var(--teia-p1)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100%",
        borderLeft: "1px solid var(--teia-line)",
        userSelect: "none",
      }}
    >
      {/* 1. Abas Segmentadas do Inspetor com Graphify */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--teia-line)",
          backgroundColor: "var(--teia-void)",
        }}
      >
        {(
          [
            { id: "ctx", label: "Conexões" },
            { id: "agent", label: "Memória IA" },
            { id: "prop", label: "Metadados" },
            { id: "graphify", label: "Graphify" },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                padding: "10px 4px",
                border: "none",
                borderBottom: isActive ? "2px solid var(--teia-accent)" : "2px solid transparent",
                backgroundColor: "transparent",
                color: isActive ? "var(--teia-text-bright)" : "var(--teia-muted)",
                fontSize: "11px",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                transition: "all 100ms",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 2. Conteúdo da Aba */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
        {/* ABA 1: CONEXÕES */}
        {activeTab === "ctx" && (
          <>
            {activeNode ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--teia-text-bright)",
                      wordBreak: "break-word",
                    }}
                  >
                    {activeNode.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--teia-font-mono)",
                        color: "var(--teia-accent-hover)",
                        textTransform: "uppercase",
                      }}
                    >
                      {activeNode.type}
                    </span>
                    <span style={{ color: "var(--teia-faint)", fontSize: "10px" }}>•</span>
                    <span style={{ fontSize: "11px", color: "var(--teia-muted)", fontFamily: "var(--teia-font-mono)" }}>
                      {activeNode.degree ?? 0} conexões
                    </span>
                    {activeNode.isGodNode && (
                      <span
                        style={{
                          fontSize: "9px",
                          padding: "1px 6px",
                          borderRadius: "var(--teia-r-full)",
                          backgroundColor: "rgba(255, 184, 108, 0.15)",
                          border: "1px solid rgba(255, 184, 108, 0.4)",
                          color: "#FFB86C",
                          fontWeight: 700,
                        }}
                      >
                        GOD NODE
                      </span>
                    )}
                  </div>
                </div>

                {/* Relações Diretas de Saída (→) */}
                <div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "var(--teia-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Relações Diretas (→)
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {activeNode.outgoing && activeNode.outgoing.length > 0 ? (
                      activeNode.outgoing.map((rel, i) => (
                        <button
                          key={i}
                          onClick={() => onOpenNode(rel.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 8px",
                            borderRadius: "var(--teia-r-xs)",
                            backgroundColor: "var(--teia-p2)",
                            border: "1px solid var(--teia-line-subtle)",
                            cursor: "pointer",
                            fontSize: "11px",
                            color: "var(--teia-accent-hover)",
                            textAlign: "left",
                            transition: "all 100ms",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--teia-p3)";
                            e.currentTarget.style.borderColor = "var(--teia-accent-border)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--teia-p2)";
                            e.currentTarget.style.borderColor = "var(--teia-line-subtle)";
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>→ {rel.title}</span>
                          <span style={{ color: "var(--teia-muted)", fontSize: "10px", fontFamily: "var(--teia-font-mono)" }}>
                            {rel.relation}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--teia-faint)", fontStyle: "italic" }}>
                        Nenhuma relação direta mapeada.
                      </span>
                    )}
                  </div>
                </div>

                {/* Backlinks de Entrada (←) */}
                <div>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      color: "var(--teia-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      marginBottom: "6px",
                    }}
                  >
                    Backlinks de Entrada (←)
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {activeNode.backlinks && activeNode.backlinks.length > 0 ? (
                      activeNode.backlinks.map((bl, i) => (
                        <button
                          key={i}
                          onClick={() => onOpenNode(bl.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "6px 8px",
                            borderRadius: "var(--teia-r-xs)",
                            backgroundColor: "var(--teia-p2)",
                            border: "1px solid var(--teia-line-subtle)",
                            cursor: "pointer",
                            fontSize: "11px",
                            color: "var(--teia-trust-verified)",
                            textAlign: "left",
                            transition: "all 100ms",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--teia-p3)";
                            e.currentTarget.style.borderColor = "rgba(101, 220, 162, 0.4)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "var(--teia-p2)";
                            e.currentTarget.style.borderColor = "var(--teia-line-subtle)";
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>← {bl.title}</span>
                          <span style={{ color: "var(--teia-muted)", fontSize: "10px", fontFamily: "var(--teia-font-mono)" }}>
                            {bl.relation}
                          </span>
                        </button>
                      ))
                    ) : (
                      <span style={{ fontSize: "11px", color: "var(--teia-faint)", fontStyle: "italic" }}>
                        Nenhum backlink citando esta nota ainda.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "28px 10px", color: "var(--teia-muted)", fontSize: "12px", lineHeight: 1.5 }}>
                Abra uma nota no Explorer ou clique em um nó no Grafo para inspecionar conexões.
              </div>
            )}
          </>
        )}

        {/* ABA 2: MEMÓRIA IA */}
        {activeTab === "agent" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--teia-text-bright)" }}>
                Injeção de Contexto para a IA
              </span>
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--teia-muted)", lineHeight: 1.45 }}>
                O Oh My Shark consulta este Desktop Vault como memória persistente permanente.
              </p>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <input
                value={agentQuery}
                onChange={(e) => onAgentQueryChange(e.target.value)}
                placeholder="Filtro ou termo semântico..."
                style={{
                  flex: 1,
                  padding: "5px 8px",
                  borderRadius: "var(--teia-r-sm)",
                  backgroundColor: "var(--teia-void)",
                  border: "1px solid var(--teia-line)",
                  color: "var(--teia-text)",
                  fontSize: "11px",
                  outline: "none",
                }}
              />
              <button
                onClick={() => onRequestAgentContext(agentQuery)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "var(--teia-r-sm)",
                  backgroundColor: "var(--teia-accent-active)",
                  border: "1px solid var(--teia-accent)",
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Montar
              </button>
            </div>

            {agentResult && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", color: "var(--teia-muted)", fontFamily: "var(--teia-font-mono)" }}>
                    {agentResult.nodesCount} nós recuperados
                  </span>
                  <button
                    onClick={handleCopyAgentContext}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "transparent",
                      border: "none",
                      color: copied ? "var(--teia-trust-verified)" : "var(--teia-accent-hover)",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                    <span>{copied ? "Copiado!" : "Copiar Bloco"}</span>
                  </button>
                </div>

                <pre
                  style={{
                    margin: 0,
                    padding: "8px",
                    borderRadius: "var(--teia-r-sm)",
                    backgroundColor: "var(--teia-void)",
                    border: "1px solid var(--teia-line)",
                    color: "var(--teia-text)",
                    fontFamily: "var(--teia-font-mono)",
                    fontSize: "10px",
                    lineHeight: 1.4,
                    whiteSpace: "pre-wrap",
                    maxHeight: "240px",
                    overflowY: "auto",
                  }}
                >
                  {agentResult.text}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ABA 3: METADADOS */}
        {activeTab === "prop" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "11px" }}>
            {activeNode ? (
              <>
                <div style={{ padding: "8px 10px", borderRadius: "var(--teia-r-sm)", backgroundColor: "var(--teia-p2)", border: "1px solid var(--teia-line)" }}>
                  <span style={{ color: "var(--teia-muted)", display: "block" }}>Título</span>
                  <strong style={{ color: "var(--teia-text-bright)", fontSize: "12px" }}>{activeNode.title}</strong>
                </div>

                <div style={{ padding: "8px 10px", borderRadius: "var(--teia-r-sm)", backgroundColor: "var(--teia-p2)", border: "1px solid var(--teia-line)" }}>
                  <span style={{ color: "var(--teia-muted)", display: "block" }}>Tipo Semântico</span>
                  <span style={{ color: "var(--teia-accent-hover)", fontFamily: "var(--teia-font-mono)" }}>{activeNode.type}</span>
                </div>

                <div style={{ padding: "8px 10px", borderRadius: "var(--teia-r-sm)", backgroundColor: "var(--teia-p2)", border: "1px solid var(--teia-line)" }}>
                  <span style={{ color: "var(--teia-muted)", display: "block" }}>Confiança Epistêmica</span>
                  <span style={{ color: "var(--teia-trust-verified)", fontWeight: 600 }}>{activeNode.trust}</span>
                </div>

                {activeNode.tags.length > 0 && (
                  <div style={{ padding: "8px 10px", borderRadius: "var(--teia-r-sm)", backgroundColor: "var(--teia-p2)", border: "1px solid var(--teia-line)" }}>
                    <span style={{ color: "var(--teia-muted)", display: "block", marginBottom: "4px" }}>Tags</span>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {activeNode.tags.map((t, idx) => (
                        <span key={idx} className="teia-tag-pill">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ padding: "8px 10px", borderRadius: "var(--teia-r-sm)", backgroundColor: "var(--teia-p2)", border: "1px solid var(--teia-line)" }}>
                  <span style={{ color: "var(--teia-muted)", display: "block" }}>Arquivo no Disco</span>
                  <span style={{ fontFamily: "var(--teia-font-mono)", fontSize: "10px", color: "var(--teia-text)", wordBreak: "break-all" }}>
                    {activeNode.path || `${vaultPath}/${activeNode.id}.md`}
                  </span>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "28px 10px", color: "var(--teia-muted)" }}>
                Nenhuma nota selecionada.
              </div>
            )}
          </div>
        )}

        {/* ABA 4: GRAPHIFY & ANÁLISE TOPOLÓGICA */}
        {activeTab === "graphify" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Barra de Ações Graphify */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--teia-text-bright)" }}>
                  MOTOR GRAPHIFY
                </span>
                {onRunGraphifyAnalysis && (
                  <button
                    onClick={onRunGraphifyAnalysis}
                    title="Recalcular topologia, comunidades e métricas do Graphify"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "transparent",
                      border: "none",
                      color: "var(--teia-accent-hover)",
                      fontSize: "11px",
                      cursor: "pointer",
                      padding: "2px 4px",
                    }}
                  >
                    <RefreshIcon size={12} />
                    <span>Recalcular</span>
                  </button>
                )}
              </div>

              {/* Botões de Ação de Salvar no Vault */}
              <div style={{ display: "flex", gap: "6px" }}>
                {onSaveCanvas && (
                  <button
                    onClick={onSaveCanvas}
                    title="Salvar mente-em-teia.canvas diretamente na pasta física do Vault"
                    style={{
                      flex: 1,
                      padding: "5px 8px",
                      borderRadius: "var(--teia-r-sm)",
                      backgroundColor: "var(--teia-p2)",
                      border: "1px solid var(--teia-accent-border)",
                      color: "var(--teia-text-bright)",
                      fontSize: "10px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Salvar .canvas
                  </button>
                )}
                {onSaveReport && (
                  <button
                    onClick={onSaveReport}
                    title="Salvar GRAPH_REPORT.md diretamente na pasta física do Vault"
                    style={{
                      flex: 1,
                      padding: "5px 8px",
                      borderRadius: "var(--teia-r-sm)",
                      backgroundColor: "var(--teia-p2)",
                      border: "1px solid var(--teia-line)",
                      color: "var(--teia-text-bright)",
                      fontSize: "10px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Salvar REPORT
                  </button>
                )}
              </div>

              {/* Botões de Download Local no Navegador */}
              <div style={{ display: "flex", gap: "6px" }}>
                {onDownloadCanvas && (
                  <button
                    onClick={onDownloadCanvas}
                    title="Baixar arquivo JSON mente-em-teia.canvas para abrir no Obsidian Desktop"
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      borderRadius: "var(--teia-r-sm)",
                      backgroundColor: "var(--teia-void)",
                      border: "1px solid var(--teia-line)",
                      color: "var(--teia-muted)",
                      fontSize: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Baixar .canvas
                  </button>
                )}
                {onDownloadReport && (
                  <button
                    onClick={onDownloadReport}
                    title="Baixar relatório GRAPH_REPORT.md"
                    style={{
                      flex: 1,
                      padding: "4px 6px",
                      borderRadius: "var(--teia-r-sm)",
                      backgroundColor: "var(--teia-void)",
                      border: "1px solid var(--teia-line)",
                      color: "var(--teia-muted)",
                      fontSize: "10px",
                      cursor: "pointer",
                    }}
                  >
                    Baixar REPORT
                  </button>
                )}
              </div>
            </div>

            {/* Banner de Métricas da Topologia */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
                padding: "8px",
                borderRadius: "var(--teia-r-sm)",
                backgroundColor: "var(--teia-void)",
                border: "1px solid var(--teia-line)",
              }}
            >
              <div>
                <span style={{ fontSize: "10px", color: "var(--teia-muted)" }}>Clusters:</span>
                <strong style={{ display: "block", color: "var(--teia-accent-hover)", fontSize: "13px" }}>
                  {communities.length}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "var(--teia-muted)" }}>Coesão Média:</span>
                <strong style={{ display: "block", color: "var(--teia-trust-verified)", fontSize: "13px" }}>
                  {Math.round(averageCohesion * 100)}%
                </strong>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "var(--teia-muted)" }}>God Nodes:</span>
                <strong style={{ display: "block", color: "#FFB86C", fontSize: "13px" }}>
                  {godNodes.length}
                </strong>
              </div>
              <div>
                <span style={{ fontSize: "10px", color: "var(--teia-muted)" }}>Pontes:</span>
                <strong style={{ display: "block", color: "var(--teia-text-bright)", fontSize: "13px" }}>
                  {surprisingConnections.length}
                </strong>
              </div>
            </div>

            {/* 1. Comunidades Semânticas e Coesão */}
            <div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--teia-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Comunidades ({communities.length})
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {communities.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "8px",
                      borderRadius: "var(--teia-r-xs)",
                      backgroundColor: "var(--teia-p2)",
                      border: "1px solid var(--teia-line)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: c.color }} />
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--teia-text-bright)" }}>
                          {c.label}
                        </span>
                      </div>
                      <span style={{ fontSize: "10px", color: "var(--teia-trust-verified)", fontFamily: "var(--teia-font-mono)" }}>
                        {Math.round(c.cohesionScore * 100)}% coesão
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", marginTop: "2px" }}>
                      {c.memberIds.map((mId) => (
                        <button
                          key={mId}
                          onClick={() => onOpenNode(mId)}
                          style={{
                            fontSize: "10px",
                            padding: "1px 5px",
                            borderRadius: "var(--teia-r-xs)",
                            backgroundColor: "var(--teia-void)",
                            border: "1px solid var(--teia-line)",
                            color: "var(--teia-text)",
                            cursor: "pointer",
                          }}
                        >
                          {mId}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. God Nodes — Abstrações Centrais */}
            <div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--teia-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                God Nodes (Alta Centralidade)
              </span>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {godNodes.map((g) => (
                  <div
                    key={g.nodeId}
                    onClick={() => onOpenNode(g.nodeId)}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "var(--teia-r-xs)",
                      backgroundColor: "var(--teia-p2)",
                      border: "1px solid rgba(255, 184, 108, 0.25)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: "#FFB86C" }}>
                        ★ {g.title}
                      </span>
                      <span style={{ display: "block", fontSize: "10px", color: "var(--teia-muted)" }}>
                        {g.role}
                      </span>
                    </div>
                    <span style={{ fontSize: "10px", fontFamily: "var(--teia-font-mono)", color: "var(--teia-text)" }}>
                      grau {g.degree}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Conexões Surpreendentes (Pontes) */}
            {surprisingConnections.length > 0 && (
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--teia-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Pontes Inter-Comunitárias
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {surprisingConnections.slice(0, 4).map((s, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "6px 8px",
                        borderRadius: "var(--teia-r-xs)",
                        backgroundColor: "var(--teia-p2)",
                        border: "1px solid var(--teia-line)",
                        fontSize: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--teia-accent-hover)" }}>
                        <span style={{ fontWeight: 600 }}>{s.sourceTitle} ⚡ {s.targetTitle}</span>
                        <span style={{ color: "#FFB86C", fontWeight: 700 }}>+{s.score}</span>
                      </div>
                      <span style={{ display: "block", color: "var(--teia-muted)", marginTop: "2px" }}>
                        {s.reasons[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Perguntas Estratégicas Sugeridas */}
            {suggestedQuestions.length > 0 && (
              <div>
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "var(--teia-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  Perguntas Sugeridas pela Topologia
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {suggestedQuestions.slice(0, 4).map((q) => (
                    <div
                      key={q.id}
                      style={{
                        padding: "8px",
                        borderRadius: "var(--teia-r-xs)",
                        backgroundColor: "var(--teia-void)",
                        border: "1px solid var(--teia-accent-border)",
                        fontSize: "11px",
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "var(--teia-text-bright)", display: "block" }}>
                        {q.question}
                      </span>
                      <span style={{ fontSize: "10px", color: "var(--teia-muted)", display: "block", marginTop: "3px" }}>
                        {q.rationale}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
