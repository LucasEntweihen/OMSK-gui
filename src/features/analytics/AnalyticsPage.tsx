import React from "react";
import { AnalyticsIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const TIME_SERIES_DATA = [
  { time: "10:00", inputTokens: 120, outputTokens: 45, latency: 280 },
  { time: "11:00", inputTokens: 240, outputTokens: 80, latency: 310 },
  { time: "12:00", inputTokens: 190, outputTokens: 60, latency: 290 },
  { time: "13:00", inputTokens: 380, outputTokens: 140, latency: 420 },
  { time: "14:00", inputTokens: 620, outputTokens: 220, latency: 360 },
  { time: "14:30", inputTokens: 850, outputTokens: 310, latency: 340 },
];

const TOOL_DISTRIBUTION_DATA = [
  { tool: "read", count: 384 },
  { tool: "lsp", count: 312 },
  { tool: "grep", count: 210 },
  { tool: "glob", count: 168 },
  { tool: "bash", count: 142 },
  { tool: "edit", count: 96 },
  { tool: "write", count: 52 },
  { tool: "ast_edit", count: 34 },
];

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = React.useState<"24h" | "7d" | "30d">("24h");

  return (
    <div
      className="oms-analytics-page"
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
            <AnalyticsIcon size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text)" }}>
              Dashboard Analítico & Telemetria
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Observabilidade de tokens, latência de inferência e uso de ferramentas em tempo real.
            </p>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div style={{ display: "flex", gap: "6px", backgroundColor: "var(--ocean-900)", padding: "4px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
          {(["24h", "7d", "30d"] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: timeframe === tf ? "var(--blue-selected)" : "transparent",
                color: timeframe === tf ? "var(--color-text)" : "var(--color-text-muted)",
                border: "none",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tf === "24h" ? "Últimas 24h" : tf === "7d" ? "Últimos 7 dias" : "30 dias"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        <Card variant="raised" padding="md">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: 600 }}>Tokens Processados</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>1.8M</div>
          <span style={{ fontSize: "11px", color: "var(--blue-400)" }}>Capacidade: 4.2M (42%)</span>
        </Card>

        <Card variant="raised" padding="md">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--state-success)", fontWeight: 600 }}>Cache Hit Rate</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--state-success)", marginTop: "4px" }}>78.4%</div>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>Reuso de prompt cache</span>
        </Card>

        <Card variant="raised" padding="md">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: 600 }}>Latência Média (p50)</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>340 ms</div>
          <span style={{ fontSize: "11px", color: "var(--state-success)" }}>-12% vs última semana</span>
        </Card>

        <Card variant="raised" padding="md">
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontWeight: 600 }}>Total de Turnos Ativos</span>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--color-text)", marginTop: "4px" }}>30</div>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>3h 42min de sessão</span>
        </Card>
      </div>

      {/* Gráfico 1: Consumo Temporal de Tokens (AreaChart) */}
      <Card variant="raised" padding="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
                Consumo de Tokens por Hora (Input vs Output)
              </span>
              <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                Fluxo de tokens trocados na sessão atual em milhares (k).
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Badge variant="primary" size="sm">Input Tokens</Badge>
              <Badge variant="success" size="sm">Output Tokens</Badge>
            </div>
          </div>

          <div style={{ width: "100%", height: "240px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TIME_SERIES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2678FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2678FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#35D39A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#35D39A" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--ocean-900)",
                    borderColor: "var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-text)",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="inputTokens" name="Input (k)" stroke="#2678FF" strokeWidth={2} fillOpacity={1} fill="url(#colorInput)" />
                <Area type="monotone" dataKey="outputTokens" name="Output (k)" stroke="#35D39A" strokeWidth={2} fillOpacity={1} fill="url(#colorOutput)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Gráfico 2: Distribuição de Invocações de Ferramentas (BarChart) */}
      <Card variant="raised" padding="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
              Frequência de Uso de Ferramentas
            </span>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
              Contagem cumulativa de chamadas de ferramentas especializadas pelo agente.
            </p>
          </div>

          <div style={{ width: "100%", height: "200px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TOOL_DISTRIBUTION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="tool" stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--color-text-muted)" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--ocean-900)",
                    borderColor: "var(--color-border)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--color-text)",
                    fontSize: "12px",
                  }}
                  formatter={(val: unknown) => [`${val} chamadas`, "Invocações"]}
                />
                <Bar dataKey="count" fill="var(--blue-500)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
};
