import React from "react";
import {
  ToolsIcon,
  PlayIcon,
  SearchIcon,
  CheckCircleIcon,
} from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { ToolItem, ToolPermission } from "@/types";

const INITIAL_TOOLS: readonly ToolItem[] = [
  {
    id: "tool-bash",
    name: "bash",
    category: "system",
    description: "Execução controlada de binários e comandos shell isolados via pi-shell embutido.",
    permission: "write",
    enabled: true,
    invocationCount: 142,
    avgDuration: "2.1s",
    parameters: [
      { name: "command", type: "string", required: true, description: "Comando shell a ser executado" },
      { name: "timeout", type: "number", required: false, description: "Tempo limite em segundos" },
    ],
  },
  {
    id: "tool-read",
    name: "read",
    category: "fs",
    description: "Leitura cirúrgica de arquivos, seletores de linha, bancos SQLite e URLs sem sobrecarga.",
    permission: "yolo",
    enabled: true,
    invocationCount: 384,
    avgDuration: "0.3s",
    parameters: [
      { name: "path", type: "string", required: true, description: "Caminho do arquivo ou seletor de linha" },
    ],
  },
  {
    id: "tool-edit",
    name: "edit",
    category: "fs",
    description: "Edição atômica baseada em snapshots hashline seguros com prevenção de race condition.",
    permission: "write",
    enabled: true,
    invocationCount: 96,
    avgDuration: "1.4s",
    parameters: [
      { name: "input", type: "string", required: true, description: "Patch formatado com tags hexadecimais" },
    ],
  },
  {
    id: "tool-write",
    name: "write",
    category: "fs",
    description: "Criação ou sobrescrita atômica de arquivos e payloads em lote.",
    permission: "write",
    enabled: true,
    invocationCount: 52,
    avgDuration: "0.8s",
    parameters: [
      { name: "path", type: "string", required: true, description: "Caminho de destino do arquivo" },
      { name: "content", type: "string", required: true, description: "Conteúdo integral a ser persistido" },
    ],
  },
  {
    id: "tool-grep",
    name: "grep",
    category: "code",
    description: "Busca de expressões regulares ultra-rápida via pipeline nativo em Rust do pi-natives.",
    permission: "yolo",
    enabled: true,
    invocationCount: 210,
    avgDuration: "0.4s",
    parameters: [
      { name: "pattern", type: "string", required: true, description: "Padrão regex para localização" },
      { name: "path", type: "string", required: false, description: "Escopo de arquivos ou diretórios" },
    ],
  },
  {
    id: "tool-glob",
    name: "glob",
    category: "code",
    description: "Varredura paralela de árvores respeitando .gitignore com cache em memória.",
    permission: "yolo",
    enabled: true,
    invocationCount: 168,
    avgDuration: "0.2s",
    parameters: [
      { name: "path", type: "string", required: true, description: "Padrão glob (ex: src/**/*.ts)" },
    ],
  },
  {
    id: "tool-lsp",
    name: "lsp",
    category: "code",
    description: "Inteligência de código: definições, referências, diagnósticos e renomeações via language server.",
    permission: "yolo",
    enabled: true,
    invocationCount: 312,
    avgDuration: "0.5s",
    parameters: [
      { name: "action", type: "string", required: true, description: "Operação: diagnostics, definition, rename" },
    ],
  },
  {
    id: "tool-ast_edit",
    name: "ast_edit",
    category: "code",
    description: "Refatoração estrutural AST através de padrões sintáticos do ast-grep.",
    permission: "write",
    enabled: true,
    invocationCount: 34,
    avgDuration: "1.9s",
    parameters: [
      { name: "ops", type: "array", required: true, description: "Lista de operações de reescrita AST" },
    ],
  },
];

