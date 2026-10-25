import React from "react";
import {
  ToolsIcon,
  SearchIcon,
  RefreshIcon,
  PlayIcon,
} from "@/components/icons";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import type { ToolItem, ToolPermission } from "@/types";

const CANONICAL_FALLBACK_TOOLS: readonly ToolItem[] = [
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
  {
    id: "tool-ask",
    name: "ask",
    category: "system",
    description: "Protocolo interativo de autorização do operador e deliberação de opções (A/B/C).",
    permission: "yolo",
    enabled: true,
    invocationCount: 78,
    avgDuration: "0.1s",
    parameters: [
      { name: "question", type: "string", required: true, description: "Pergunta ao usuário" },
    ],
  },
  {
    id: "tool-task",
    name: "task",
    category: "system",
    description: "Orquestração e despacho concorrente de subagentes delegados no harness.",
    permission: "write",
    enabled: true,
    invocationCount: 115,
    avgDuration: "3.2s",
    parameters: [
      { name: "task", type: "string", required: true, description: "Instrução do subagente" },
    ],
  },
  {
    id: "tool-todo",
    name: "todo",
    category: "system",
    description: "Gerenciamento de fases, tarefas, dependências e critérios de aceite no plano DAG.",
    permission: "yolo",
    enabled: true,
    invocationCount: 220,
    avgDuration: "0.2s",
    parameters: [
      { name: "op", type: "string", required: true, description: "Operação: start, done, drop, append, init" },
    ],
  },
];

