import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  mono?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconRight,
      mono = false,
      disabled,
      className = "",
      style,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
        {label && (
          <label
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: error ? "var(--state-danger)" : "var(--color-text-secondary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {label}
            {hint && <span style={{ fontWeight: 400, color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>{hint}</span>}
          </label>
        )}

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            backgroundColor: "var(--ocean-900)",
            border: `1px solid ${error ? "var(--state-danger)" : isFocused ? "var(--color-focus)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-md)",
            boxShadow: isFocused ? "var(--glow-focus)" : "none",
            transition: "all var(--duration-fast) var(--ease-out)",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {icon && (
            <div
              style={{
                paddingLeft: "12px",
                display: "flex",
                alignItems: "center",
                color: "var(--color-text-muted)",
              }}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`oms-input ${className}`}
            style={{
              width: "100%",
              height: "38px",
              padding: icon ? "0 12px 0 8px" : "0 12px",
              backgroundColor: "transparent",
              color: "var(--color-text)",
              fontSize: "var(--text-md)",
              fontFamily: mono ? "var(--font-code)" : "var(--font-ui)",
              border: "none",
              outline: "none",
              ...style,
            }}
            {...props}
          />

          {iconRight && (
            <div
              style={{
                paddingRight: "12px",
                display: "flex",
                alignItems: "center",
                color: "var(--color-text-muted)",
              }}
            >
              {iconRight}
            </div>
          )}
        </div>

        {error && (
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--state-danger)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
  mono?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      hint,
      mono = false,
      disabled,
      className = "",
      style,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
        {label && (
          <label
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: error ? "var(--state-danger)" : "var(--color-text-secondary)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {label}
            {hint && <span style={{ fontWeight: 400, color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>{hint}</span>}
          </label>
        )}

        <div
          style={{
            position: "relative",
            backgroundColor: "var(--ocean-900)",
            border: `1px solid ${error ? "var(--state-danger)" : isFocused ? "var(--color-focus)" : "var(--color-border)"}`,
            borderRadius: "var(--radius-md)",
            boxShadow: isFocused ? "var(--glow-focus)" : "none",
            transition: "all var(--duration-fast) var(--ease-out)",
            opacity: disabled ? 0.5 : 1,
            padding: "8px 12px",
          }}
        >
          <textarea
            ref={ref}
            disabled={disabled}
            rows={rows}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`oms-textarea ${className}`}
            style={{
              width: "100%",
              backgroundColor: "transparent",
              color: "var(--color-text)",
              fontSize: "var(--text-md)",
              fontFamily: mono ? "var(--font-code)" : "var(--font-ui)",
              border: "none",
              outline: "none",
              resize: "vertical",
              lineHeight: 1.5,
              ...style,
            }}
            {...props}
          />
        </div>

        {error && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--state-danger)" }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
