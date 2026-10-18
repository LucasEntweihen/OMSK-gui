import React from "react";
import type { PlanStep } from "@/types";

export interface PlanCardProps {
  steps: readonly PlanStep[];
}

export const PlanCard: React.FC<PlanCardProps> = ({ steps }) => {
  return (
    <div
      style={{
        margin: "12px 0",
        padding: "16px 20px",
        borderRadius: "var(--radius-lg)",
        backgroundColor: "var(--ocean-900)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-panel)",
        maxWidth: "680px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {steps.map((step) => (
          <div
            key={step.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              fontSize: "var(--text-sm)",
              lineHeight: 1.4,
              color: "var(--color-text)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-code)",
                fontWeight: 700,
                color: "var(--blue-400)",
                minWidth: "16px",
              }}
            >
              {step.id}.
            </span>
            <span
              style={{
                color: "var(--color-text)",
                fontWeight: 500,
              }}
            >
              {step.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
