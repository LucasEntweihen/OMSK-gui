import React from "react";
import {
  TasksIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
} from "@/components/icons";
import { useTaskStore } from "@/store/useTaskStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import type { TaskPriority } from "@/types";

export const TasksPage: React.FC = () => {
  const { tasks, statusFilter, setStatusFilter, toggleTask, addTask, deleteTask } = useTaskStore();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newPriority, setNewPriority] = React.useState<TaskPriority>("medium");
  const [newDesc, setNewDesc] = React.useState("");

  const filteredTasks = tasks.filter((t) => (statusFilter === "all" ? true : t.status === statusFilter));

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "completed").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    pending: tasks.filter((t) => t.status === "pending").length,
  };

  const handleCreateTask = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;
    addTask(newTitle.trim(), newPriority, newDesc.trim());
    setNewTitle("");
    setNewDesc("");
    setIsModalOpen(false);
  };

  return (
    <div
      className="oms-tasks-page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "24px 32px",
        overflowY: "auto",
        gap: "24px",
      }}
    >
      {/* Header & Ações */}
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
            <TasksIcon size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text)" }}>
              Tarefas & Execuções
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Acompanhamento de etapas do plano, checklist e logs de execução.
            </p>
          </div>
        </div>

        <Button variant="primary" icon={<PlusIcon size={14} />} onClick={() => setIsModalOpen(true)}>
          Nova Tarefa
        </Button>
      </div>

      {/* Metrics Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px",
        }}
      >
        <Card padding="md" variant="raised">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: 600 }}>Total de Tarefas</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>{stats.total}</div>
        </Card>
        <Card padding="md" variant="raised">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--state-success)", fontWeight: 600 }}>Concluídas</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--state-success)", marginTop: "4px" }}>{stats.completed}</div>
        </Card>
        <Card padding="md" variant="raised">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--blue-400)", fontWeight: 600 }}>Em Andamento</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--blue-400)", marginTop: "4px" }}>{stats.inProgress}</div>
        </Card>
        <Card padding="md" variant="raised">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--state-warning)", fontWeight: 600 }}>Pendentes</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--state-warning)", marginTop: "4px" }}>{stats.pending}</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px" }}>
        {(["all", "in_progress", "completed", "pending"] as const).map((filter) => {
          const labels: Record<string, string> = {
            all: "Todas as Tarefas",
            in_progress: "Em Execução",
            completed: "Concluídas",
            pending: "Pendentes",
          };
          const isActive = statusFilter === filter;
          return (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: isActive ? "var(--blue-selected)" : "transparent",
                color: isActive ? "var(--color-text)" : "var(--color-text-muted)",
                border: `1px solid ${isActive ? "rgba(38, 120, 255, 0.4)" : "transparent"}`,
                fontSize: "var(--text-sm)",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
                transition: "all var(--duration-fast)",
              }}
            >
              {labels[filter]}
            </button>
          );
        })}
      </div>

      {/* Task Cards List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filteredTasks.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--color-text-muted)" }}>
            Nenhuma tarefa encontrada neste filtro.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === "completed";
            const isInProg = task.status === "in_progress";

            return (
              <Card key={task.id} variant={isInProg ? "active" : "raised"} padding="md">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
                    {/* Checkbox circle */}
                    <button
                      onClick={() => toggleTask(task.id)}
                      title={isDone ? "Marcar como pendente" : "Marcar como concluída"}
                      style={{
                        marginTop: "2px",
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                      }}
                    >
                      {isDone ? (
                        <CheckCircleIcon size={20} color="var(--state-success)" />
                      ) : isInProg ? (
                        <ClockIcon size={20} color="var(--blue-400)" />
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: "1.5px solid var(--color-border)",
                          }}
                        />
                      )}
                    </button>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span
                          style={{
                            fontSize: "var(--text-md)",
                            fontWeight: 700,
                            color: "var(--color-text)",
                            textDecoration: isDone ? "line-through" : "none",
                            opacity: isDone ? 0.7 : 1,
                          }}
                        >
                          {task.title}
                        </span>

                        <Badge
                          variant={
                            task.priority === "high"
                              ? "danger"
                              : task.priority === "medium"
                              ? "warning"
                              : "default"
                          }
                          size="sm"
                        >
                          Prioridade {task.priority}
                        </Badge>

                        {task.duration && (
                          <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-code)" }}>
                            <ClockIcon size={11} color="var(--color-text-muted)" />
                            <span>{task.duration}</span>
                          </div>
                        )}
                      </div>

                      {task.description && (
                        <p style={{ margin: 0, fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                          {task.description}
                        </p>
                      )}

                      {/* Steps if any */}
                      {task.steps && task.steps.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px" }}>
                          {task.steps.map((st, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                              <span style={{ color: st.done ? "var(--state-success)" : "var(--color-text-muted)", fontSize: "10px" }}>
                                {st.done ? "●" : "○"}
                              </span>
                              <span style={{ textDecoration: st.done ? "line-through" : "none" }}>{st.title}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Progress Bar */}
                      {task.progress !== undefined && (
                        <div style={{ marginTop: "8px", maxWidth: "420px" }}>
                          <ProgressBar value={task.progress} height={4} showPercent />
                        </div>
                      )}

                      {/* Logs snapshot */}
                      {task.logs && task.logs.length > 0 && (
                        <div
                          style={{
                            marginTop: "8px",
                            padding: "6px 10px",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--ocean-950)",
                            fontFamily: "var(--font-code)",
                            fontSize: "11px",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {task.logs.slice(-2).map((l, idx) => (
                            <div key={idx}>{l}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    title="Excluir tarefa"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--color-text-muted)",
                      cursor: "pointer",
                      padding: "4px",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--state-danger)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Criação de Tarefa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Nova Tarefa"
        subtitle="Adicione uma nova tarefa ao backlog do agente com prioridade e metas."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreateTask}>
              Adicionar Tarefa
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Título da Tarefa"
            placeholder="Ex: Refatorar middleware de autenticação..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text-secondary)" }}>
              Prioridade
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
              style={{
                height: "38px",
                padding: "0 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--ocean-900)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                fontSize: "var(--text-md)",
                outline: "none",
              }}
            >
              <option value="high">Alta (High)</option>
              <option value="medium">Média (Medium)</option>
              <option value="low">Baixa (Low)</option>
            </select>
          </div>

          <Textarea
            label="Descrição e Critérios de Aceite"
            placeholder="Detalhes opcionais para guiar o agente..."
            rows={3}
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
          />
        </form>
      </Modal>
    </div>
  );
};
