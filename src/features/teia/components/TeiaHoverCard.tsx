import React from "react";
import type { TeiaNode } from "@/services/teiaEngine";

export interface TeiaHoverCardProps {
  node: TeiaNode | null;
  x: number;
  y: number;
  visible: boolean;
}

export const TeiaHoverCard: React.FC<TeiaHoverCardProps> = ({ node, x, y, visible }) => {
  if (!visible || !node) return null;

  const trustBadge = {
    USER_VERIFIED: { glyph: "●", text: "verificado", color: "var(--teia-trust-verified)" },
    SOURCE_VERIFIED: { glyph: "●", text: "fonte verificada", color: "var(--teia-trust-verified)" },
    AI_GENERATED: { glyph: "✦", text: "gerado por IA", color: "var(--teia-trust-ai)" },
    AI_INFERRED: { glyph: "✦", text: "inferido por IA", color: "var(--teia-trust-ai)" },
    UNVERIFIED: { glyph: "◌", text: "não verificado", color: "var(--teia-trust-warn)" },
    CONFLICTING: { glyph: "!", text: "conflitante", color: "var(--teia-trust-bad)" },
  }[node.trust] || { glyph: "●", text: "nota", color: "var(--teia-accent)" };

  return (
    <div
      className="teia-hover-card teia-glass"
      style={{
        position: "fixed",
        left: `${Math.min(x, window.innerWidth - 330)}px`,
        top: `${Math.min(y + 8, window.innerHeight - 230)}px`,
        zIndex: 5000,
        width: "310px",
        backgroundColor: "rgba(16, 18, 26, 0.92)",
        border: "1px solid var(--teia-accent-border)",
        borderRadius: "var(--teia-r-md)",
        boxShadow: "var(--teia-shadow-popover)",
        padding: "12px 14px",
        pointerEvents: "none",
        fontFamily: "var(--teia-font-ui)",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        animation: "fade-in 100ms ease-out",
        backdropFilter: "blur(14px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--teia-text-bright)" }}>
          {node.title}
        </span>
        <span style={{ fontSize: "10px", color: "var(--teia-accent-hover)", fontFamily: "var(--teia-font-mono)", textTransform: "uppercase", fontWeight: 600 }}>
          {node.type}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
        <span style={{ color: trustBadge.color, fontWeight: 700 }}>{trustBadge.glyph}</span>
        <span style={{ color: "var(--teia-muted)" }}>{trustBadge.text}</span>
        {node.degree !== undefined && (
          <span style={{ color: "var(--teia-faint)", marginLeft: "auto", fontFamily: "var(--teia-font-mono)" }}>
            {node.degree} conexões
          </span>
        )}
      </div>

      <p
        style={{
          margin: "4px 0 0",
          fontSize: "12px",
          color: "var(--teia-text)",
          lineHeight: 1.45,
          maxHeight: "72px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
        }}
      >
        {node.body ? node.body.slice(0, 180) : "Nota pendente sem corpo de texto."}
      </p>

      {node.tags && node.tags.length > 0 && (
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
          {node.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="teia-tag-pill">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
