import React from "react";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <label
      style={{
        display: "flex",
        alignItems: description ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: "12px",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        userSelect: "none",
      }}
    >
      {(label || description) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {label && <span style={{ fontSize: "var(--text-md)", fontWeight: 600, color: "var(--color-text)" }}>{label}</span>}
          {description && <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>{description}</span>}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: "42px",
          height: "22px",
          borderRadius: "var(--radius-full)",
          backgroundColor: checked ? "var(--blue-500)" : "var(--ocean-800)",
          border: `1px solid ${checked ? "var(--blue-400)" : "var(--color-border)"}`,
          position: "relative",
          padding: 0,
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "all var(--duration-fast) var(--ease-out)",
          flexShrink: 0,
          boxShadow: checked ? "0 0 10px rgba(38, 120, 255, 0.3)" : "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: checked ? "22px" : "2px",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#FFFFFF",
            transition: "left var(--duration-fast) var(--ease-out)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          }}
        />
      </button>
    </label>
  );
};
