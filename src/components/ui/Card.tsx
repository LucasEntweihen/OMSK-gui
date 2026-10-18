import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "raised" | "active" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  header,
  footer,
  className = "",
  style,
  ...props
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const paddingValues: Record<string, string> = {
    none: "0",
    sm: "12px",
    md: "16px",
    lg: "20px",
  };

  const bgByVariant = {
    default: "var(--ocean-900)",
    raised: "var(--ocean-850)",
    active: "var(--ocean-800)",
    interactive: isHovered ? "var(--ocean-800)" : "var(--ocean-850)",
  };

  const borderByVariant = {
    default: "var(--color-border)",
    raised: "var(--color-border)",
    active: "var(--blue-500)",
    interactive: isHovered ? "var(--blue-500)" : "var(--color-border)",
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`oms-card oms-card--${variant} ${className}`}
      style={{
        backgroundColor: bgByVariant[variant],
        border: `1px solid ${borderByVariant[variant]}`,
        borderRadius: "var(--radius-lg)",
        boxShadow: variant === "raised" ? "var(--shadow-panel)" : "none",
        transition: "all var(--duration-fast) var(--ease-out)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
      {...props}
    >
      {header && (
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {header}
        </div>
      )}

      <div style={{ padding: paddingValues[padding], flex: 1 }}>{children}</div>

      {footer && (
        <div
          style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--color-border)",
            backgroundColor: "rgba(2, 10, 22, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
