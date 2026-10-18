import React from "react";
import type { TeiaNode, TeiaNodeType } from "@/services/teiaEngine";
import { PlusIcon, TrashIcon } from "@/components/icons";

export interface TeiaWorkspaceHeaderProps {
  activeNode: TeiaNode | null;
  viewMode: "graph" | "split" | "editor" | "preview";
  onViewModeChange: (mode: "graph" | "split" | "editor" | "preview") => void;
  isDirty: boolean;
  isLoading: boolean;
  onSave: () => void;
  onDelete: () => void;
  onNewNote: () => void;
  isZen: boolean;
  onToggleZen: () => void;
  typeFilter: TeiaNodeType | "all";
  onTypeFilterChange: (type: TeiaNodeType | "all") => void;
  physicsRunning: boolean;
  onTogglePhysics: () => void;
}

const TYPE_COLOR_MAP: Record<string, string> = {
  concept: "var(--teia-node-concept)",
  technology: "var(--teia-node-tech)",
  decision: "var(--teia-node-decision)",
  project: "var(--teia-node-project)",
  memory: "var(--teia-node-memory)",
  preference: "var(--teia-node-pref)",
  problem: "var(--teia-node-problem)",
  solution: "var(--teia-node-solution)",
  idea: "var(--teia-node-idea)",
  reference: "var(--teia-node-ref)",
  ghost: "var(--teia-node-ghost)",
};

