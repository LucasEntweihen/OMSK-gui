import React from "react";
import { TerminalIcon, CheckCircleIcon, ChevronDownIcon, ChevronRightIcon } from "@/components/icons";

export interface ToolExecutionCardProps {
  toolName: string;
  command: string;
  duration?: string;
  output?: string;
  status?: "running" | "success" | "error";
}

export const ToolExecutionCard: React.FC<ToolExecutionCardProps> = ({
  toolName,
  command,
  duration = "2.4s",
  output,
  status = "success",
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div
      style={{
        margin: "14px 0",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "rgba(6, 19, 38, 0.7)",
        border: "1px solid var(--color-border)",
        overflow: "hidden",
        maxWidth: "680px",
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 14px",
          backgroundColor: "rgba(2, 10, 22, 0.5)",
          borderBottom: "1px solid rgba(23, 51, 83, 0.5)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-secondary)",
        }}
      >
        <span style={{ color: "var(--blue-400)" }}>⚙</span>
        <span style={{ fontWeight: 600 }}>Executando ferramenta</span>
      </div>

      {/* Command Bar */}
      <div
        onClick={() => output && setExpanded(!expanded)}
        style={{
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: output ? "pointer" : "default",
          backgroundColor: "var(--ocean-900)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "var(--font-code)", fontSize: "var(--text-sm)" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "var(--radius-xs)",
              backgroundColor: "rgba(53, 211, 154, 0.15)",
              color: "var(--state-success)",
            }}
          >
            <TerminalIcon size={12} color="var(--state-success)" />
          </div>

          <span style={{ color: "var(--color-text)", fontWeight: 600 }}>
            {command || `${toolName}`}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
          {status === "success" && (
            <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--state-success)", fontWeight: 600 }}>
              <CheckCircleIcon size={13} color="var(--state-success)" />
              <span>{duration}</span>
            </span>
          )}

          {output && (
            <span style={{ color: "var(--color-text-muted)" }}>
              {expanded ? <ChevronDownIcon size={13} /> : <ChevronRightIcon size={13} />}
            </span>
          )}
        </div>
      </div>

      {/* Expandable output terminal */}
      {expanded && output && (
        <div
          style={{
            padding: "12px 14px",
            backgroundColor: "var(--ocean-950)",
            borderTop: "1px solid var(--color-border)",
            fontFamily: "var(--font-code)",
            fontSize: "11px",
            color: "var(--color-text-secondary)",
            whiteSpace: "pre-wrap",
            lineHeight: 1.5,
            maxHeight: "180px",
            overflowY: "auto",
          }}
        >
          {output}
        </div>
      )}
    </div>
  );
};
