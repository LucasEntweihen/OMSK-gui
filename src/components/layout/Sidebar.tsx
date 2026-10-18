import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  SharkFinIcon,
  ChatIcon,
  WebNetIcon,
  TasksIcon,
  ContextIcon,
  ToolsIcon,
  ProvidersIcon,
  SettingsIcon,
  SystemPromptIcon,
  SpecificationsIcon,
  AgentsIcon,
  AnalyticsIcon,
} from "@/components/icons";
import { useAppStore } from "@/store/useAppStore";
import { useTaskStore } from "@/store/useTaskStore";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface NavEntry {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, activeModel, tokenUsage } = useAppStore();
  const { tasks } = useTaskStore();

  const isTeia = location.pathname.startsWith("/teia");
  const pendingTasksCount = tasks.filter((t) => t.status === "in_progress" || t.status === "pending").length;

  const navEntries: readonly NavEntry[] = [
    { id: "chat", label: "Chat", path: "/", icon: <ChatIcon size={16} /> },
    { id: "teia", label: "Mente em Teia", path: "/teia", icon: <WebNetIcon size={16} /> },
    { id: "tasks", label: "Tarefas", path: "/tasks", icon: <TasksIcon size={16} />, badge: pendingTasksCount },
    { id: "context", label: "Contexto", path: "/context", icon: <ContextIcon size={16} /> },
    { id: "tools", label: "Ferramentas", path: "/tools", icon: <ToolsIcon size={16} /> },
    { id: "providers", label: "Provedores", path: "/providers", icon: <ProvidersIcon size={16} /> },
    { id: "settings", label: "Configurações", path: "/settings", icon: <SettingsIcon size={16} /> },
    { id: "system-prompt", label: "Prompt", path: "/system-prompt", icon: <SystemPromptIcon size={16} /> },
    { id: "specifications", label: "Especificações", path: "/specifications", icon: <SpecificationsIcon size={16} /> },
    { id: "agents", label: "Agentes", path: "/agents", icon: <AgentsIcon size={16} /> },
    { id: "analytics", label: "Telemetria", path: "/analytics", icon: <AnalyticsIcon size={16} /> },
  ];

  const isCurrent = (path: string) => {
    if (path === "/") return location.pathname === "/" || location.pathname === "/chat";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={`oms-sidebar ${isTeia ? "teia-sidebar" : ""}`}
      style={{
        width: sidebarCollapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)",
        backgroundColor: isTeia ? "var(--teia-void)" : "var(--ocean-950)",
        borderRight: `1px solid ${isTeia ? "var(--teia-line)" : "var(--color-border)"}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "calc(100vh - var(--topbar-height) - var(--statusbar-height))",
        transition: "all var(--duration-normal) var(--ease-out)",
        overflowX: "hidden",
        overflowY: "auto",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {/* Top Section: Brand + Clean Navigation */}
      <div>
        {/* Brand Header */}
        <div
          onClick={() => navigate("/")}
          style={{
            padding: sidebarCollapsed ? "16px 0" : "18px 20px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            gap: "12px",
            borderBottom: `1px solid ${isTeia ? "var(--teia-line)" : "rgba(23, 51, 83, 0.4)"}`,
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "var(--radius-md)",
              backgroundColor: isTeia ? "var(--teia-accent-subtle)" : "rgba(38, 120, 255, 0.12)",
              border: `1px solid ${isTeia ? "var(--teia-accent-border)" : "rgba(38, 120, 255, 0.3)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all var(--duration-fast)",
            }}
          >
            <SharkFinIcon size={18} color={isTeia ? "var(--teia-accent-hover)" : "var(--blue-400)"} />
          </div>

          {!sidebarCollapsed && (
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "14px",
                  color: isTeia ? "var(--teia-text-bright)" : "var(--color-text)",
                  letterSpacing: "-0.2px",
                }}
              >
                Oh My Shark
              </span>
              <span
                style={{
                  fontSize: "11px",
                  color: isTeia ? "var(--teia-muted)" : "var(--color-text-muted)",
                }}
              >
                {isTeia ? "Neural Obsidian Mode" : "Deep Ocean Workspace"}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: sidebarCollapsed ? "10px 6px" : "12px 10px", display: "flex", flexDirection: "column", gap: "2px" }}>
          {navEntries.map((item) => {
            const active = isCurrent(item.path);
            const isItemTeia = item.id === "teia";

            // Estilos contextuais para o item Mente em Teia e itens gerais
            let bg = "transparent";
            let color = isTeia ? "var(--teia-text)" : "var(--color-text-secondary)";
            let border = "1px solid transparent";

            if (active) {
              if (isItemTeia) {
                bg = "rgba(122, 130, 230, 0.16)";
                color = "var(--teia-text-bright)";
                border = "1px solid var(--teia-accent-border)";
              } else {
                bg = "var(--blue-selected)";
                color = "var(--color-text)";
                border = "1px solid rgba(38, 120, 255, 0.3)";
              }
            }

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                title={sidebarCollapsed ? item.label : undefined}
                style={{
                  height: "36px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: sidebarCollapsed ? "center" : "space-between",
                  padding: sidebarCollapsed ? "0" : "0 12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: bg,
                  color,
                  border,
                  fontSize: "var(--text-sm)",
                  fontWeight: active ? 600 : 500,
                  transition: "all var(--duration-fast)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    if (isItemTeia) {
                      e.currentTarget.style.backgroundColor = "rgba(122, 130, 230, 0.10)";
                      e.currentTarget.style.color = "var(--teia-text-bright)";
                    } else {
                      e.currentTarget.style.backgroundColor = isTeia ? "var(--teia-p2)" : "var(--ocean-850)";
                      e.currentTarget.style.color = isTeia ? "var(--teia-text-bright)" : "var(--color-text)";
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = color;
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      color: active
                        ? isItemTeia
                          ? "var(--teia-accent)"
                          : "var(--blue-400)"
                        : isItemTeia
                        ? "var(--teia-accent-hover)"
                        : isTeia
                        ? "var(--teia-muted)"
                        : "var(--color-text-muted)",
                      display: "flex",
                    }}
                  >
                    {item.icon}
                  </span>
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>

                {!sidebarCollapsed && (
                  <>
                    {isItemTeia && (
                      <span
                        style={{
                          fontSize: "9px",
                          padding: "1px 6px",
                          borderRadius: "var(--teia-r-full)",
                          backgroundColor: active ? "var(--teia-accent)" : "rgba(122, 130, 230, 0.12)",
                          color: active ? "#FFFFFF" : "var(--teia-accent-hover)",
                          fontWeight: 700,
                          letterSpacing: "0.5px",
                        }}
                      >
                        NEURAL
                      </span>
                    )}

                    {!isItemTeia && item.badge !== undefined && item.badge !== 0 && (
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "1px 6px",
                          borderRadius: "var(--radius-full)",
                          backgroundColor: active ? "var(--blue-500)" : isTeia ? "var(--teia-p3)" : "var(--ocean-800)",
                          color: "#FFFFFF",
                          fontWeight: 700,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Model & Session info */}
      {!sidebarCollapsed ? (
        <div
          style={{
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            borderTop: `1px solid ${isTeia ? "var(--teia-line)" : "rgba(23, 51, 83, 0.4)"}`,
          }}
        >
          {/* Model Card */}
          <div
            onClick={() => navigate("/providers")}
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: isTeia ? "var(--teia-p1)" : "var(--ocean-900)",
              border: `1px solid ${isTeia ? "var(--teia-line)" : "var(--color-border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "border-color var(--duration-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = isTeia ? "var(--teia-accent)" : "var(--blue-500)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = isTeia ? "var(--teia-line)" : "var(--color-border)")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "var(--radius-xs)",
                  backgroundColor: isTeia ? "var(--teia-accent-subtle)" : "rgba(38, 120, 255, 0.15)",
                  color: isTeia ? "var(--teia-accent-hover)" : "var(--blue-400)",
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
                <span style={{ fontSize: "12px", fontWeight: 600, color: isTeia ? "var(--teia-text-bright)" : "var(--color-text)" }}>
                  {activeModel.name}
                </span>
                <span style={{ fontSize: "10px", color: isTeia ? "var(--teia-muted)" : "var(--color-text-muted)" }}>
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

          {/* Session Token Gauge */}
          <div
            style={{
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: isTeia ? "var(--teia-p1)" : "var(--ocean-900)",
              border: `1px solid ${isTeia ? "var(--teia-line)" : "var(--color-border)"}`,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
              <span style={{ color: isTeia ? "var(--teia-muted)" : "var(--color-text-secondary)", fontWeight: 600 }}>Sessão Ativa</span>
              <span style={{ color: isTeia ? "var(--teia-text)" : "var(--color-text-muted)", fontFamily: "var(--font-code)" }}>
                {tokenUsage.percent}%
              </span>
            </div>
            <ProgressBar value={tokenUsage.percent} height={4} color={isTeia ? "var(--teia-accent)" : "var(--blue-500)"} />
          </div>
        </div>
      ) : (
        <div style={{ padding: "12px 0", display: "flex", justifyContent: "center" }}>
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: "var(--state-success)",
            }}
          />
        </div>
      )}
    </aside>
  );
};
