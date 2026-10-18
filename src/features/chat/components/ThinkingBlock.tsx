import React from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@/components/icons";

export interface ThinkingBlockProps {
  status: "thinking" | "done";
  text?: string;
  duration?: string;
}

export const ThinkingBlock: React.FC<ThinkingBlockProps> = ({
  status,
  text = "Analisando estrutura e verificando contexto...",
  duration = "1.2s",
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      style={{
        margin: "8px 0",
        padding: "8px 12px",
        borderRadius: "var(--radius-md)",
        backgroundColor: "rgba(6, 19, 38, 0.6)",
        border: "1px solid rgba(23, 51, 83, 0.6)",
        fontSize: "var(--text-xs)",
        display: "inline-flex",
        flexDirection: "column",
        gap: "6px",
        maxWidth: "520px",
      }}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "var(--blue-400)",
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "var(--blue-400)",
            animation: status === "thinking" ? "pulse-subtle 1.2s infinite ease-in-out" : "none",
            boxShadow: "0 0 6px rgba(72, 165, 255, 0.6)",
          }}
        />

        <span style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>
          {status === "thinking" ? "Pensando..." : "Pensando concluído"}
        </span>

        {duration && (
          <span style={{ color: "var(--color-text-muted)", fontSize: "10px" }}>
            ({duration})
          </span>
        )}

        <span style={{ color: "var(--color-text-muted)", marginLeft: "4px" }}>
          {expanded ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
        </span>
      </div>

      {expanded && (
        <div
          style={{
            paddingTop: "6px",
            borderTop: "1px dashed rgba(23, 51, 83, 0.5)",
            color: "var(--color-text-muted)",
            fontFamily: "var(--font-code)",
            fontSize: "11px",
            lineHeight: 1.4,
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};