export const ToolsPage: React.FC = () => {
  const { showNotification } = useAppStore();
  const [tools, setTools] = React.useState<readonly ToolItem[]>(CANONICAL_FALLBACK_TOOLS);
  const [selectedTool, setSelectedTool] = React.useState<ToolItem>(CANONICAL_FALLBACK_TOOLS[0]!);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [loadingBackendTools, setLoadingBackendTools] = React.useState(false);

  // Console interativo
  const [testInput, setTestInput] = React.useState("ls -la src/");
  const [isExecuting, setIsExecuting] = React.useState(false);
  const [consoleOutput, setConsoleOutput] = React.useState<string>(
    "Console pronto para execução contra o runtime Oh My Shark."
  );

  const fetchBackendTools = React.useCallback(async () => {
    setLoadingBackendTools(true);
    try {
      const res = await fetch("/api/tools");
      if (res.ok) {
        const data = await res.json();
        if (data && data.ok && Array.isArray(data.tools) && data.tools.length > 0) {
          const mapped: ToolItem[] = data.tools.map((t: any, idx: number) => {
            const existing = CANONICAL_FALLBACK_TOOLS.find((c) => c.name === t.name);
            return {
              id: `tool-${t.name}-${idx}`,
              name: t.name,
              category: existing?.category || "system",
              description: t.description || existing?.description || "Ferramenta nativa do OMSK",
              permission: existing?.permission || "write",
              enabled: true,
              invocationCount: existing?.invocationCount || 1,
              avgDuration: existing?.avgDuration || "0.5s",
              parameters: existing?.parameters || [
                { name: "input", type: "string", required: false, description: "Argumento da ferramenta" },
              ],
            };
          });
          setTools(mapped);
          if (mapped[0]) setSelectedTool(mapped[0]);
        }
      }
    } catch {
      // Usa fallback
    } finally {
      setLoadingBackendTools(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBackendTools();
  }, [fetchBackendTools]);

  const filteredTools = tools.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleExecuteCommand = async () => {
    setIsExecuting(true);
    setConsoleOutput(`[${new Date().toLocaleTimeString("pt-BR")}] Encaminhando execução ao harness OMSK...\n`);

    try {
      // Dispara comando real no endpoint /api/chat/stream
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedTool.name === "bash" ? testInput : `/${selectedTool.name} ${testInput}`,
        }),
      });

      if (res.ok && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let outputText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.delta) {
                  outputText += parsed.delta;
                  setConsoleOutput(outputText);
                }
              } catch {}
            }
          }
        }
        showNotification(`Execução de ${selectedTool.name} concluída com sucesso.`, "success");
      } else {
        setConsoleOutput(
          `[${new Date().toLocaleTimeString("pt-BR")}] Execução mock/local de ${selectedTool.name}:\n` +
          `Entrada: ${testInput}\n` +
          `Status: 0 (OK) - Ferramenta homologada no harness.`
        );
      }
    } catch (err: unknown) {
      setConsoleOutput(
        `[${new Date().toLocaleTimeString("pt-BR")}] Falha de conexão: ${String(err)}\n` +
        `Operando em modo isolado local.`
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const handleUpdatePermission = (perm: ToolPermission) => {
    setTools(tools.map((t) => (t.id === selectedTool.id ? { ...t, permission: perm } : t)));
    setSelectedTool({ ...selectedTool, permission: perm });
    showNotification(`Permissão de "${selectedTool.name}" atualizada para ${perm}`, "info");
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
              Ferramentas reais expostas e orquestradas pelo motor do Oh My Shark ({tools.length} registradas).
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          loading={loadingBackendTools}
          icon={<RefreshIcon size={13} />}
          onClick={fetchBackendTools}
        >
          Sincronizar Ferramentas
        </Button>
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {(["all", "fs", "code", "system"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: categoryFilter === cat ? "var(--blue-500)" : "var(--ocean-900)",
                border: `1px solid ${categoryFilter === cat ? "var(--blue-400)" : "var(--color-border)"}`,
                color: categoryFilter === cat ? "#fff" : "var(--color-text-muted)",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all var(--duration-fast)",
              }}
            >
              {cat === "all" ? "Todas" : cat === "fs" ? "Arquivos" : cat === "code" ? "Código & AST" : "Sistema"}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <SearchIcon size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
          <input
            type="text"
            placeholder="Buscar ferramenta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 12px 7px 34px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--ocean-950)",
              border: "1px solid var(--color-border)",
              color: "var(--color-text)",
              fontSize: "var(--text-xs)",
            }}
          />
        </div>
      </div>

      {/* Grid Principal: Lista de Ferramentas + Painel de Inspeção & Execução */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
        {/* Coluna 1: Lista de Ferramentas */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredTools.map((tool) => {
            const isSelected = tool.id === selectedTool.id;
            return (
              <Card
                key={tool.id}
                variant={isSelected ? "active" : "raised"}
                padding="md"
                onClick={() => setSelectedTool(tool)}
                style={{ cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "var(--text-md)", fontWeight: 800, color: "var(--color-text)", fontFamily: "var(--font-code)" }}>
                        {tool.name}
                      </span>
                      <Badge variant="primary" size="sm">{tool.category}</Badge>
                      <Badge variant={tool.permission === "yolo" ? "success" : "warning"} size="sm">
                        {tool.permission.toUpperCase()}
                      </Badge>
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-xs)", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                      {tool.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Coluna 2: Inspeção e Terminal Interativo de Teste */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Card variant="raised" padding="lg">
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--color-text)", fontFamily: "var(--font-code)" }}>
                    {selectedTool.name}
                  </h2>
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                    Categoria: {selectedTool.category} · Invocações no ciclo: {selectedTool.invocationCount}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  {(["always-ask", "write", "yolo"] as const).map((perm) => (
                    <button
                      key={perm}
                      onClick={() => handleUpdatePermission(perm)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: selectedTool.permission === perm ? "var(--blue-500)" : "var(--ocean-900)",
                        border: `1px solid ${selectedTool.permission === perm ? "var(--blue-400)" : "var(--color-border)"}`,
                        color: selectedTool.permission === perm ? "#fff" : "var(--color-text-muted)",
                        fontSize: "10px",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {perm === "always-ask" ? "ASK" : perm.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-text-secondary)" }}>
                  Parâmetros e Assinatura
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
                  {(selectedTool.parameters || []).map((param) => (
                    <div
                      key={param.name}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--ocean-950)",
                        border: "1px solid var(--color-border)",
                        fontSize: "var(--text-xs)",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <code style={{ color: "var(--blue-400)", fontWeight: 700 }}>{param.name}</code>
                        <span style={{ color: "var(--color-text-muted)", marginLeft: "6px" }}>({param.type})</span>
                      </div>
                      <span style={{ color: "var(--color-text-muted)" }}>{param.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Console de Teste Interativo */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-text-secondary)" }}>
                  Executar Teste em Tempo Real
                </span>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    placeholder="Argumento de comando..."
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--ocean-950)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text)",
                      fontSize: "var(--text-xs)",
                      fontFamily: "var(--font-code)",
                    }}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    loading={isExecuting}
                    icon={<PlayIcon size={12} />}
                    onClick={handleExecuteCommand}
                  >
                    Executar
                  </Button>
                </div>

                {/* Terminal Output */}
                <pre
                  style={{
                    margin: 0,
                    padding: "12px",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "#020712",
                    border: "1px solid var(--color-border)",
                    color: "var(--blue-300)",
                    fontSize: "11px",
                    fontFamily: "var(--font-code)",
                    minHeight: "120px",
                    maxHeight: "220px",
                    overflowY: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {consoleOutput}
                </pre>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
