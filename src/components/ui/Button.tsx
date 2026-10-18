import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      iconRight,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
      sm: {
        height: "28px",
        padding: "0 10px",
        fontSize: "var(--text-sm)",
        gap: "6px",
        borderRadius: "var(--radius-sm)",
      },
      md: {
        height: "36px",
        padding: "0 14px",
        fontSize: "var(--text-md)",
        gap: "8px",
        borderRadius: "var(--radius-md)",
      },
      lg: {
        height: "42px",
        padding: "0 18px",
        fontSize: "var(--text-md)",
        gap: "10px",
        borderRadius: "var(--radius-md)",
      },
    };

    const variantStyles: Record<ButtonVariant, { base: React.CSSProperties; hoverBg: string }> = {
      primary: {
        base: {
          backgroundColor: "var(--blue-500)",
          color: "#FFFFFF",
          border: "1px solid var(--blue-500)",
          boxShadow: "0 1px 3px rgba(38, 120, 255, 0.3)",
        },
        hoverBg: "var(--blue-600)",
      },
      secondary: {
        base: {
          backgroundColor: "var(--ocean-850)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
        },
        hoverBg: "var(--ocean-800)",
      },
      outline: {
        base: {
          backgroundColor: "transparent",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
        },
        hoverBg: "var(--ocean-850)",
      },
      ghost: {
        base: {
          backgroundColor: "transparent",
          color: "var(--color-text-secondary)",
          border: "1px solid transparent",
        },
        hoverBg: "var(--ocean-850)",
      },
      destructive: {
        base: {
          backgroundColor: "var(--state-danger-bg)",
          color: "var(--state-danger)",
          border: "1px solid rgba(255, 99, 125, 0.3)",
        },
        hoverBg: "rgba(255, 99, 125, 0.25)",
      },
    };

    const [isHovered, setIsHovered] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);

    const activeVariant = variantStyles[variant];
    const isInteractive = !disabled && !loading;

    return (
      <button
        ref={ref}
        disabled={!isInteractive}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setIsPressed(false);
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className={`oms-btn oms-btn--${variant} ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 600,
          cursor: isInteractive ? "pointer" : "not-allowed",
          opacity: disabled ? 0.45 : 1,
          transition: "all var(--duration-fast) var(--ease-out)",
          transform: isPressed && isInteractive ? "scale(0.98)" : "scale(1)",
          ...sizeStyles[size],
          ...activeVariant.base,
          ...(isHovered && isInteractive ? { backgroundColor: activeVariant.hoverBg } : {}),
          ...style,
        }}
        {...props}
      >
        {loading ? (
          <span
            style={{
              width: "14px",
              height: "14px",
              border: "2px solid currentColor",
              borderRightColor: "transparent",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.8s linear infinite",
            }}
          />
        ) : (
          icon
        )}
        {children && <span>{children}</span>}
        {!loading && iconRight}
      </button>
    );
  }
);

Button.displayName = "Button";
