import React from "react";
import type { TeiaNode } from "@/services/teiaEngine";
import { CopyIcon, CheckIcon } from "@/components/icons";

export interface TeiaInspectorProps {
  activeNode: TeiaNode | null;
  activeTab: "ctx" | "agent" | "prop";
  onTabChange: (tab: "ctx" | "agent" | "prop") => void;
  onOpenNode: (id: string) => void;
  agentQuery: string;
  onAgentQueryChange: (q: string) => void;
  onRequestAgentContext: (q?: string) => void;
  agentResult: { nodesCount: number; text: string } | null;
  vaultPath: string;
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
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAgentContext = () => {
    if (!agentResult) return;
    navigator.clipboard.writeText(agentResult.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      className="teia-inspector"
      style={{
        width: "290px",
        backgroundColor: "var(--teia-p1)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100%",
        borderLeft: "1px solid var(--teia-line)",
        userSelect: "none",
      }}
    >
      {/* 1. Abas Segmentadas do Inspetor */}
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
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                borderBottom: isActive ? "2px solid var(--teia-accent)" : "2px solid transparent",
                backgroundColor: "transparent",
                color: isActive ? "var(--teia-text-bright)" : "var(--teia-muted)",
                fontSize: "11px",
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                transition: "all 100ms",
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
      </div>
    </aside>
  );
};
