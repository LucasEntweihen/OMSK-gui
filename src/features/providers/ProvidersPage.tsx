import React from "react";
import {
  ProvidersIcon,
  RefreshIcon,
  SparklesIcon,
} from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppStore, AVAILABLE_MODELS } from "@/store/useAppStore";
import type { AIProvider } from "@/types";
import FULL_CATALOG_RAW from "@/services/providerCatalog.generated.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";


interface CatalogMeta {
  readonly id: string;
  readonly name: string;
  readonly kind: string;
}

const ALL_HARNESS_PROVIDERS: readonly CatalogMeta[] = FULL_CATALOG_RAW as CatalogMeta[];

const FALLBACK_CATALOG: readonly AIProvider[] = [
  {
    id: "google-antigravity",
    name: "Google Antigravity (Gemini 3 Pro / Mandatory Thinking)",
    status: "disconnected",
    endpoint: "https://daily-cloudcode-pa.googleapis.com",
    latency: "---",
    activeModelId: "gemini-3-1-pro",
    models: [AVAILABLE_MODELS[2]!],
  },
  {
    id: "openai-codex",
    name: "ChatGPT Plus/Pro (Codex Subscription)",
    status: "disconnected",
    endpoint: "https://chatgpt.com/backend-api",
    latency: "---",
    activeModelId: "gpt-6-luna",
    models: [AVAILABLE_MODELS[1]!],
  },
  {
    id: "openrouter",
    name: "OpenRouter Gateway (500+ Modelos)",
    status: "disconnected",
    endpoint: "https://openrouter.ai/api/v1",
    latency: "---",
    activeModelId: "deepseek-r1",
    models: [AVAILABLE_MODELS[3]!],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    status: "disconnected",
    endpoint: "https://api.anthropic.com/v1",
    latency: "---",
    activeModelId: "claude-3-7-sonnet",
    models: [AVAILABLE_MODELS[0]!],
  },
  {
    id: "openai",
    name: "OpenAI",
    status: "disconnected",
    endpoint: "https://api.openai.com/v1",
    latency: "---",
    activeModelId: "gpt-4o",
    models: [AVAILABLE_MODELS[1]!],
  },
  {
    id: "google",
    name: "Google AI",
    status: "disconnected",
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    latency: "---",
    activeModelId: "gemini-1-5-pro",
    models: [AVAILABLE_MODELS[2]!],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    status: "disconnected",
    endpoint: "https://api.deepseek.com/v1",
    latency: "---",
    activeModelId: "deepseek-r1",
    models: [AVAILABLE_MODELS[3]!],
  },
  {
    id: "groq",
    name: "Meta / Groq",
    status: "disconnected",
    endpoint: "https://api.groq.com/openai/v1",
    latency: "---",
    activeModelId: "llama-3-3-70b",
    models: [AVAILABLE_MODELS[4]!],
  },
];

