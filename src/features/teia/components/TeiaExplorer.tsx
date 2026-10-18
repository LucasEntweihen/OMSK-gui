import React from "react";
import type { TeiaNode } from "@/services/teiaEngine";
import { PlusIcon, SearchIcon, SettingsIcon, FolderIcon } from "@/components/icons";

export interface TeiaExplorerProps {
  nodes: TeiaNode[];
  ghostNodes: TeiaNode[];
  activeNodeId: string | null;
  onOpenNode: (id: string) => void;
  onOpenGhost: (title: string) => void;
  onNewNote: () => void;
  vaultPath: string;
  onChangeVaultPath: () => void;
  totalNotes: number;
  totalEdges: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const TYPE_GLYPH_COLOR: Record<string, string> = {
  concept: "var(--teia-node-concept)",
  technology: "var(--teia-node-tech)",
  decision: "var(--teia-node-decision)",
  project: "var(--teia-node-project)",
  memory: "var(--teia-node-memory)",
  preference: "var(--teia-node-pref)",
  problem: "var(--teia-node-problem)",
  solution: "var(--teia-node-solution)",
  idea: "var(--teia-node-idea)",
  reference: "var(--teia-node-ref)",
  ghost: "var(--teia-node-ghost)",
};

export const TeiaExplorer: React.FC<TeiaExplorerProps> = ({
  nodes,
  ghostNodes,
  activeNodeId,
  onOpenNode,
  onOpenGhost,
  onNewNote,
  vaultPath,
  onChangeVaultPath,
  totalNotes,
  totalEdges,
  searchQuery,
  onSearchChange,
}) => {
  const [filterTab, setFilterTab] = React.useState<"all" | "hubs" | "ghosts">("all");

  const filteredNodes = React.useMemo(() => {
    let base = nodes.filter((n) => !n.ghost);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      base = base.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.type.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filterTab === "hubs") {
      return base.filter((n) => (n.degree ?? 0) >= 2 || n.hub);
    }

    return base;
  }, [nodes, searchQuery, filterTab]);

  const pathDisplay = vaultPath.split(/[/\\]/).pop() || "Mente em Teia";

