import React from "react";
import {
  SettingsIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  RefreshIcon,
  TrashIcon,
} from "@/components/icons";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Toggle } from "@/components/ui/Toggle";
import type { ToolPermission } from "@/types";

export const SettingsPage: React.FC = () => {
  const { settings, updateSetting, saveSettings, resetDefaults, isSaved, hasUnsavedChanges } = useSettingsStore();
  const { showNotification } = useAppStore();

  const handleSave = () => {
    saveSettings();
    showNotification("Preferências salvas com sucesso no armazenamento local", "success");
  };

  const handleReset = () => {
    if (window.confirm("Deseja restaurar todas as configurações para o padrão de fábrica?")) {
      resetDefaults();
      showNotification("Configurações redefinidas para o padrão", "info");
    }
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "oh-my-shark-config.json";
    a.click();
    URL.revokeObjectURL(url);
    showNotification("Arquivo oh-my-shark-config.json exportado", "success");
  };

  return (
    <div
      className="oms-settings-page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "24px 32px",
        overflowY: "auto",
        gap: "24px",
        maxWidth: "880px",
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
            <SettingsIcon size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text)" }}>
              Configurações do Sistema
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Preferências visuais, comportamentos de execução, segurança e atalhos.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Badge variant={hasUnsavedChanges ? "warning" : "success"} size="md" dot>
            {hasUnsavedChanges ? "Alterações não salvas" : "Salvo"}
          </Badge>
          <Button variant="primary" onClick={handleSave} disabled={!hasUnsavedChanges}>
            Salvar Preferências
          </Button>
        </div>
      </div>

      {/* 1. Interface & Aparência */}
      <Card variant="raised" padding="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
            1. Interface & Visual
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>Densidade Visual</span>
                <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Ajusta o espaçamento entre elementos e cards de trabalho.</p>
              </div>
              <select
                value={settings.density}
                onChange={(e) => updateSetting("density", e.target.value as "comfortable" | "compact")}
                style={selectStyle}
              >
                <option value="comfortable">Confortável (Padrão 16px)</option>
                <option value="compact">Compacto (Alta Densidade 12px)</option>
              </select>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>Tema do Oceano</span>
                <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Graduação da paleta cromática Deep Ocean.</p>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting("theme", e.target.value as "deep-ocean" | "ocean-midnight" | "high-contrast")}
                style={selectStyle}
              >
                <option value="deep-ocean">Deep Ocean (#020A16)</option>
                <option value="ocean-midnight">Ocean Midnight (#00050D)</option>
                <option value="high-contrast">Alto Contraste WCAG AAA</option>
              </select>
            </div>

            <Toggle
              label="Animações & Microinterações"
              description="Transições suaves e efeitos visuais no compositor e mensagens."
              checked={settings.animationsEnabled}
              onChange={(val) => updateSetting("animationsEnabled", val)}
            />
          </div>
        </div>
      </Card>

      {/* 2. Comportamento e Segurança do Agente */}
      <Card variant="raised" padding="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
            2. Comportamento & Segurança
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--color-text)" }}>Modo de Aprovação Padrão</span>
                <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>Política de confirmação para chamadas de ferramentas externas.</p>
              </div>
              <select
                value={settings.approvalMode}
                onChange={(e) => updateSetting("approvalMode", e.target.value as ToolPermission)}
                style={selectStyle}
              >
                <option value="write">Write (Confirmar apenas escritas e edits)</option>
                <option value="always-ask">Always Ask (Sempre exigir confirmação)</option>
                <option value="yolo">YOLO (Execução autônoma contínua)</option>
              </select>
            </div>

            <Toggle
              label="Títulos Automáticos de Sessão"
              description="Gerar título curto para cada sessão com base na primeira mensagem do usuário."
              checked={settings.autoTitle}
              onChange={(val) => updateSetting("autoTitle", val)}
            />

            <Toggle
              label="Telemetria e Métricas Locais"
              description="Registrar histórico de tempo de resposta e contagem de tokens no SQLite local."
              checked={settings.telemetry}
              onChange={(val) => updateSetting("telemetry", val)}
            />
          </div>
        </div>
      </Card>

      {/* 3. Atalhos de Teclado */}
      <Card variant="raised" padding="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
                3. Atalhos de Teclado
              </h2>
              <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                Navegação rápida e comandos mapeados no sistema.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
            {Object.entries(settings.shortcuts).map(([key, val]) => (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--ocean-950)",
                  border: "1px solid var(--color-border)",
                  fontSize: "var(--text-xs)",
                }}
              >
                <span style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-code)" }}>{key}</span>
                <kbd
                  style={{
                    padding: "2px 6px",
                    borderRadius: "var(--radius-xs)",
                    backgroundColor: "var(--ocean-800)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    fontWeight: 700,
                  }}
                >
                  {val}
                </kbd>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 4. Gerenciamento de Dados */}
      <Card variant="raised" padding="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
            4. Manutenção & Dados
          </h2>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={handleExport}>
              Exportar Configurações (JSON)
            </Button>
            <Button variant="destructive" icon={<TrashIcon size={14} />} onClick={handleReset}>
              Restaurar Padrões de Fábrica
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

const selectStyle: React.CSSProperties = {
  height: "36px",
  padding: "0 12px",
  borderRadius: "var(--radius-md)",
  backgroundColor: "var(--ocean-900)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  fontSize: "var(--text-sm)",
  outline: "none",
  fontFamily: "var(--font-ui)",
};
