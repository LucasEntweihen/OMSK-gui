import React from "react";
import {
  SystemPromptIcon,
  CopyIcon,
  CheckIcon,
} from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAppStore } from "@/store/useAppStore";

const DEFAULT_SYSTEM_PROMPT = `# OH MY SHARK — SISTEMA OPERACIONAL COGNITIVO
Você é o Oh My Shark, um assistente técnico e predatório para engenharia de software de alta performance.

## 1. DIRETRIZES FUNDAMENTAIS
- Responda sempre no mesmo idioma do usuário com rigor técnico e concisão.
- Priorize a verdade e a corretude de tipos antes de qualquer abstração desnecessária.
- Utilize APIs nativas do Bun como primeira escolha (Bun.file, Bun.write, Bun.spawn, bun:sqlite).
- Nunca utilize o tipo 'any' ou supressões '@ts-ignore' em código TypeScript.

## 2. MECÂNICA DE EXECUÇÃO
- Ao analisar código, inspecione a árvore completa e as chamadas reais antes de sugerir refatorações.
- Trate o estado reportado pelo usuário como verdade absoluta.
- Ao executar ferramentas, valide previamente se os argumentos respeitam o contrato de esquema.

## 3. IDENTIDADE VISUAL & ENGENHARIA
- Preservar a paleta Deep Ocean (#020A16, #061326, #091A31, #102641).
- Azul elétrico (#2678FF) reservado exclusivamente para ação primária, foco e destaques funcionais.
`;

export const SystemPromptPage: React.FC = () => {
  const { showNotification } = useAppStore();

  const [promptContent, setPromptContent] = React.useState(DEFAULT_SYSTEM_PROMPT);
  const [savedPrompt, setSavedPrompt] = React.useState(DEFAULT_SYSTEM_PROMPT);
  const [activeScope, setActiveScope] = React.useState<"global" | "project" | "agent">("project");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_viewMode, _setViewMode] = React.useState<"editor" | "diff">("editor");
  const [copied, setCopied] = React.useState(false);

  const isDirty = promptContent !== savedPrompt;
  const lineCount = promptContent.split("\n").length;
  const charCount = promptContent.length;
  const tokenEstimate = Math.ceil(charCount / 3.8);

  const sections = promptContent
    .split("\n")
    .filter((l) => l.startsWith("#"))
    .map((l) => l.replace(/^#+\s*/, ""));

  const handleSave = () => {
    setSavedPrompt(promptContent);
    showNotification("System Prompt salvo com sucesso no escopo do projeto", "success");
  };

  const handleReset = () => {
    setPromptContent(DEFAULT_SYSTEM_PROMPT);
    showNotification("Prompt restaurado para o padrão do sistema", "info");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(promptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="oms-prompt-page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "24px 32px",
        overflowY: "auto",
        gap: "20px",
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
            <SystemPromptIcon size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text)" }}>
              Editor de System Prompt
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Instruções de base que definem a persona, raciocínio e heurísticas do modelo.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Badge variant={isDirty ? "warning" : "success"} size="md" dot>
            {isDirty ? "Rascunho não salvo" : "Ativo no Runtime"}
          </Badge>

          <Button variant="outline" size="sm" onClick={handleReset}>
            Restaurar Padrão
          </Button>

          <Button variant="primary" size="sm" onClick={handleSave} disabled={!isDirty}>
            Salvar Prompt
          </Button>
        </div>
      </div>

      {/* Toolbar: Escopo e Métricas */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px", backgroundColor: "var(--ocean-900)", padding: "10px 16px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
        {/* Seletor de Escopo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            Escopo:
          </span>
          {(["project", "global", "agent"] as const).map((sc) => (
            <button
              key={sc}
              onClick={() => setActiveScope(sc)}
              style={{
                padding: "4px 10px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: activeScope === sc ? "var(--blue-selected)" : "transparent",
                border: `1px solid ${activeScope === sc ? "var(--blue-400)" : "transparent"}`,
                color: activeScope === sc ? "var(--color-text)" : "var(--color-text-muted)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {sc === "project" ? "Projeto (.omp/SYSTEM.md)" : sc === "global" ? "Global (~/.omp/agent)" : "Especialista"}
            </button>
          ))}
        </div>

        {/* Métricas do Prompt */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", fontFamily: "var(--font-code)", fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
          <span>{lineCount} linhas</span>
          <span>{charCount} caracteres</span>
          <span style={{ color: "var(--blue-400)", fontWeight: 700 }}>~{tokenEstimate} tokens</span>

          <button
            onClick={handleCopy}
            title="Copiar prompt completo"
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {copied ? <CheckIcon size={14} color="var(--state-success)" /> : <CopyIcon size={14} />}
            <span>{copied ? "Copiado" : "Copiar"}</span>
          </button>
        </div>
      </div>

      {/* Grid Principal: Outline à Esquerda + Editor à Direita */}
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "16px", flex: 1, minHeight: "440px" }}>
        {/* Outline / Sumário de Cabeçalhos */}
        <Card variant="raised" padding="sm" style={{ height: "100%", overflowY: "auto" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", padding: "6px 8px", display: "block" }}>
            Estrutura do Documento
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
            {sections.map((sec, idx) => (
              <div
                key={idx}
                style={{
                  padding: "6px 8px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "12px",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--ocean-800)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                {sec}
              </div>
            ))}
          </div>
        </Card>

        {/* Área do Editor Monoespaçado com Números de Linha */}
        <Card variant="raised" padding="none" style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
          <div style={{ display: "flex", flex: 1, backgroundColor: "var(--ocean-950)", overflow: "hidden" }}>
            {/* Números de linha */}
            <div
              style={{
                width: "44px",
                padding: "16px 8px",
                backgroundColor: "var(--ocean-900)",
                borderRight: "1px solid var(--color-border)",
                color: "var(--ocean-750)",
                fontFamily: "var(--font-code)",
                fontSize: "13px",
                lineHeight: "1.6",
                textAlign: "right",
                userSelect: "none",
                overflowY: "hidden",
              }}
            >
              {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Textarea do Editor */}
            <textarea
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              spellCheck={false}
              style={{
                flex: 1,
                padding: "16px",
                backgroundColor: "transparent",
                border: "none",
                outline: "none",
                color: "var(--color-text)",
                fontFamily: "var(--font-code)",
                fontSize: "13px",
                lineHeight: "1.6",
                resize: "none",
                whiteSpace: "pre-wrap",
                overflowY: "auto",
              }}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
