import React from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: readonly TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: "pill" | "underline";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "pill",
  className = "",
}) => {
  return (
    <div
      className={`oms-tabs oms-tabs--${variant} ${className}`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: variant === "pill" ? "6px" : "16px",
        borderBottom: variant === "underline" ? "1px solid var(--color-border)" : "none",
        padding: variant === "pill" ? "4px" : "0 0 2px 0",
        backgroundColor: variant === "pill" ? "var(--ocean-950)" : "transparent",
        borderRadius: variant === "pill" ? "var(--radius-md)" : "0",
        border: variant === "pill" ? "1px solid var(--color-border)" : "none",
        width: "fit-content",
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: variant === "pill" ? "6px 12px" : "8px 4px",
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? 600 : 500,
              color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
              backgroundColor:
                variant === "pill" && isActive ? "var(--blue-selected)" : "transparent",
              border: "none",
              borderBottom:
                variant === "underline" && isActive
                  ? "2px solid var(--blue-500)"
                  : "2px solid transparent",
              borderRadius: variant === "pill" ? "var(--radius-sm)" : "0",
              cursor: "pointer",
              transition: "all var(--duration-fast) var(--ease-out)",
              whiteSpace: "nowrap",
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                style={{
                  fontSize: "var(--text-xs)",
                  padding: "0 6px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: isActive ? "var(--blue-500)" : "var(--ocean-800)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