  return (
    <aside
      className="teia-explorer"
      style={{
        width: "260px",
        backgroundColor: "var(--teia-p1)",
        borderRight: "1px solid var(--teia-line)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100%",
        userSelect: "none",
      }}
    >
      {/* 1. Header do Vault no Desktop */}
      <div
        style={{
          padding: "12px 14px",
          borderBottom: "1px solid var(--teia-line)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "var(--teia-accent)", fontSize: "11px" }}>◉</span>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--teia-text-bright)",
                letterSpacing: "0.5px",
                fontFamily: "var(--teia-font-mono)",
              }}
            >
              VAULT FÍSICO
            </span>
          </div>

          <button
            onClick={onChangeVaultPath}
            title={`Alterar pasta física do Vault (${vaultPath})`}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--teia-muted)",
              cursor: "pointer",
              padding: "2px",
              display: "flex",
              borderRadius: "var(--teia-r-xs)",
              transition: "color 100ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--teia-accent-hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--teia-muted)")}
          >
            <SettingsIcon size={13} />
          </button>
        </div>

        {/* Caminho Curto do Vault */}
        <div
          onClick={onChangeVaultPath}
          title={vaultPath}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 8px",
            borderRadius: "var(--teia-r-xs)",
            backgroundColor: "var(--teia-void)",
            border: "1px solid var(--teia-line-subtle)",
            fontSize: "11px",
            color: "var(--teia-muted)",
            cursor: "pointer",
            overflow: "hidden",
          }}
        >
          <FolderIcon size={12} color="var(--teia-accent)" />
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontFamily: "var(--teia-font-mono)",
            }}
          >
            {pathDisplay}
          </span>
        </div>

        {/* Botão de Criação de Nova Nota */}
        <button
          onClick={onNewNote}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "var(--teia-r-sm)",
            backgroundColor: "var(--teia-accent-active)",
            border: "1px solid var(--teia-accent)",
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 120ms ease-out",
            boxShadow: "0 2px 8px rgba(122, 130, 230, 0.25)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--teia-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--teia-accent-active)")}
        >
          <PlusIcon size={13} />
          <span>Nova Nota</span>
        </button>

        {/* Campo de Busca Rápida */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 8px",
            borderRadius: "var(--teia-r-sm)",
            backgroundColor: "var(--teia-void)",
            border: "1px solid var(--teia-line)",
          }}
        >
          <SearchIcon size={12} color="var(--teia-muted)" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar notas ou #tags..."
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--teia-text)",
              fontSize: "11px",
              fontFamily: "var(--teia-font-ui)",
            }}
          />
        </div>

        {/* Abas de Filtro da Lista */}
        <div
          style={{
            display: "flex",
            gap: "2px",
            backgroundColor: "var(--teia-void)",
            padding: "2px",
            borderRadius: "var(--teia-r-xs)",
            border: "1px solid var(--teia-line)",
          }}
        >
          {(
            [
              { id: "all", label: `Todas (${nodes.filter((n) => !n.ghost).length})` },
              { id: "hubs", label: "Hubs" },
              { id: "ghosts", label: `Pendentes (${ghostNodes.length})` },
            ] as const
          ).map((tab) => {
            const active = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "3px 0",
                  borderRadius: "var(--teia-r-xs)",
                  backgroundColor: active ? "var(--teia-p2)" : "transparent",
                  color: active ? "var(--teia-text-bright)" : "var(--teia-muted)",
                  border: "none",
                  fontSize: "10px",
                  fontWeight: active ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 100ms",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Lista de Notas / Nós */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px" }}>
        {filterTab === "ghosts" ? (
          // Visualização de Nós Fantasmas
          ghostNodes.length === 0 ? (
            <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--teia-muted)", fontSize: "11px", lineHeight: 1.5 }}>
              Nenhum nó pendente. Todos os links citados em wikilinks já existem fisicamente.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {ghostNodes.map((g) => (
                <div
                  key={g.id}
                  onClick={() => onOpenGhost(g.title)}
                  title="Nota citada em wikilinks [[...]] mas ainda não escrita. Clique para criar o arquivo Markdown."
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    borderRadius: "var(--teia-r-xs)",
                    backgroundColor: "transparent",
                    color: "var(--teia-muted)",
                    borderLeft: "2px solid transparent",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontStyle: "italic",
                    transition: "all 100ms",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--teia-p2)";
                    e.currentTarget.style.color = "var(--teia-text-bright)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--teia-muted)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                    <span style={{ color: "var(--teia-faint)", fontSize: "10px" }}>◌</span>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {g.title}
                    </span>
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--teia-accent-hover)" }}>+ Criar</span>
                </div>
              ))}
            </div>
          )
        ) : filteredNodes.length === 0 ? (
          <div style={{ padding: "24px 12px", textAlign: "center", color: "var(--teia-muted)", fontSize: "11px", lineHeight: 1.5 }}>
            {searchQuery ? "Nenhuma nota encontrada com esse filtro" : "Vault inicializado vazio no Desktop. Escreva sua primeira anotação."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {filteredNodes.map((n) => {
              const isActive = activeNodeId === n.id;
              const glyphColor = TYPE_GLYPH_COLOR[n.type] || "var(--teia-accent)";

              return (
                <div
                  key={n.id}
                  onClick={() => onOpenNode(n.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "6px 8px",
                    borderRadius: "var(--teia-r-xs)",
                    backgroundColor: isActive ? "var(--teia-p3)" : "transparent",
                    color: isActive ? "var(--teia-text-bright)" : "var(--teia-text)",
                    borderLeft: isActive ? "2px solid var(--teia-accent)" : "2px solid transparent",
                    cursor: "pointer",
                    fontSize: "12px",
                    transition: "background-color 100ms",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "var(--teia-p2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                    <span style={{ fontSize: "10px", color: glyphColor }}>
                      {n.trust === "AI_GENERATED" ? "✦" : "●"}
                    </span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {n.title}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                    {n.degree !== undefined && n.degree > 0 && (
                      <span
                        style={{
                          fontSize: "9px",
                          color: "var(--teia-muted)",
                          fontFamily: "var(--teia-font-mono)",
                          backgroundColor: "var(--teia-void)",
                          padding: "1px 5px",
                          borderRadius: "var(--teia-r-full)",
                        }}
                      >
                        {n.degree}
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--teia-faint)",
                        fontFamily: "var(--teia-font-mono)",
                      }}
                    >
                      {n.type.slice(0, 4)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Rodapé do Explorer com Métricas */}
      <div
        style={{
          padding: "8px 12px",
          borderTop: "1px solid var(--teia-line)",
          fontSize: "11px",
          color: "var(--teia-muted)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "var(--teia-font-mono)",
          backgroundColor: "var(--teia-void)",
        }}
      >
        <span>{totalNotes} notas</span>
        <span>{totalEdges} conexões</span>
      </div>
    </aside>
  );
};