export const TeiaWorkspaceHeader: React.FC<TeiaWorkspaceHeaderProps> = ({
  activeNode,
  viewMode,
  onViewModeChange,
  isDirty,
  isLoading,
  onSave,
  onDelete,
  onNewNote,
  isZen,
  onToggleZen,
  typeFilter,
  onTypeFilterChange,
  physicsRunning,
  onTogglePhysics,
}) => {
  return (
    <header
      className="teia-workspace-header"
      style={{
        height: "46px",
        minHeight: "46px",
        padding: "0 16px",
        backgroundColor: "var(--teia-void)",
        borderBottom: "1px solid var(--teia-line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "14px",
        userSelect: "none",
        zIndex: 20,
      }}
    >
      {/* 1. Esquerda: Informações da Nota Ativa ou Visão Geral */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        {activeNode ? (
          <>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--teia-text-bright)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "260px",
              }}
              title={activeNode.title}
            >
              {activeNode.title}
            </span>

            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--teia-font-mono)",
                padding: "1px 7px",
                borderRadius: "var(--teia-r-full)",
                border: `1px solid ${TYPE_COLOR_MAP[activeNode.type] || "var(--teia-accent)"}`,
                color: TYPE_COLOR_MAP[activeNode.type] || "var(--teia-accent-hover)",
                backgroundColor: "rgba(122, 130, 230, 0.08)",
                textTransform: "uppercase",
                letterSpacing: "0.4px",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {activeNode.trust === "AI_GENERATED" ? "✦ " + activeNode.type : activeNode.type}
            </span>

            {isDirty && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: "var(--teia-trust-warn)",
                    boxShadow: "0 0 6px var(--teia-trust-warn)",
                  }}
                  title="Alterações não salvas"
                />
                <button
                  onClick={onSave}
                  disabled={isLoading}
                  style={{
                    padding: "3px 10px",
                    borderRadius: "var(--teia-r-sm)",
                    backgroundColor: "var(--teia-accent-active)",
                    border: "1px solid var(--teia-accent)",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 120ms ease-out",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--teia-accent)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--teia-accent-active)")}
                >
                  Salvar
                </button>
              </div>
            )}

            <button
              onClick={onDelete}
              title="Excluir nota permanentemente do Desktop Vault"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--teia-muted)",
                cursor: "pointer",
                padding: "4px",
                borderRadius: "var(--teia-r-xs)",
                display: "flex",
                alignItems: "center",
                transition: "color 100ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--teia-trust-bad)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--teia-muted)")}
            >
              <TrashIcon size={13} />
            </button>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--teia-text-bright)" }}>
              Constelação de Conhecimento
            </span>
            <span
              style={{
                fontSize: "10px",
                fontFamily: "var(--teia-font-mono)",
                padding: "1px 6px",
                borderRadius: "var(--teia-r-full)",
                backgroundColor: "var(--teia-accent-subtle)",
                color: "var(--teia-accent-hover)",
                fontWeight: 600,
              }}
            >
              VISÃO GLOBAL
            </span>
          </div>
        )}
      </div>

      {/* 2. Centro: Segmented Switcher de Modos de Visão */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          backgroundColor: "var(--teia-p1)",
          padding: "2px",
          borderRadius: "var(--teia-r-sm)",
          border: "1px solid var(--teia-line)",
        }}
      >
        {(
          [
            { id: "graph", label: "Grafo" },
            { id: "split", label: "Split Studio" },
            { id: "editor", label: "Raw Editor" },
            { id: "preview", label: "Leitor" },
          ] as const
        ).map((m) => {
          const active = viewMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onViewModeChange(m.id)}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--teia-r-xs)",
                backgroundColor: active ? "var(--teia-accent-active)" : "transparent",
                color: active ? "#FFFFFF" : "var(--teia-muted)",
                border: "none",
                fontSize: "11px",
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                transition: "all 120ms ease-out",
                boxShadow: active ? "0 2px 6px rgba(122, 130, 230, 0.35)" : "none",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "var(--teia-p2)";
                  e.currentTarget.style.color = "var(--teia-text-bright)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "var(--teia-muted)";
                }
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* 3. Direita: Filtros, Física, Foco Zen e Nova Nota */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Filtro Semântico no Grafo */}
        {viewMode === "graph" && (
          <>
            <select
              value={typeFilter}
              onChange={(e) => onTypeFilterChange(e.target.value as TeiaNodeType | "all")}
              title="Filtrar nós no grafo por tipo semântico"
              style={{
                height: "26px",
                padding: "0 8px",
                borderRadius: "var(--teia-r-sm)",
                backgroundColor: "var(--teia-p1)",
                border: "1px solid var(--teia-line)",
                color: "var(--teia-text)",
                fontSize: "11px",
                fontFamily: "var(--teia-font-mono)",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">Filtro: Todos os Tipos</option>
              <option value="concept">concept (Conceito)</option>
              <option value="technology">technology (Tecnologia)</option>
              <option value="project">project (Projeto)</option>
              <option value="decision">decision (Decisão)</option>
              <option value="problem">problem (Problema)</option>
              <option value="solution">solution (Solução)</option>
              <option value="idea">idea (Ideia)</option>
              <option value="reference">reference (Referência)</option>
              <option value="preference">preference (Preferência)</option>
              <option value="memory">memory (Memória IA)</option>
            </select>

            {/* Alternar Física */}
            <button
              onClick={onTogglePhysics}
              title={physicsRunning ? "Pausar atrito de partículas" : "Retomar atrito de partículas"}
              style={{
                padding: "4px 8px",
                borderRadius: "var(--teia-r-sm)",
                backgroundColor: physicsRunning ? "var(--teia-p2)" : "rgba(122, 130, 230, 0.15)",
                border: `1px solid ${physicsRunning ? "var(--teia-line)" : "var(--teia-accent-border)"}`,
                color: physicsRunning ? "var(--teia-muted)" : "var(--teia-accent-hover)",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {physicsRunning ? "Física: Ativa" : "Física: Pausada"}
            </button>
          </>
        )}

        {/* Botão Foco Zen (Tela Cheia sem Distrações) */}
        <button
          onClick={onToggleZen}
          title={isZen ? "Sair do modo foco zen (Ctrl+G)" : "Entrar no modo foco zen sem distrações (Ctrl+G)"}
          style={{
            padding: "4px 10px",
            borderRadius: "var(--teia-r-sm)",
            backgroundColor: isZen ? "var(--teia-accent-active)" : "var(--teia-p1)",
            border: `1px solid ${isZen ? "var(--teia-accent)" : "var(--teia-line)"}`,
            color: isZen ? "#FFFFFF" : "var(--teia-text)",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 120ms ease-out",
          }}
          onMouseEnter={(e) => {
            if (!isZen) {
              e.currentTarget.style.borderColor = "var(--teia-accent-border)";
              e.currentTarget.style.color = "var(--teia-text-bright)";
            }
          }}
          onMouseLeave={(e) => {
            if (!isZen) {
              e.currentTarget.style.borderColor = "var(--teia-line)";
              e.currentTarget.style.color = "var(--teia-text)";
            }
          }}
        >
          {isZen ? "Sair do Zen" : "Foco Zen"}
        </button>

        {/* Botão Nova Nota */}
        <button
          onClick={onNewNote}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 12px",
            borderRadius: "var(--teia-r-sm)",
            backgroundColor: "var(--teia-accent-active)",
            border: "1px solid var(--teia-accent)",
            color: "#FFFFFF",
            fontSize: "11px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 120ms ease-out",
            boxShadow: "0 2px 8px rgba(122, 130, 230, 0.3)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--teia-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--teia-accent-active)")}
        >
          <PlusIcon size={12} />
          <span>Nova Nota</span>
        </button>
      </div>
    </header>
  );
};
