import React from "react";
import { GitBranchIcon, SparklesIcon, BatteryIcon, ClockIcon, FolderIcon, WebNetIcon } from "@/components/icons";
import { useAppStore } from "@/store/useAppStore";
import { useContextStore } from "@/store/useContextStore";
import { useTeiaStore } from "@/store/useTeiaStore";
import { useLocation, useNavigate } from "react-router-dom";

export const StatusBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTeia = location.pathname.startsWith("/teia");

  const { gitBranch, activeModel, tokenUsage } = useAppStore();
  const { selectedScope } = useContextStore();
  const { vaultInfo } = useTeiaStore();
  const [currentTime, setCurrentTime] = React.useState<string>("14:32");

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const scopeShort = selectedScope.split("/").pop() || "oh-my-shark";

  return (
    <footer
      className={`oms-statusbar ${isTeia ? "teia-statusbar" : ""}`}
      style={{
        height: "var(--statusbar-height)",
        backgroundColor: isTeia ? "var(--teia-void)" : "var(--ocean-950)",
        borderTop: `1px solid ${isTeia ? "var(--teia-line)" : "var(--color-border)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 14px",
        fontSize: "var(--text-xs)",
        color: isTeia ? "var(--teia-muted)" : "var(--color-text-muted)",
        userSelect: "none",
        zIndex: 40,
        fontFamily: isTeia ? "var(--teia-font-mono)" : "var(--font-code)",
        transition: "background-color var(--duration-normal), border-color var(--duration-normal)",
      }}
    >
      {/* Esquerda: Projeto / Vault e Branch */}
      {isTeia ? (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--teia-text)" }}>
            <WebNetIcon size={12} color="var(--teia-accent)" />
            <span style={{ color: "var(--teia-accent-hover)", fontWeight: 600 }}>Mente em Teia</span>
            <span style={{ color: "var(--teia-faint)" }}>›</span>
            <span style={{ color: "var(--teia-muted)", fontFamily: "var(--teia-font-mono)" }}>
              {vaultInfo?.vaultPath || "~/Desktop/Mente em Teia"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--teia-trust-verified)" }}>
            <span style={{ fontSize: "9px" }}>●</span>
            <span style={{ fontSize: "11px" }}>Vault Físico Ativo</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)" }}>
            <FolderIcon size={12} color="#F4B84A" />
            <span>{scopeShort}</span>
            <span style={{ color: "var(--color-border)" }}>›</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-text-secondary)" }}>
            <GitBranchIcon size={12} color="var(--color-text-muted)" />
            <span>{gitBranch}</span>
          </div>
        </div>
      )}

      {/* Direita: Telemetria, Tokens, Relógio */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {isTeia ? (
          <span style={{ color: "var(--teia-muted)", fontFamily: "var(--teia-font-mono)", fontSize: "11px" }}>
            {vaultInfo?.totalNotes ?? 0} notas / {vaultInfo?.totalEdges ?? 0} conexões
          </span>
        ) : (
          <button
            onClick={() => navigate("/providers")}
            title="Alternar provedor e modelo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              color: "var(--color-text-secondary)",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: "var(--font-code)",
              fontSize: "var(--text-xs)",
            }}
          >
            <SparklesIcon size={12} color="var(--blue-400)" />
            <span>{activeModel.name}</span>
          </button>
        )}

        {/* Uso de Tokens / Recursos */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: isTeia ? "var(--teia-accent)" : "var(--color-text-secondary)" }}>
          <BatteryIcon size={12} color={isTeia ? "var(--teia-accent)" : "var(--blue-400)"} />
          <span>{tokenUsage.percent}%</span>
        </div>

        {/* Relógio em tempo real */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <ClockIcon size={12} color={isTeia ? "var(--teia-muted)" : "var(--color-text-muted)"} />
          <span>{currentTime}</span>
        </div>
      </div>
    </footer>
  );
};
