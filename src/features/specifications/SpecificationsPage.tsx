import React from "react";
import { SpecificationsIcon, CopyIcon, CheckIcon } from "@/components/icons";
import { Card } from "@/components/ui/Card";

export const SpecificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<"arch" | "tokens" | "contracts">("arch");
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  const tokens = [
    { name: "--ocean-950", hex: "#020A16", role: "Fundo principal (canvas mais profundo)" },
    { name: "--ocean-900", hex: "#061326", role: "Painéis e superfícies de trabalho" },
    { name: "--ocean-850", hex: "#091A31", role: "Cards e superfícies elevadas" },
    { name: "--ocean-800", hex: "#102641", role: "Hover e seleção suave" },
    { name: "--blue-500", hex: "#2678FF", role: "Ação primária, foco, seleção" },
    { name: "--blue-400", hex: "#48A5FF", role: "Destaques e ícones ativos" },
    { name: "--border-subtle", hex: "#173353", role: "Bordas e divisores estruturais" },
    { name: "--state-success", hex: "#35D39A", role: "Operação concluída / positivo" },
    { name: "--state-warning", hex: "#F4B84A", role: "Atenção / aviso" },
    { name: "--state-danger", hex: "#FF637D", role: "Erro / ação destrutiva" },
  ];

  const handleCopy = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedToken(val);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  return (
    <div
      className="oms-specs-page"
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
            <SpecificationsIcon size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text)" }}>
              Especificações Técnicas & Arquitetura
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Documentação viva, diagrama de camadas e contratos de design do Oh My Shark.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", backgroundColor: "var(--ocean-900)", padding: "4px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
          <button
            onClick={() => setActiveTab("arch")}
            style={tabBtnStyle(activeTab === "arch")}
          >
            Arquitetura de Sistema
          </button>
          <button
            onClick={() => setActiveTab("tokens")}
            style={tabBtnStyle(activeTab === "tokens")}
          >
            Tokens de Design
          </button>
          <button
            onClick={() => setActiveTab("contracts")}
            style={tabBtnStyle(activeTab === "contracts")}
          >
            Contratos de Engenharia
          </button>
        </div>
      </div>

      {/* Conteúdo da Aba Ativa */}
      {activeTab === "arch" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card variant="raised" padding="md">
            <h3 style={{ margin: "0 0 12px 0", fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
              Diagrama Estrutural do Ecossistema Oh My Shark
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
              Fluxo desacoplado entre a interface gráfica React, o SDK do Coding Agent em Bun e os crates nativos em Rust.
            </p>

            {/* Diagrama SVG Interativo */}
            <div
              style={{
                width: "100%",
                padding: "20px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--ocean-950)",
                border: "1px solid var(--color-border)",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <svg width="100%" height="260" viewBox="0 0 760 260" fill="none" style={{ maxWidth: "760px" }}>
                {/* Camada UI */}
                <rect x="20" y="20" width="200" height="70" rx="8" fill="#061326" stroke="#2678FF" strokeWidth="1.5" />
                <text x="120" y="50" fill="#E8F1FF" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">React 19 + Vite UI</text>
                <text x="120" y="70" fill="#9CB4D4" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Deep Ocean Interface</text>

                {/* Seta UI -> SDK */}
                <path d="M220 55 H290" stroke="#48A5FF" strokeWidth="2" strokeDasharray="4 4" />
                <polygon points="290,55 284,51 284,59" fill="#48A5FF" />

                {/* Camada SDK */}
                <rect x="290" y="20" width="200" height="70" rx="8" fill="#091A31" stroke="#35D39A" strokeWidth="1.5" />
                <text x="390" y="50" fill="#E8F1FF" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Coding Agent SDK</text>
                <text x="390" y="70" fill="#35D39A" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Bun Runtime 1.4+</text>

                {/* Seta SDK -> Rust */}
                <path d="M490 55 H560" stroke="#35D39A" strokeWidth="2" />
                <polygon points="560,55 554,51 554,59" fill="#35D39A" />

                {/* Camada Rust pi-natives */}
                <rect x="560" y="20" width="180" height="70" rx="8" fill="#061326" stroke="#F4B84A" strokeWidth="1.5" />
                <text x="650" y="50" fill="#E8F1FF" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">pi-natives (N-API)</text>
                <text x="650" y="70" fill="#F4B84A" fontSize="11" textAnchor="middle" fontFamily="sans-serif">Rust Core 2021</text>

                {/* Camadas Inferiores: Sessões e Provedores */}
                <rect x="80" y="150" width="180" height="60" rx="8" fill="#091A31" stroke="#173353" />
                <text x="170" y="178" fill="#E8F1FF" fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">SessionManager</text>
                <text x="170" y="196" fill="#6985A9" fontSize="10" textAnchor="middle" fontFamily="sans-serif">JSONL v3 Tree Storage</text>

                <rect x="300" y="150" width="180" height="60" rx="8" fill="#091A31" stroke="#173353" />
                <text x="390" y="178" fill="#E8F1FF" fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">AI Providers Matrix</text>
                <text x="390" y="196" fill="#6985A9" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Claude, GPT, Gemini</text>

                <rect x="520" y="150" width="180" height="60" rx="8" fill="#091A31" stroke="#173353" />
                <text x="610" y="178" fill="#E8F1FF" fontSize="12" fontWeight="600" textAnchor="middle" fontFamily="sans-serif">pi-shell & pi-ast</text>
                <text x="610" y="196" fill="#6985A9" fontSize="10" textAnchor="middle" fontFamily="sans-serif">In-process Shell & Tree-sitter</text>

                {/* Conexões verticais */}
                <line x1="390" y1="90" x2="390" y2="150" stroke="#173353" strokeWidth="1.5" />
                <line x1="170" y1="90" x2="170" y2="150" stroke="#173353" strokeWidth="1.5" />
                <line x1="610" y1="90" x2="610" y2="150" stroke="#173353" strokeWidth="1.5" />
              </svg>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "tokens" && (
        <Card variant="raised" padding="md">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
              Catálogo Oficial de Tokens CSS
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {tokens.map((tok) => (
                <div
                  key={tok.name}
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
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "var(--radius-xs)",
                        backgroundColor: tok.hex,
                        border: "1px solid rgba(255,255,255,0.2)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontFamily: "var(--font-code)", fontWeight: 700, color: "var(--blue-400)" }}>
                      {tok.name}
                    </span>
                    <span style={{ fontFamily: "var(--font-code)", color: "var(--color-text-muted)" }}>
                      {tok.hex}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ color: "var(--color-text-secondary)" }}>{tok.role}</span>
                    <button
                      onClick={() => handleCopy(`var(${tok.name})`)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: copiedToken === `var(${tok.name})` ? "var(--state-success)" : "var(--color-text-muted)",
                        cursor: "pointer",
                        display: "flex",
                        padding: 0,
                      }}
                    >
                      {copiedToken === `var(${tok.name})` ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeTab === "contracts" && (
        <Card variant="raised" padding="md">
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
              Invariantes e Contratos do Sistema
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
              <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", backgroundColor: "var(--ocean-950)", borderLeft: "3px solid var(--blue-500)" }}>
                <strong style={{ color: "var(--color-text)" }}>Zero Any & Strict Typing:</strong> Nenhuma função, parâmetro ou retorno deve usar <code>any</code>. Todos os tipos são validados via esquemas Zod e interfaces estritas.
              </div>

              <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", backgroundColor: "var(--ocean-950)", borderLeft: "3px solid var(--state-success)" }}>
                <strong style={{ color: "var(--color-text)" }}>Bun APIs First:</strong> Processos, arquivos e bancos utilizam diretamente <code>Bun.file</code>, <code>Bun.write</code>, <code>Bun.spawn</code> e <code>bun:sqlite</code>, sem bibliotecas externas redundantes.
              </div>

              <div style={{ padding: "10px 14px", borderRadius: "var(--radius-md)", backgroundColor: "var(--ocean-950)", borderLeft: "3px solid var(--state-warning)" }}>
                <strong style={{ color: "var(--color-text)" }}>Integridade Não-Destrutiva:</strong> Toda modificação de arquivos preserva recursos anteriores, atalhos de teclado e histórico de conversas via árvore append-only no formato JSONL v3.
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: "6px 14px",
  borderRadius: "var(--radius-sm)",
  backgroundColor: active ? "var(--blue-selected)" : "transparent",
  color: active ? "var(--color-text)" : "var(--color-text-muted)",
  border: "none",
  fontSize: "var(--text-sm)",
  fontWeight: 600,
  cursor: "pointer",
});
