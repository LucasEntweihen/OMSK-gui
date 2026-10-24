import React from "react";
import {
  AgentsIcon,
  SparklesIcon,
} from "@/components/icons";
import { useAgentStore } from "@/store/useAgentStore";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const AgentsPage: React.FC = () => {
  const { agents, activeSpecialist, setActiveSpecialist } = useAgentStore();
  const { showNotification } = useAppStore();

  const handleSelectSpecialist = (agent: (typeof agents)[number]) => {
    setActiveSpecialist(agent);
    showNotification(`Especialista ativo alterado para ${agent.name}`, "success");
  };

  return (
    <div
      className="oms-agents-page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "24px 32px",
        overflowY: "auto",
        gap: "24px",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(38, 120, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--blue-400)",
            }}
          >
            <AgentsIcon size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text)" }}>
              Hub de Especialistas (Subagentes)
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Agentes autônomos e analistas de domínio mapeados em .omp-agents/agents.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Especialistas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "16px" }}>
        {agents.map((agent) => {
          const isActive = agent.id === activeSpecialist.id;

          return (
            <Card
              key={agent.id}
              variant={isActive ? "active" : "raised"}
              padding="md"
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Header do Card */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: `${agent.color}20`,
                      border: `1.5px solid ${agent.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: agent.color,
                      fontSize: "16px",
                      fontWeight: 800,
                    }}
                  >
                    {agent.name[0]}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "var(--text-md)", fontWeight: 800, color: "var(--color-text)" }}>
                        {agent.name}
                      </span>
                      {isActive && (
                        <Badge variant="primary" size="sm">
                          <SparklesIcon size={10} /> Ativo
                        </Badge>
                      )}
                    </div>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      {agent.title}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={
                    agent.category === "orchestrator"
                      ? "primary"
                      : agent.category === "specialist"
                      ? "success"
                      : agent.category === "critic"
                      ? "danger"
                      : "warning"
                  }
                  size="sm"
                >
                  {agent.category}
                </Badge>
              </div>

              {/* Catchphrase */}
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--ocean-950)",
                  border: "1px solid var(--color-border)",
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                  fontStyle: "italic",
                }}
              >
                "{agent.catchphrase}"
              </div>

              {/* System Prompt Preview */}
              <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                {agent.systemPrompt}
              </p>

              {/* Funções do Agente */}
              <div>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                  Funções Autorizadas:
                </span>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginTop: "5px" }}>
                  {agent.functions.map((fn, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "var(--radius-xs)",
                        backgroundColor: "var(--ocean-950)",
                        border: "1px solid var(--color-border)",
                        fontFamily: "var(--font-code)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {fn}
                    </span>
                  ))}
                </div>
              </div>

              {/* Botão de Adotar Persona */}
              <div style={{ marginTop: "auto", paddingTop: "8px" }}>
                <Button
                  variant={isActive ? "secondary" : "outline"}
                  size="sm"
                  style={{ width: "100%" }}
                  onClick={() => handleSelectSpecialist(agent)}
                  disabled={isActive}
                >
                  {isActive ? "Especialista em Comando" : "Adotar esta Persona"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
