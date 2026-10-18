import React from "react";
import {
  SharkFinIcon,
  FolderIcon,
  PanelRightToggleIcon,
  SettingsIcon,
  BatteryIcon,
  SearchIcon,
  SidebarToggleIcon,
  WebNetIcon,
} from "@/components/icons";
import { useAppStore } from "@/store/useAppStore";
import { useLocation, useNavigate } from "react-router-dom";
import { FolderPickerModal } from "./FolderPickerModal";

export const TopBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isTeia = location.pathname.startsWith("/teia");

  const {
    activeScope,
    inspectorOpen,
    toggleInspector,
    sidebarCollapsed,
    toggleSidebar,
    setCommandPaletteOpen,
    tokenUsage,
  } = useAppStore();

  const [isFolderModalOpen, setIsFolderModalOpen] = React.useState(false);

  return (
    <>
      <header
        className={`oms-topbar ${isTeia ? "teia-topbar" : ""}`}
        style={{
          height: "var(--topbar-height)",
          backgroundColor: isTeia ? "var(--teia-void)" : "var(--ocean-950)",
          borderBottom: `1px solid ${isTeia ? "var(--teia-line)" : "var(--color-border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          userSelect: "none",
          zIndex: 50,
          transition: "background-color var(--duration-normal), border-color var(--duration-normal)",
        }}
      >
        {/* Esquerda: macOS Traffic Lights + Seletor de Pasta do Projeto */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* macOS Traffic Lights */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "11px",
                height: "11px",
                borderRadius: "50%",
                backgroundColor: "#FF5F56",
                opacity: 0.9,
              }}
            />
            <span
              style={{
                width: "11px",
                height: "11px",
                borderRadius: "50%",
                backgroundColor: "#FFBD2E",
                opacity: 0.9,
              }}
            />
            <span
              style={{
                width: "11px",
                height: "11px",
                borderRadius: "50%",
                backgroundColor: "#27C93F",
                opacity: 0.9,
              }}
            />
          </div>

          {/* Toggle sidebar */}
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expandir barra lateral" : "Recolher barra lateral"}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "26px",
              height: "26px",
              borderRadius: "var(--radius-sm)",
              color: sidebarCollapsed
                ? isTeia
                  ? "var(--teia-accent)"
                  : "var(--blue-400)"
                : isTeia
                ? "var(--teia-muted)"
                : "var(--color-text-muted)",
              backgroundColor: sidebarCollapsed
                ? isTeia
                  ? "var(--teia-p2)"
                  : "var(--ocean-850)"
                : "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all var(--duration-fast)",
            }}
          >
            <SidebarToggleIcon size={14} />
          </button>

          {/* Breadcrumb Path Interativo com o Seletor de Pastas */}
          <button
            onClick={() => setIsFolderModalOpen(true)}
            title="Clique para selecionar a pasta local no seu computador"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-code)",
              color: isTeia ? "var(--teia-text)" : "var(--color-text-secondary)",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: isTeia ? "var(--teia-p1)" : "var(--ocean-900)",
              border: `1px solid ${isTeia ? "var(--teia-line)" : "var(--color-border)"}`,
              cursor: "pointer",
              transition: "all var(--duration-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = isTeia ? "var(--teia-accent)" : "var(--blue-500)";
              e.currentTarget.style.color = isTeia ? "var(--teia-text-bright)" : "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isTeia ? "var(--teia-line)" : "var(--color-border)";
              e.currentTarget.style.color = isTeia ? "var(--teia-text)" : "var(--color-text-secondary)";
            }}
          >
            <FolderIcon size={13} color="#F4B84A" />
            <span style={{ fontWeight: 600 }}>{activeScope}</span>
            <span style={{ color: isTeia ? "var(--teia-muted)" : "var(--color-text-muted)", fontSize: "10px", marginLeft: "2px" }}>▾</span>
          </button>
        </div>

        {/* Centro: Logo Oh My Shark e Título (Adaptado para Teia) */}
        {isTeia ? (
          <div
            onClick={() => navigate("/teia")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--teia-text-bright)",
              fontWeight: 700,
              fontSize: "var(--text-sm)",
              cursor: "pointer",
            }}
          >
            <WebNetIcon size={16} color="var(--teia-accent)" />
            <span>Mente em Teia</span>
            <span
              style={{
                fontSize: "9px",
                padding: "2px 7px",
                borderRadius: "var(--teia-r-full)",
                backgroundColor: "var(--teia-accent-subtle)",
                border: "1px solid var(--teia-accent-border)",
                color: "var(--teia-accent-hover)",
                fontFamily: "var(--teia-font-mono)",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              NEURAL OBSIDIAN
            </span>
          </div>
        ) : (
          <div
            onClick={() => navigate("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "var(--color-text)",
              fontWeight: 700,
              fontSize: "var(--text-sm)",
              cursor: "pointer",
            }}
          >
            <SharkFinIcon size={16} color="var(--blue-400)" />
            <span>Oh My Shark</span>
          </div>
        )}

        {/* Direita: Busca, Indicadores e Controles */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Botão de Busca limpo sem badge ⌘K */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            title="Abrir busca e comandos"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: isTeia ? "var(--teia-p1)" : "var(--ocean-900)",
              border: `1px solid ${isTeia ? "var(--teia-line)" : "var(--color-border)"}`,
              fontSize: "var(--text-xs)",
              color: isTeia ? "var(--teia-muted)" : "var(--color-text-muted)",
              cursor: "pointer",
              transition: "all var(--duration-fast)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = isTeia ? "var(--teia-accent)" : "var(--blue-500)";
              e.currentTarget.style.color = isTeia ? "var(--teia-text-bright)" : "var(--color-text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = isTeia ? "var(--teia-line)" : "var(--color-border)";
              e.currentTarget.style.color = isTeia ? "var(--teia-muted)" : "var(--color-text-muted)";
            }}
          >
            <SearchIcon size={12} />
            <span>Buscar...</span>
          </button>

          {/* Medidor de Recursos */}
          <div
            title={`Uso de recursos: ${tokenUsage.percent}%`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: isTeia ? "var(--teia-p1)" : "var(--ocean-900)",
              border: `1px solid ${isTeia ? "var(--teia-line)" : "var(--color-border)"}`,
              fontSize: "var(--text-xs)",
              fontWeight: 600,
              color: isTeia ? "var(--teia-accent)" : "var(--blue-400)",
            }}
          >
            <BatteryIcon size={12} color={isTeia ? "var(--teia-accent)" : "var(--blue-400)"} />
            <span>{tokenUsage.percent}%</span>
          </div>

          {/* Alternar Painel Lateral (Apenas exibido quando fora da Teia para não conflitar) */}
          {!isTeia && (
            <button
              onClick={toggleInspector}
              title={inspectorOpen ? "Ocultar painel lateral" : "Exibir painel lateral"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                color: inspectorOpen ? "var(--blue-400)" : "var(--color-text-muted)",
                backgroundColor: inspectorOpen ? "var(--ocean-850)" : "transparent",
                border: `1px solid ${inspectorOpen ? "rgba(38, 120, 255, 0.3)" : "transparent"}`,
                cursor: "pointer",
                transition: "all var(--duration-fast)",
              }}
            >
              <PanelRightToggleIcon size={14} />
            </button>
          )}

          {/* Configurações */}
          <button
            onClick={() => navigate("/settings")}
            title="Configurações do sistema"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "28px",
              height: "28px",
              borderRadius: "var(--radius-sm)",
              color: isTeia ? "var(--teia-muted)" : "var(--color-text-muted)",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all var(--duration-fast)",
            }}
          >
            <SettingsIcon size={14} />
          </button>
        </div>
      </header>

      {/* Modal de Seleção de Pasta Local */}
      <FolderPickerModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />
    </>
  );
};
