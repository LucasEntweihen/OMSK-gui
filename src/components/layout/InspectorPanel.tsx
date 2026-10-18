import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AgentsIcon,
  TasksIcon,
  ToolsIcon,
  ContextIcon,
  ProvidersIcon,
  CheckCircleIcon,
  TerminalIcon,
  FolderIcon,
  FileIcon,
  CloseIcon,
} from "@/components/icons";
import { useAppStore } from "@/store/useAppStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useContextStore } from "@/store/useContextStore";
import { FolderPickerModal } from "./FolderPickerModal";

export const InspectorPanel: React.FC = () => {
  const navigate = useNavigate();
  const { inspectorOpen, toggleInspector, activeModel, activeAgentMode, setActiveAgentMode } = useAppStore();
  const { tasks, toggleTask } = useTaskStore();
  const { selectedScope, files } = useContextStore();
  const [isFolderModalOpen, setIsFolderModalOpen] = React.useState(false);

  if (!inspectorOpen) return null;

  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const totalCount = tasks.length;

  return (
    <>
      <aside
        className="oms-inspector"
        style={{
          width: "var(--inspector-width)",
          backgroundColor: "var(--ocean-950)",
          borderLeft: "1px solid var(--color-border)",
          height: "calc(100vh - var(--topbar-height) - var(--statusbar-height))",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          userSelect: "none",
          flexShrink: 0,
          zIndex: 20,
        }}
      >
        {/* Header com botão fechar */}
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Painel Contextual
          </span>
          <button
            onClick={toggleInspector}
            title="Fechar painel contextual"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <CloseIcon size={14} />
          </button>
        </div>

        <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* 1. Agente Card */}
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--ocean-900)",
              border: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(38, 120, 255, 0.15)",
                  border: "1px solid var(--blue-500)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--blue-400)",
                }}
              >
                <AgentsIcon size={15} />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
                  Agente
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--color-text-muted)" }}>
                  <span>Modo:</span>
                  <select
                    value={activeAgentMode}
                    onChange={(e) => setActiveAgentMode(e.target.value as "Autônomo" | "Supervisionado" | "Plano")}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      color: "var(--blue-400)",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontSize: "11px",
                      outline: "none",
                    }}
                  >
                    <option value="Autônomo" style={{ backgroundColor: "var(--ocean-900)" }}>Autônomo</option>
                    <option value="Supervisionado" style={{ backgroundColor: "var(--ocean-900)" }}>Supervisionado</option>
                    <option value="Plano" style={{ backgroundColor: "var(--ocean-900)" }}>Plano</option>
                  </select>
                </div>
              </div>
            </div>

            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: "var(--state-success)",
              }}
            />
          </div>

          {/* 2. Tarefas Card */}
          <div
            style={{
              padding: "14px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--ocean-900)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TasksIcon size={15} color="var(--blue-400)" />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
                  Tarefas
                </span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                {completedCount}/{totalCount} concluídas
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "2px" }}>
              {tasks.slice(0, 5).map((task) => {
                const isCompleted = task.status === "completed";
                const isInProgress = task.status === "in_progress";
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "var(--text-xs)",
                      color: isCompleted ? "var(--color-text-secondary)" : "var(--color-text)",
                      cursor: "pointer",
                      padding: "2px 0",
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon size={14} color="var(--state-success)" />
                    ) : isInProgress ? (
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          border: "2px solid var(--blue-500)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "var(--blue-400)" }} />
                      </span>
                    ) : (
                      <span
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          border: "1.5px solid var(--color-border)",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span
                      style={{
                        textDecoration: isCompleted ? "line-through" : "none",
                        opacity: isCompleted ? 0.75 : 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {task.title}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => navigate("/tasks")}
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "var(--blue-400)",
                background: "transparent",
                border: "none",
                padding: 0,
                textAlign: "left",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Ver detalhes →
            </button>
          </div>

          {/* 3. Ferramentas Card */}
          <div
            style={{
              padding: "14px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--ocean-900)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ToolsIcon size={15} color="var(--blue-400)" />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
                  Ferramentas
                </span>
              </div>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "var(--ocean-800)",
                  color: "var(--color-text-secondary)",
                }}
              >
                1
              </span>
            </div>

            <div
              onClick={() => navigate("/tools")}
              style={{
                padding: "8px 10px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--ocean-950)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TerminalIcon size={14} color="var(--state-success)" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)" }}>
                    bash
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "var(--font-code)" }}>
                    ls -la src/
                  </span>
                </div>
              </div>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                2.4s
              </span>
            </div>
          </div>

          {/* 4. Contexto Card com Seletor Direto */}
          <div
            style={{
              padding: "14px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--ocean-900)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ContextIcon size={15} color="var(--blue-400)" />
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
                  Contexto
                </span>
              </div>

              <button
                onClick={() => setIsFolderModalOpen(true)}
                title="Trocar pasta de trabalho"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--blue-400)",
                  fontSize: "11px",
                  cursor: "pointer",
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Alterar
              </button>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Pasta Conectada:</span>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text)", fontFamily: "var(--font-code)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selectedScope}
              </div>
            </div>

            <div>
              <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Arquivos no Escopo:</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                {files.slice(0, 3).map((f) => (
                  <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--color-text-secondary)", fontFamily: "var(--font-code)" }}>
                    {f.type === "directory" ? <FolderIcon size={12} color="#F4B84A" /> : <FileIcon size={12} color="var(--blue-400)" />}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate("/context")}
              style={{
                fontSize: "12px",
                color: "var(--blue-400)",
                background: "transparent",
                border: "none",
                padding: 0,
                textAlign: "left",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Ver tudo →
            </button>
          </div>

          {/* 5. Providers Card */}
          <div
            style={{
              padding: "14px",
              borderRadius: "var(--radius-lg)",
              backgroundColor: "var(--ocean-900)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ProvidersIcon size={15} color="var(--blue-400)" />
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
                Provedor Ativo
              </span>
            </div>

            <div
              onClick={() => navigate("/providers")}
              style={{
                padding: "10px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--ocean-950)",
                border: "1px solid var(--color-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "var(--radius-xs)",
                    backgroundColor: "rgba(38, 120, 255, 0.15)",
                    color: "var(--blue-400)",
                    fontSize: "11px",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  M
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text)" }}>
                    {activeModel.name}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                    {activeModel.provider}
                  </span>
                </div>
              </div>

              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "var(--state-success)",
                }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Modal de Seleção de Pasta */}
      <FolderPickerModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />
    </>
  );
};
