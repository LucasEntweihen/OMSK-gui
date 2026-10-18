import React from "react";

export type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";
export type BadgeSize = "sm" | "md";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "sm",
  dot = false,
  className = "",
  style,
  onClick,
}) => {
  const variantStyles: Record<BadgeVariant, { bg: string; color: string; border: string; dotColor: string }> = {
    default: {
      bg: "var(--ocean-800)",
      color: "var(--color-text-secondary)",
      border: "var(--color-border)",
      dotColor: "var(--color-text-muted)",
    },
    primary: {
      bg: "rgba(38, 120, 255, 0.15)",
      color: "var(--blue-400)",
      border: "rgba(38, 120, 255, 0.35)",
      dotColor: "var(--blue-500)",
    },
    success: {
      bg: "var(--state-success-bg)",
      color: "var(--state-success)",
      border: "rgba(53, 211, 154, 0.3)",
      dotColor: "var(--state-success)",
    },
    warning: {
      bg: "var(--state-warning-bg)",
      color: "var(--state-warning)",
      border: "rgba(244, 184, 74, 0.3)",
      dotColor: "var(--state-warning)",
    },
    danger: {
      bg: "var(--state-danger-bg)",
      color: "var(--state-danger)",
      border: "rgba(255, 99, 125, 0.3)",
      dotColor: "var(--state-danger)",
    },
    info: {
      bg: "var(--state-info-bg)",
      color: "var(--state-info)",
      border: "rgba(72, 165, 255, 0.3)",
      dotColor: "var(--state-info)",
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <span
      className={`oms-badge ${className}`}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: size === "sm" ? "1px 7px" : "3px 10px",
        fontSize: size === "sm" ? "var(--text-xs)" : "var(--text-sm)",
        fontWeight: 600,
        fontFamily: "var(--font-ui)",
        borderRadius: "var(--radius-sm)",
        backgroundColor: currentVariant.bg,
        color: currentVariant.color,
        border: `1px solid ${currentVariant.border}`,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {dot && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: currentVariant.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
};
