import React from "react";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  sublabel?: string;
  showPercent?: boolean;
  color?: string;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  showPercent = false,
  color = "var(--blue-500)",
  height = 6,
  className = "",
  style,
}) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`oms-progress ${className}`} style={{ width: "100%", ...style }}>
      {(label || showPercent || sublabel) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "6px",
            fontSize: "var(--text-sm)",
          }}
        >
          {label && <span style={{ fontWeight: 600, color: "var(--color-text-secondary)" }}>{label}</span>}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {sublabel && <span style={{ color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>{sublabel}</span>}
            {showPercent && <span style={{ color: "var(--blue-400)", fontWeight: 700, fontSize: "var(--text-xs)" }}>{Math.round(percent)}%</span>}
          </div>
        </div>
      )}

      <div
        style={{
          width: "100%",
          height: `${height}px`,
          backgroundColor: "var(--ocean-950)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "var(--radius-full)",
            transition: "width 0.4s var(--ease-out)",
            boxShadow: "0 0 8px rgba(38, 120, 255, 0.4)",
          }}
        />
      </div>
    </div>
  );
};
