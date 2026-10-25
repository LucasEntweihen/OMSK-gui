import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";
import { InspectorPanel } from "./InspectorPanel";
import { StatusBar } from "./StatusBar";
import { CommandPalette } from "./CommandPalette";
import { OnboardingModal } from "./OnboardingModal";
import { useAppStore } from "@/store/useAppStore";
import { CheckCircleIcon, AlertCircleIcon, CloseIcon } from "@/components/icons";

export const AppShell: React.FC = () => {
  const { notification, dismissNotification } = useAppStore();
  const location = useLocation();
  const isTeia = location.pathname.startsWith("/teia");

  return (
    <div
      className={`oms-app-shell ${isTeia ? "teia-environment" : ""}`}
      data-environment={isTeia ? "teia" : "ocean"}
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: isTeia ? "var(--teia-void)" : "var(--color-bg)",
        color: isTeia ? "var(--teia-text)" : "var(--color-text)",
        position: "relative",
        transition: "background-color var(--duration-normal) var(--ease-out)",
      }}
    >
      {/* 1. Barra Superior (TopBar) */}
      <TopBar />

      {/* 2. Área Central (Sidebar + Workspace + InspectorPanel) */}
      <div
        style={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <Sidebar />

        <main
          className={`oms-main-workspace ${isTeia ? "teia-surface-void" : ""}`}
          style={{
            flex: 1,
            backgroundColor: isTeia ? "var(--teia-void)" : "var(--ocean-950)",
            overflowY: isTeia ? "hidden" : "auto",
            overflowX: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </main>

        {/* O Inspector global do Oh My Shark não concorre com o Inspetor próprio da Mente em Teia */}
        {!isTeia && <InspectorPanel />}
      </div>

      {/* 3. Barra de Status Inferior (StatusBar) */}
      <StatusBar />

      {/* 4. Paleta de Comandos Global (⌘K) */}
      <CommandPalette />

      {/* 4b. Modal de Onboarding & Configuração Real na Primeira Inicialização */}
      <OnboardingModal />
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              bottom: "40px",
              right: "24px",
              zIndex: 3000,
              padding: "10px 16px",
              borderRadius: "var(--radius-md)",
              backgroundColor: isTeia ? "var(--teia-p2)" : "var(--ocean-850)",
              border: `1px solid ${
                notification.type === "success"
                  ? isTeia
                    ? "var(--teia-trust-verified)"
                    : "var(--state-success)"
                  : notification.type === "error"
                  ? isTeia
                    ? "var(--teia-trust-bad)"
                    : "var(--state-danger)"
                  : isTeia
                  ? "var(--teia-accent)"
                  : "var(--blue-500)"
              }`,
              boxShadow: isTeia ? "var(--teia-shadow-popover)" : "var(--shadow-dialog)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "var(--text-sm)",
              fontWeight: 600,
              color: isTeia ? "var(--teia-text-bright)" : "var(--color-text)",
            }}
          >
            {notification.type === "success" ? (
              <CheckCircleIcon size={16} color={isTeia ? "var(--teia-trust-verified)" : "var(--state-success)"} />
            ) : (
              <AlertCircleIcon size={16} color={isTeia ? "var(--teia-accent)" : "var(--blue-400)"} />
            )}
            <span>{notification.message}</span>
            <button
              onClick={dismissNotification}
              style={{
                background: "transparent",
                border: "none",
                color: isTeia ? "var(--teia-muted)" : "var(--color-text-muted)",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
              }}
            >
              <CloseIcon size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
