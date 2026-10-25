import React from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/icons";

export interface ThinkingBlockProps {
  status: "thinking" | "done";
  text?: string;
  duration?: string;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
  status,
  text = "",
  duration = "0.0s",
}) => {
  // Mantém aberto enquanto estiver pensando para o usuário ver o fluxo em tempo real igual na CLI
  const [expanded, setExpanded] = React.useState(true);

  // Divide o texto do raciocínio em linhas limpas
  const rawLines = (text || "Analisando contexto e planejando ações...").split("\n");
  const lastLine = rawLines.filter((l) => l.trim()).pop() || "Processando raciocínio neural...";

  return (
    <div
      style={{
        margin: "10px 0",
        borderRadius: "var(--radius-md)",
        backgroundColor: "rgba(6, 19, 38, 0.85)",
        border: "1px solid " + (status === "thinking" ? "var(--blue-500)" : "rgba(23, 51, 83, 0.8)"),
        boxShadow: status === "thinking" ? "0 0 14px rgba(38, 120, 255, 0.25)" : "none",
        fontSize: "var(--text-xs)",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: "680px",
        overflow: "hidden",
        transition: "all var(--duration-fast)",
      }}
    >
      {/* Header do Raciocínio com Indicador em Tempo Real estilo CLI */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 12px",
          backgroundColor: status === "thinking" ? "rgba(38, 120, 255, 0.12)" : "rgba(9, 26, 49, 0.6)",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: status === "thinking" ? "#00F0FF" : "var(--state-success)",
              boxShadow: status === "thinking" ? "0 0 8px #00F0FF" : "none",
              animation: status === "thinking" ? "pulse-subtle 1s infinite ease-in-out" : "none",
            }}
          />

          <span
            style={{
              fontWeight: 700,
              fontFamily: "var(--font-code)",
              color: status === "thinking" ? "var(--blue-400)" : "var(--color-text)",
            }}
          >
            {status === "thinking" ? "⚡ Linha de Raciocínio Neural (CLI Stream)" : "✔ Raciocínio Concluído"}
          </span>

          {duration && (
            <span
              style={{
                color: "var(--color-text-muted)",
                fontSize: "10px",
                fontFamily: "var(--font-code)",
                padding: "1px 5px",
                backgroundColor: "var(--ocean-950)",
                borderRadius: "var(--radius-xs)",
              }}
            >
              {duration}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
            {expanded ? "Recolher" : "Expandir"}
          </span>
          <span style={{ color: "var(--color-text-muted)", display: "flex" }}>
            {expanded ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
          </span>
        </div>
      </div>

      {/* Linha Atual de Mudança Contínua (Preview enquanto recolhido) */}
      {!expanded && status === "thinking" && (
        <div
          style={{
            padding: "6px 12px",
            fontFamily: "var(--font-code)",
            fontSize: "11px",
            color: "var(--color-text-secondary)",
            backgroundColor: "rgba(2, 10, 22, 0.6)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {lastLine}
        </div>
      )}

      {/* Terminal de Linhas de Raciocínio com Scroll Automático e Estilo CLI */}
      {expanded && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#020A16",
            borderTop: "1px solid rgba(23, 51, 83, 0.5)",
            color: "#A5B4FC",
            fontFamily: "var(--font-code)",
            fontSize: "11px",
            lineHeight: 1.6,
            maxHeight: "220px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {rawLines.map((line, idx) => {
            const isSpecial = line.includes("DOOMANIA") || line.includes("deepseaneuron") || line.includes("Contrato");
            return (
              <div
                key={idx}
                style={{
                  color: isSpecial ? "#10B981" : idx === rawLines.length - 1 && status === "thinking" ? "#00F0FF" : "var(--color-text-secondary)",
                  fontWeight: isSpecial ? 700 : 400,
                  display: "flex",
                  gap: "6px",
                }}
              >
                <span style={{ color: "#385170", userSelect: "none" }}>›</span>
                <span>{line}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