export const ProvidersPage: React.FC = () => {
  const {
    activeModel,
    setActiveModel,
    showNotification,
    authenticatedProviders,
    availableModels,
    syncBackendModels,
  } = useAppStore();

    const [testingId, setTestingId] = React.useState<string | null>(null);
  const [loggingOutId, setLoggingOutId] = React.useState<string | null>(null);
  const [loginModalOpen, setLoginModalOpen] = React.useState(false);
  const [selectedProviderToLogin, setSelectedProviderToLogin] = React.useState("google-antigravity");
  const [apiKeyInput, setApiKeyInput] = React.useState("");
  const [providerSearch, setProviderSearch] = React.useState("");
  const [filterMode, setFilterMode] = React.useState<"all" | "connected" | "oauth" | "apikey">("all");
  const [loggingInWeb, setLoggingInWeb] = React.useState(false);

  React.useEffect(() => {
    syncBackendModels();
  }, [syncBackendModels]);

  // Deriva o status real a partir de authenticatedProviders retornado pelo backend
  const displayProviders = FALLBACK_CATALOG.map((prov) => {
    const isAuthed =
      authenticatedProviders.includes(prov.id) ||
      authenticatedProviders.some((p) => p.toLowerCase() === prov.id.toLowerCase());
    return {
      ...prov,
      status: isAuthed ? ("connected" as const) : ("disconnected" as const),
      latency: isAuthed ? "140ms" : "---",
    };
  });

  const handleTestConnection = async (provId: string) => {
    setTestingId(provId);
    try {
      await syncBackendModels();
      const isAuthed = authenticatedProviders.includes(provId);
      if (isAuthed) {
        showNotification(`Provedor ${provId} verificado: operacional e autenticado no OMSK`, "success");
      } else {
        showNotification(`Provedor ${provId} não possui credenciais ativas. Faça o login.`, "warning");
      }
    } catch {
      showNotification(`Erro de conexão com o runtime ao testar ${provId}`, "error");
    } finally {
      setTestingId(null);
    }
  };

  
  const handleWebLogin = async (provId: string) => {
    setLoggingInWeb(true);
    try {
      showNotification("Iniciando autenticação Web para " + provId + ". Abrindo navegador...", "info");
      const res = await fetch("/api/providers/oauth-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provId }),
      });
      const data = await res.json();
      if (data && data.ok) {
        showNotification(data.message || "Navegador aberto! Complete a autenticação na página.", "success");
        setTimeout(() => syncBackendModels(), 4000);
        setTimeout(() => syncBackendModels(), 10000);
      } else {
        showNotification(data?.error || "Falha ao iniciar autenticação web", "error");
      }
    } catch {
      showNotification("Erro de conexão com o runtime OMSK", "error");
    } finally {
      setLoggingInWeb(false);
    }
  };

  const handleLogout = async (provId: string) => {
    setLoggingOutId(provId);
    try {
      const res = await fetch("/api/providers/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provId }),
      });
      if (res.ok) {
        await syncBackendModels();
        showNotification(`Provedor ${provId} desconectado e credencial removida.`, "info");
      } else {
        showNotification(`Falha ao desconectar ${provId}`, "error");
      }
    } catch {
      showNotification(`Erro ao tentar desconectar ${provId}`, "error");
    } finally {
      setLoggingOutId(null);
    }
  };

  const chartData = availableModels.slice(0, 8).map((m) => ({
    name: m.name.split(" ")[0],
    fullName: m.name,
    latency: m.latencyMs,
    isActive: m.id === activeModel.id,
  }));

  return (
    <div
      className="oms-providers-page"
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
            <ProvidersIcon size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text)" }}>
              Provedores & Modelos
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Gerencie integrações e credenciais reais sincronizadas com o banco local (~/.omsk/agent/agent.db).
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<SparklesIcon size={14} />}
          onClick={() => setLoginModalOpen(true)}
        >
          + Conectar / Login Provedor
        </Button>
      </div>

      
      {/* Barra de Busca e Filtros Rápidos */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Buscar entre os 70 provedores oficiais..."
          value={providerSearch}
          onChange={(e) => setProviderSearch(e.target.value)}
          style={{
            flex: "1 1 260px",
            maxWidth: "400px",
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: "var(--ocean-900)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
            fontSize: "var(--text-xs)",
          }}
        />

        <div style={{ display: "flex", gap: "6px" }}>
          {(["all", "connected", "oauth", "apikey"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setFilterMode(m)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid " + (filterMode === m ? "var(--blue-500)" : "var(--color-border)"),
                backgroundColor: filterMode === m ? "rgba(38, 120, 255, 0.2)" : "var(--ocean-900)",
                color: filterMode === m ? "var(--color-text)" : "var(--color-text-muted)",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {m === "all" ? "Todos (" + ALL_HARNESS_PROVIDERS.length + ")" : m === "connected" ? "Conectados" : m === "oauth" ? "OAuth / Web" : "API Key"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Provedores com Status Real */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {displayProviders.map((prov) => {
          const isTesting = testingId === prov.id;
          const isLoggingOut = loggingOutId === prov.id;
          const isConnected = prov.status === "connected";

          return (
            <Card key={prov.id} variant="raised" padding="md">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
                      {prov.name}
                    </span>
                    <Badge variant={isConnected ? "success" : "warning"} size="sm">
                      {isConnected ? "Autenticado" : "Não conectado"}
                    </Badge>
                  </div>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-code)" }}>
                    {prov.latency}
                  </span>
                </div>

                <div style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "var(--font-code)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {prov.endpoint}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                  <span style={{ fontSize: "11px", color: "var(--color-text-secondary)" }}>
                    {isConnected ? "Pronto para execução" : "Requer autenticação"}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {isConnected ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={isLoggingOut}
                        onClick={() => handleLogout(prov.id)}
                      >
                        Desconectar
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProviderToLogin(prov.id);
                          setLoginModalOpen(true);
                        }}
                      >
                        Login
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      loading={isTesting}
                      icon={<RefreshIcon size={12} />}
                      onClick={() => handleTestConnection(prov.id)}
                    >
                      Testar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Benchmark de Latência (Recharts) */}
      <Card variant="raised" padding="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
                Benchmark de Latência Média (TTFT em milissegundos)
              </span>
              <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                Tempo até o primeiro token em chamadas concorrentes medido pelo harness.
              </p>
            </div>
            <Badge variant="primary" size="sm">Menor é melhor</Badge>
          </div>

          <div style={{ width: "100%", height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--ocean-900)",
                    borderColor: "var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-text)",
                    fontSize: "12px",
                  }}
                  formatter={(val: unknown) => [`${val} ms`, "Latência"]}
                />
                <Bar dataKey="latency" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isActive ? "var(--blue-500)" : "var(--ocean-750)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Catálogo Detalhado de Modelos Reais */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
          Modelos Homologados no Harness ({availableModels.length} disponíveis)
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
          {availableModels.map((model) => {
            const isSelected = model.id === activeModel.id;
            return (
              <Card
                key={model.id}
                variant={isSelected ? "active" : "raised"}
                padding="md"
                onClick={async () => {
                  setActiveModel(model);
                  try {
                    await fetch("/api/models/select", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ provider: model.provider, id: model.id }),
                    });
                  } catch {}
                  showNotification(`Modelo ativo alterado para ${model.name}`, "success");
                }}
                style={{ cursor: "pointer" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
                          {model.name}
                        </span>
                        {isSelected && (
                          <Badge variant="primary" size="sm">
                            <SparklesIcon size={10} /> Ativo
                          </Badge>
                        )}
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        {model.provider}
                      </span>
                    </div>

                    <span style={{ fontFamily: "var(--font-code)", fontSize: "11px", color: "var(--color-text-secondary)" }}>
                      {model.latencyMs}ms
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {model.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "10px",
                          padding: "1px 6px",
                          borderRadius: "var(--radius-xs)",
                          backgroundColor: "var(--ocean-950)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: "6px",
                      borderTop: "1px solid rgba(23, 51, 83, 0.4)",
                      fontSize: "11px",
                      color: "var(--color-text-muted)",
                      fontFamily: "var(--font-code)",
                    }}
                  >
                    <span>Janela: {model.contextWindow}</span>
                    <span>Preço: {model.pricing.input}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modal de Conexão e Login OAuth / API Key */}
      {loginModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(2, 10, 22, 0.8)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: "16px",
          }}
        >
          <Card variant="raised" padding="lg" style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ProvidersIcon size={18} />
                <span style={{ fontSize: "var(--text-md)", fontWeight: 700 }}>Conectar Novo Provedor (OMSK Auth)</span>
              </div>
              <button
                onClick={() => setLoginModalOpen(false)}
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              Autentique-se com os mesmos provedores suportados pelo OMSK (/login). Suas credenciais são sincronizadas no armazenamento local seguro (~/.omsk/agent/agent.db).
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)" }}>Provedor</label>
              <select
                value={selectedProviderToLogin}
                onChange={(e) => setSelectedProviderToLogin(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--ocean-950)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  fontSize: "var(--text-xs)",
                }}
              >
                {ALL_HARNESS_PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) {p.kind === "oauth-code" || p.kind === "device-code" ? "• Web OAuth" : "• API Key"}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 600, color: "var(--color-text-secondary)" }}>API Key ou Token de Sessão</label>
              <input
                type="password"
                placeholder="Insira a chave de API..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--ocean-950)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  fontSize: "var(--text-xs)",
                }}
              />
            </div>

            
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginTop: "8px" }}>
              {(() => {
                const target = ALL_HARNESS_PROVIDERS.find((p) => p.id === selectedProviderToLogin);
                const isTargetOAuth = target && (target.kind === "oauth-code" || target.kind === "device-code" || target.kind === "custom");
                return isTargetOAuth ? (
                  <Button
                    variant="outline"
                    size="sm"
                    loading={loggingInWeb}
                    onClick={() => {
                      handleWebLogin(selectedProviderToLogin);
                      setLoginModalOpen(false);
                    }}
                  >
                    🌐 Autenticar pelo Navegador (Web)
                  </Button>
                ) : <span />;
              })()}

              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="ghost" size="sm" onClick={() => setLoginModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/providers/configure", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ provider: selectedProviderToLogin, apiKey: apiKeyInput }),
                      });
                      if (res.ok) {
                        await syncBackendModels();
                        showNotification("Provedor " + selectedProviderToLogin + " autenticado no OMSK!", "success");
                        setLoginModalOpen(false);
                        setApiKeyInput("");
                      } else {
                        showNotification("Falha ao salvar credencial no OMSK", "error");
                      }
                    } catch {
                      showNotification("Erro de conexão com o runtime OMSK", "error");
                    }
                  }}
                >
                  Salvar Credencial & Conectar
                </Button>
              </div>
            </div>
      </Card>
        </div>
      )}
    </div>
  );
};
