import React from "react";
import { FolderIcon, FileIcon } from "@/components/icons";
import type { IdentifiedFile } from "@/types";

export interface IdentifiedFilesCardProps {
  files: readonly IdentifiedFile[];
}

export const IdentifiedFilesCard: React.FC<IdentifiedFilesCardProps> = ({ files }) => {
  const actionBadges: Record<IdentifiedFile["action"], { label: string; color: string; bg: string }> = {
    novo: { label: "(novo)", color: "var(--state-success)", bg: "var(--state-success-bg)" },
    modificar: { label: "(modificar)", color: "var(--state-warning)", bg: "var(--state-warning-bg)" },
    adicionar: { label: "(adicionar)", color: "var(--blue-400)", bg: "rgba(38, 120, 255, 0.12)" },
    remover: { label: "(remover)", color: "var(--state-danger)", bg: "var(--state-danger-bg)" },
  };

  return (
    <div style={{ margin: "14px 0", display: "flex", flexDirection: "column", gap: "8px" }}>
      <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
        Arquivos principais identificados:
      </span>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          padding: "12px 16px",
          borderRadius: "var(--radius-lg)",
          backgroundColor: "rgba(6, 19, 38, 0.4)",
          border: "1px solid var(--color-border)",
          maxWidth: "680px",
        }}
      >
        {files.map((file, idx) => {
          const badge = actionBadges[file.action];
          const isDir = file.path.endsWith("/");

          return (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontFamily: "var(--font-code)",
                fontSize: "var(--text-xs)",
              }}
            >
              {isDir ? (
                <FolderIcon size={14} color="#F4B84A" />
              ) : (
                <FileIcon size={14} color="var(--blue-400)" />
              )}

              <span style={{ fontWeight: 600, color: isDir ? "#F4B84A" : "var(--color-text)" }}>
                {file.path}
              </span>

              <span style={{ color: "var(--color-text-muted)" }}>—</span>

              <span style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-ui)" }}>
                {file.description}
              </span>

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: badge.color,
                  padding: "1px 6px",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: badge.bg,
                }}
              >
                {badge.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
