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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const INITIAL_PROVIDERS: readonly AIProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    status: "connected",
    endpoint: "https://api.anthropic.com/v1",
    latency: "380ms",
    activeModelId: "claude-3-5-sonnet",
    models: [AVAILABLE_MODELS[0]!],
  },
  {
    id: "openai",
    name: "OpenAI",
    status: "connected",
    endpoint: "https://api.openai.com/v1",
    latency: "420ms",
    activeModelId: "gpt-4o",
    models: [AVAILABLE_MODELS[1]!],
  },
  {
    id: "google",
    name: "Google AI",
    status: "connected",
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    latency: "490ms",
    activeModelId: "gemini-1-5-pro",
    models: [AVAILABLE_MODELS[2]!],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    status: "connected",
    endpoint: "https://api.deepseek.com/v1",
    latency: "650ms",
    activeModelId: "deepseek-r1",
    models: [AVAILABLE_MODELS[3]!],
  },
  {
    id: "groq",
    name: "Meta / Groq",
    status: "connected",
    endpoint: "https://api.groq.com/openai/v1",
    latency: "140ms",
    activeModelId: "llama-3-3-70b",
    models: [AVAILABLE_MODELS[4]!],
  },
];

export const ProvidersPage: React.FC = () => {
  const { activeModel, setActiveModel, showNotification } = useAppStore();
  const [providers, setProviders] = React.useState<readonly AIProvider[]>(INITIAL_PROVIDERS);
  const [testingId, setTestingId] = React.useState<string | null>(null);

  const handleTestConnection = (provId: string) => {
    setTestingId(provId);
    setTimeout(() => {
      setTestingId(null);
      const randomLatency = Math.floor(Math.random() * 200 + 120);
      setProviders(
        providers.map((p) =>
          p.id === provId ? { ...p, status: "connected", latency: `${randomLatency}ms` } : p
        )
      );
      showNotification(`Conexão com ${provId} verificada: ${randomLatency}ms`, "success");
    }, 900);
  };

  const chartData = AVAILABLE_MODELS.map((m) => ({
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
              Gerencie integrações, credenciais e compare métricas de latência e custo.
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Provedores Conectados */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
        {providers.map((prov) => {
          const isTesting = testingId === prov.id;
          return (
            <Card key={prov.id} variant="raised" padding="md">
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
                      {prov.name}
                    </span>
                    <Badge variant={prov.status === "connected" ? "success" : "warning"} size="sm">
                      {prov.status === "connected" ? "Conectado" : "Testando"}
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
                    1 modelo disponível
                  </span>
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
                Tempo até o primeiro token em chamadas concorrentes simuladas.
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

      {/* Catálogo Detalhado de Modelos */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
          Modelos Homologados
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px" }}>
          {AVAILABLE_MODELS.map((model) => {
            const isSelected = model.id === activeModel.id;
            return (
              <Card
                key={model.id}
                variant={isSelected ? "active" : "raised"}
                padding="md"
                onClick={() => {
                  setActiveModel(model);
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
    </div>
  );
};
