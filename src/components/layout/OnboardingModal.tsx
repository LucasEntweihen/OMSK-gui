import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SharkFinIcon } from "@/components/icons";
import { useAppStore } from "@/store/useAppStore";
import FULL_CATALOG_RAW from "@/services/providerCatalog.generated.json";

export const OnboardingModal: React.FC = () => {
  const {
    authenticatedProviders,
    activeModel,
    syncBackendModels,
    showNotification,
  } = useAppStore();

  const [hasDismissed, setHasDismissed] = React.useState(() => {
    try {
      return localStorage.getItem("oms_onboarding_completed") === "true";
    } catch {
      return false;
    }
  });

  const [selectedProvider, setSelectedProvider] = React.useState("google-antigravity");
  const [apiKey, setApiKey] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Se o usuário já autenticou pelo menos um provider ou já completou o onboarding, não bloqueia
  const hasAuth = authenticatedProviders.length > 0;
  const isOpen = !hasDismissed && !hasAuth;

  
  const [loggingInWeb, setLoggingInWeb] = React.useState(false);

  const handleWebLogin = async () => {
    setLoggingInWeb(true);
    try {
      showNotification("Iniciando autenticação Web para " + selectedProvider + "...", "info");
      const res = await fetch("/api/providers/oauth-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider }),
      });
      const data = await res.json();
      if (data && data.ok) {
        showNotification(data.message || "Navegador aberto! Complete o login.", "success");
        setTimeout(async () => {
          await syncBackendModels();
          try { localStorage.setItem("oms_onboarding_completed", "true"); } catch {}
          setHasDismissed(true);
        }, 8000);
      } else {
        showNotification(data?.error || "Falha ao iniciar autenticação web", "error");
      }
    } catch {
      showNotification("Erro ao comunicar com backend OMSK", "error");
    } finally {
      setLoggingInWeb(false);
    }
  };

  const handleSaveCredential = async () => {
    if (!apiKey.trim()) {
      showNotification("Por favor, insira a chave de API ou credencial.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/providers/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: selectedProvider, apiKey: apiKey.trim() }),
      });

      if (res.ok) {
        await syncBackendModels();
        showNotification(`Provedor ${selectedProvider} autenticado com sucesso!`, "success");
        try {
          localStorage.setItem("oms_onboarding_completed", "true");
        } catch {}
        setHasDismissed(true);
      } else {
        showNotification("Falha ao salvar credencial no motor OMSK.", "error");
      }
    } catch {
      showNotification("Erro ao se comunicar com o backend local do OMSK.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipOrContinue = () => {
    try {
      localStorage.setItem("oms_onboarding_completed", "true");
    } catch {}
    setHasDismissed(true);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkipOrContinue}
      title="Bem-vindo ao Oh My Shark (OMSK GUI)"
      subtitle="Inicialização & Configuração Oficial do Harness"
      maxWidth="580px"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <Button variant="ghost" size="sm" onClick={handleSkipOrContinue}>
            Configurar depois (Modo Offline)
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={submitting}
            onClick={handleSaveCredential}
          >
            Conectar & Entrar
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Banner de Boas-vindas */}
        <div
          style={{
            padding: "16px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "rgba(38, 120, 255, 0.08)",
            border: "1px solid rgba(38, 120, 255, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: "rgba(38, 120, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--blue-400)",
            }}
          >
            <SharkFinIcon size={20} />
          </div>
          <div>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
              Primeira Inicialização Detectada
            </span>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              Para interagir com modelos reais de inteligência artificial, conecte seu primeiro provedor abaixo. Suas credenciais são guardadas no SQLite local seguro (~/.omsk/agent/agent.db).
            </p>
          </div>
        </div>

        {/* Formulário de Seleção e Chave */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)" }}>
            Selecione o Provedor de IA
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--ocean-950)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontSize: "var(--text-xs)",
            }}
          >
            {(FULL_CATALOG_RAW as any[]).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id}) {p.kind === "oauth-code" || p.kind === "device-code" ? "• Web OAuth" : "• API Key"}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)" }}>
            Chave de API (API Key)
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Insira sua chave para autenticação..."
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--ocean-950)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--font-code)",
            }}
          />
        </div>

        {/* Modelo Padrão */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)" }}>
            Modelo Padrão Ativo
          </label>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", backgroundColor: "var(--ocean-900)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text)", fontWeight: 600 }}>
              {activeModel.name} ({activeModel.provider})
            </span>
            <Badge variant="primary" size="sm">Padrão</Badge>
          </div>
        </div>
      </div>
    </Modal>
  );
};