export const ToolsPage: React.FC = () => {
  const [tools, setTools] = React.useState<readonly ToolItem[]>(INITIAL_TOOLS);
  const [selectedTool, setSelectedTool] = React.useState<ToolItem>(INITIAL_TOOLS[0]!);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");

  // Console interativo
  const [testInput, setTestInput] = React.useState("ls -la src/");
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [consoleOutput, setConsoleOutput] = React.useState<string>(
    "total 48\ndrwxr-xr-x  8 shark  staff   256 Oct 18 14:15 .\ndrwxr-xr-x  6 shark  staff   192 Oct 18 14:10 ..\ndrwxr-xr-x  4 shark  staff   128 Oct 18 14:20 auth\ndrwxr-xr-x  4 shark  staff   128 Oct 18 14:18 config\ndrwxr-xr-x  5 shark  staff   160 Oct 18 14:22 middleware\ndrwxr-xr-x  6 shark  staff   192 Oct 18 14:25 models\ndrwxr-xr-x  7 shark  staff   224 Oct 18 14:28 routes"
  );

  const filteredTools = tools.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleExecuteSimulated = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setConsoleOutput(
        `[${new Date().toLocaleTimeString("pt-BR")}] Executando ${selectedTool.name} com "${testInput}"...\n` +
        `STATUS: 0 (OK) - Concluído em 0.8s\n` +
        `RESULT: Sucesso operacional registrado no audit log de ferramentas.`
      );
    }, 800);
  };

  const handleUpdatePermission = (perm: ToolPermission) => {
    setTools(tools.map((t) => (t.id === selectedTool.id ? { ...t, permission: perm } : t)));
    setSelectedTool({ ...selectedTool, permission: perm });
  };

  return (
    <div
      className="oms-tools-page"
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
            <ToolsIcon size={20} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text)" }}>
              Catálogo de Ferramentas
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Controle de permissões, políticas de aprovação e console de teste de ferramentas.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Principal: Lista à Esquerda + Detalhes/Console à Direita */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Coluna Esquerda: Catálogo */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* Busca & Filtro */}
          <div style={{ display: "flex", gap: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--ocean-900)",
                border: "1px solid var(--color-border)",
                flex: 1,
              }}
            >
              <SearchIcon size={14} color="var(--color-text-muted)" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar ferramenta..."
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "var(--color-text)",
                  fontSize: "var(--text-sm)",
                  width: "100%",
                }}
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                padding: "0 10px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--ocean-900)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text)",
                fontSize: "var(--text-xs)",
                outline: "none",
              }}
            >
              <option value="all">Todas as Categorias</option>
              <option value="system">Sistema</option>
              <option value="fs">Filesystem</option>
              <option value="code">Código</option>
            </select>
          </div>

          {/* Cards das Ferramentas */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "600px", overflowY: "auto" }}>
            {filteredTools.map((t) => {
              const isSelected = t.id === selectedTool.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedTool(t);
                    setTestInput(t.name === "bash" ? "ls -la src/" : t.name === "grep" ? 'pattern="auth" path="src/"' : "path=package.json");
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: isSelected ? "var(--ocean-800)" : "var(--ocean-900)",
                    border: `1px solid ${isSelected ? "var(--blue-500)" : "var(--color-border)"}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all var(--duration-fast)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "rgba(38, 120, 255, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--blue-400)",
                        fontFamily: "var(--font-code)",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {t.name[0]}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)", fontFamily: "var(--font-code)" }}>
                          {t.name}
                        </span>
                        <Badge
                          variant={t.permission === "yolo" ? "success" : t.permission === "write" ? "warning" : "danger"}
                          size="sm"
                        >
                          {t.permission}
                        </Badge>
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        {t.invocationCount} invocações · média {t.avgDuration}
                      </span>
                    </div>
                  </div>

                  <CheckCircleIcon size={16} color="var(--state-success)" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Coluna Direita: Detalhes da Ferramenta & Console de Teste */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Card de Detalhes da Ferramenta */}
          <Card variant="raised" padding="md">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--color-text)", fontFamily: "var(--font-code)" }}>
                    {selectedTool.name}
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>
                    {selectedTool.description}
                  </p>
                </div>
              </div>

              {/* Nível de Permissão */}
              <div>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                  Modo de Aprovação:
                </span>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  {(["yolo", "write", "always-ask"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleUpdatePermission(mode)}
                      style={{
                        padding: "5px 12px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: selectedTool.permission === mode ? "var(--blue-selected)" : "var(--ocean-950)",
                        border: `1px solid ${selectedTool.permission === mode ? "var(--blue-400)" : "var(--color-border)"}`,
                        color: selectedTool.permission === mode ? "var(--color-text)" : "var(--color-text-muted)",
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {mode === "yolo" ? "YOLO (Auto-Aprovar)" : mode === "write" ? "Write (Aprovar Mutações)" : "Always Ask (Sempre Perguntar)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Parâmetros */}
              {selectedTool.parameters && (
                <div style={{ marginTop: "4px" }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase" }}>
                    Parâmetros Aceitos:
                  </span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                    {selectedTool.parameters.map((p, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "var(--ocean-950)",
                          fontFamily: "var(--font-code)",
                          fontSize: "var(--text-xs)",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ color: "var(--blue-400)", fontWeight: 600 }}>{p.name}</span>
                          <span style={{ color: "var(--color-text-muted)" }}>({p.type})</span>
                          {p.required && <span style={{ color: "var(--state-danger)", fontSize: "10px" }}>*obrigatório</span>}
                        </div>
                        <span style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-ui)" }}>{p.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Console de Teste Interativo */}
          <Card variant="raised" padding="md">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
                  Console de Execução Simulada
                </span>
                <span style={{ fontSize: "11px", color: "var(--state-success)", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--state-success)" }} />
                  Terminal Ativo
                </span>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder={`Argumentos para ${selectedTool.name}...`}
                  style={{
                    flex: 1,
                    height: "36px",
                    padding: "0 12px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--ocean-950)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    fontSize: "var(--text-sm)",
                    fontFamily: "var(--font-code)",
                    outline: "none",
                  }}
                />
                <Button
                  variant="primary"
                  loading={isExecuting}
                  icon={<PlayIcon size={12} />}
                  onClick={handleExecuteSimulated}
                >
                  Executar
                </Button>
              </div>

              {/* Terminal Output */}
              <div
                style={{
                  marginTop: "6px",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--ocean-950)",
                  border: "1px solid var(--color-border)",
                  fontFamily: "var(--font-code)",
                  fontSize: "11px",
                  color: "var(--color-text-secondary)",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  minHeight: "120px",
                  maxHeight: "220px",
                  overflowY: "auto",
                }}
              >
                {consoleOutput}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
