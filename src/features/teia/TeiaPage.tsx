import React from "react";
import { useTeiaStore } from "@/store/useTeiaStore";
import { useAppStore } from "@/store/useAppStore";
import { TeiaCanvas } from "./components/TeiaCanvas";
import { TeiaHoverCard } from "./components/TeiaHoverCard";
import { TeiaWorkspaceHeader } from "./components/TeiaWorkspaceHeader";
import { TeiaExplorer } from "./components/TeiaExplorer";
import { TeiaInspector } from "./components/TeiaInspector";
import { renderTeiaMarkdown, type TeiaNode, type TeiaNodeType } from "@/services/teiaEngine";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { pickNativeDirectory } from "@/services/nativeDirectoryPicker";
import { FolderIcon } from "@/components/icons";

export const TeiaPage: React.FC = () => {
  const {
    vaultInfo,
    graph,
    activeNode,
    selectedNodeId,
    viewMode,
    activeContextTab,
    searchQuery,
    draftContent,
    isDirty,
    isLoading,
    agentContextResult,
    loadVault,
    setVaultLocation,
    selectNode,
    openNode,
    saveCurrentNode,
    createNote,
    deleteCurrentNode,
    setViewMode,
    setActiveContextTab,
    setSearchQuery,
    setDraftContent,
    requestAgentContext,
  } = useTeiaStore();

  const { showNotification } = useAppStore();

  // Estados locais da página
  const [isNewNoteOpen, setIsNewNoteOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newType, setNewType] = React.useState<TeiaNodeType>("concept");
  const [newBody, setNewBody] = React.useState("");

  const [isVaultPathModalOpen, setIsVaultPathModalOpen] = React.useState(false);
  const [customVaultInput, setCustomVaultInput] = React.useState("");
  const [agentQuery, setAgentQuery] = React.useState("");
  const [isZen, setIsZen] = React.useState(false);
  const [typeFilter, setTypeFilter] = React.useState<TeiaNodeType | "all">("all");
  const [physicsRunning, setPhysicsRunning] = React.useState(true);

  // Hover preview state em Wikilinks [[...]]
  const [hoverNode, setHoverNode] = React.useState<TeiaNode | null>(null);
  const [hoverPos, setHoverPos] = React.useState({ x: 0, y: 0 });
  const [hoverVisible, setHoverVisible] = React.useState(false);

  React.useEffect(() => {
    loadVault();
  }, [loadVault]);

  // Tecla de atalho Ctrl+G ou Cmd+G para alternar Modo Foco Zen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setIsZen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCreateNote = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const id = await createNote(newTitle.trim(), newType, newBody.trim());
      setIsNewNoteOpen(false);
      setNewTitle("");
      setNewBody("");
      showNotification(`Nota criada no Desktop Vault: ${id}`, "success");
    } catch {
      showNotification("Erro ao criar nota no disco", "error");
    }
  };

  const handleSetVault = async () => {
    if (!customVaultInput.trim()) return;
    try {
      await setVaultLocation(customVaultInput.trim());
      setIsVaultPathModalOpen(false);
      showNotification("Local do Desktop Vault atualizado com sucesso", "success");
    } catch {
      showNotification("Erro ao alterar pasta do Vault", "error");
    }
  };

  const handlePickNativeFolder = async () => {
    try {
      const res = await pickNativeDirectory();
      if (res && res.folderPath) {
        await setVaultLocation(res.folderPath);
        setCustomVaultInput(res.folderPath);
        setIsVaultPathModalOpen(false);
        showNotification(`Vault conectado: ${res.folderPath}`, "success");
      }
    } catch {
      showNotification("Seleção de pasta cancelada ou não suportada pelo navegador.", "info");
    }
  };

  // Clique interativo em Wikilinks [[...]]
  const handleWikilinkClick = (e: React.MouseEvent<HTMLElement>) => {
    const target = (e.target as HTMLElement).closest("a.teia-wikilink");
    if (target) {
      e.preventDefault();
      const ref = decodeURIComponent((target as HTMLElement).dataset.ref || "");
      if (ref) {
        const found = graph.nodes.find(
          (n) => n.id === ref || n.title.toLowerCase() === ref.toLowerCase()
        );
        if (found) {
          if (found.ghost) {
            setNewTitle(found.title);
            setIsNewNoteOpen(true);
          } else {
            openNode(found.id);
          }
        } else {
          setNewTitle(ref);
          setIsNewNoteOpen(true);
        }
      }
    }
  };

  // Hover sobre Wikilinks [[...]] para exibir popover TeiaHoverCard
  const handlePreviewMouseOver = (e: React.MouseEvent<HTMLElement>) => {
    const target = (e.target as HTMLElement).closest("a.teia-wikilink");
    if (target) {
      const ref = decodeURIComponent((target as HTMLElement).dataset.ref || "");
      const found = graph.nodes.find(
        (n) => n.id === ref || n.title.toLowerCase() === ref.toLowerCase()
      );
      if (found) {
        const rect = target.getBoundingClientRect();
        setHoverNode(found);
        setHoverPos({ x: rect.left, y: rect.bottom });
        setHoverVisible(true);
      }
    }
  };

  const handlePreviewMouseOut = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("a.teia-wikilink")) {
      setHoverVisible(false);
    }
  };

  const ghostNodes = React.useMemo(() => graph.nodes.filter((n) => n.ghost), [graph.nodes]);

  return (
    <div
      className="oms-teia-page teia-environment"
      data-environment="teia"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        fontFamily: "var(--teia-font-ui)",
        color: "var(--teia-text)",
        backgroundColor: "var(--teia-void)",
        position: "relative",
      }}
    >
      {/* 1. HUD Superior Autônomo da Mente em Teia */}
      <TeiaWorkspaceHeader
        activeNode={activeNode}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isDirty={isDirty}
        isLoading={isLoading}
        onSave={saveCurrentNode}
        onDelete={deleteCurrentNode}
        onNewNote={() => setIsNewNoteOpen(true)}
        isZen={isZen}
        onToggleZen={() => setIsZen((prev) => !prev)}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        physicsRunning={physicsRunning}
        onTogglePhysics={() => setPhysicsRunning((prev) => !prev)}
      />

      {/* 2. Área Central de Trabalho com Estrutura Modular 3-Pane */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Painel Esquerdo: Desktop Vault Explorer (ocultado se Foco Zen estiver ativo) */}
        {!isZen && (
          <TeiaExplorer
            nodes={graph.nodes}
            ghostNodes={ghostNodes}
            activeNodeId={activeNode?.id || selectedNodeId}
            onOpenNode={(id) => openNode(id)}
            onOpenGhost={(title) => {
              setNewTitle(title);
              setIsNewNoteOpen(true);
            }}
            onNewNote={() => setIsNewNoteOpen(true)}
            vaultPath={vaultInfo?.vaultPath || "C:/Users/guerr/Desktop/Mente em Teia"}
            onChangeVaultPath={() => {
              setCustomVaultInput(vaultInfo?.vaultPath || "");
              setIsVaultPathModalOpen(true);
            }}
            totalNotes={vaultInfo?.totalNotes ?? 0}
            totalEdges={vaultInfo?.totalEdges ?? 0}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* Workspace Central: Grafo Estelar ou Editor / Preview Markdown */}
        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            height: "100%",
            backgroundColor: "var(--teia-base)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {viewMode === "graph" ? (
            <TeiaCanvas
              nodes={graph.nodes}
              edges={graph.edges}
              activeId={selectedNodeId || activeNode?.id}
              onSelect={(id) => selectNode(id)}
              onOpen={(id) => openNode(id)}
              onCreateEmpty={() => setIsNewNoteOpen(true)}
              typeFilter={typeFilter}
              physicsRunning={physicsRunning}
            />
          ) : viewMode === "split" ? (
            <div style={{ display: "flex", width: "100%", height: "100%" }}>
              {/* Editor Raw */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderRight: "1px solid var(--teia-line)",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    padding: "6px 16px",
                    backgroundColor: "var(--teia-void)",
                    borderBottom: "1px solid var(--teia-line)",
                    fontSize: "11px",
                    color: "var(--teia-muted)",
                    fontFamily: "var(--teia-font-mono)",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>MARKDOWN RAW</span>
                  <span>{draftContent.length} caracteres</span>
                </div>

                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  placeholder="Escreva Markdown, [[Wikilinks]] e relacao:: [[Alvo]]..."
                  spellCheck={false}
                  style={{
                    flex: 1,
                    width: "100%",
                    padding: "16px 20px",
                    backgroundColor: "var(--teia-base)",
                    color: "var(--teia-text)",
                    border: "none",
                    outline: "none",
                    fontFamily: "var(--teia-font-mono)",
                    fontSize: "13px",
                    lineHeight: 1.65,
                    resize: "none",
                  }}
                />
              </div>

              {/* Preview Renderizado com Wikilinks Interativos */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  backgroundColor: "var(--teia-p1)",
                }}
              >
                <div
                  style={{
                    padding: "6px 16px",
                    backgroundColor: "var(--teia-void)",
                    borderBottom: "1px solid var(--teia-line)",
                    fontSize: "11px",
                    color: "var(--teia-muted)",
                    fontFamily: "var(--teia-font-mono)",
                  }}
                >
                  <span>PREVIEW INTERATIVO</span>
                </div>

                <div
                  onClick={handleWikilinkClick}
                  onMouseOver={handlePreviewMouseOver}
                  onMouseOut={handlePreviewMouseOut}
                  style={{
                    flex: 1,
                    padding: "20px 28px",
                    overflowY: "auto",
                    fontSize: "14px",
                    lineHeight: 1.65,
                    color: "var(--teia-text)",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: renderTeiaMarkdown(draftContent, (ref) =>
                      graph.nodes.some(
                        (n) => !n.ghost && n.title.toLowerCase() === ref.toLowerCase()
                      )
                    ),
                  }}
                />
              </div>
            </div>
          ) : viewMode === "editor" ? (
            <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
              <div
                style={{
                  padding: "6px 16px",
                  backgroundColor: "var(--teia-void)",
                  borderBottom: "1px solid var(--teia-line)",
                  fontSize: "11px",
                  color: "var(--teia-muted)",
                  fontFamily: "var(--teia-font-mono)",
                }}
              >
                <span>EDITOR CIRÚRGICO</span>
              </div>

              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="Escreva Markdown, [[Wikilinks]] e relacao:: [[Alvo]]..."
                spellCheck={false}
                style={{
                  flex: 1,
                  width: "100%",
                  padding: "20px 28px",
                  backgroundColor: "var(--teia-base)",
                  color: "var(--teia-text)",
                  border: "none",
                  outline: "none",
                  fontFamily: "var(--teia-font-mono)",
                  fontSize: "13px",
                  lineHeight: 1.65,
                  resize: "none",
                }}
              />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
              <div
                style={{
                  padding: "6px 16px",
                  backgroundColor: "var(--teia-void)",
                  borderBottom: "1px solid var(--teia-line)",
                  fontSize: "11px",
                  color: "var(--teia-muted)",
                  fontFamily: "var(--teia-font-mono)",
                }}
              >
                <span>LEITOR OBSIDIAN-GRADE</span>
              </div>

              <div
                onClick={handleWikilinkClick}
                onMouseOver={handlePreviewMouseOver}
                onMouseOut={handlePreviewMouseOut}
                style={{
                  flex: 1,
                  maxWidth: "840px",
                  width: "100%",
                  margin: "0 auto",
                  padding: "32px 40px",
                  overflowY: "auto",
                  backgroundColor: "var(--teia-base)",
                  fontSize: "15px",
                  lineHeight: 1.75,
                  color: "var(--teia-text)",
                }}
                dangerouslySetInnerHTML={{
                  __html: renderTeiaMarkdown(draftContent, (ref) =>
                    graph.nodes.some(
                      (n) => !n.ghost && n.title.toLowerCase() === ref.toLowerCase()
                    )
                  ),
                }}
              />
            </div>
          )}
        </section>

        {/* Painel Direito: Inspetor Neural de Conhecimento (ocultado se Foco Zen estiver ativo) */}
        {!isZen && (
          <TeiaInspector
            activeNode={activeNode}
            activeTab={activeContextTab === "prop" ? "prop" : activeContextTab === "agent" ? "agent" : "ctx"}
            onTabChange={(tab) => setActiveContextTab(tab)}
            onOpenNode={(id) => openNode(id)}
            agentQuery={agentQuery}
            onAgentQueryChange={setAgentQuery}
            onRequestAgentContext={requestAgentContext}
            agentResult={agentContextResult}
            vaultPath={vaultInfo?.vaultPath || "C:/Users/guerr/Desktop/Mente em Teia"}
          />
        )}
      </div>

      {/* Popover Hover Card em Wikilinks [[...]] */}
      <TeiaHoverCard
        node={hoverNode}
        x={hoverPos.x}
        y={hoverPos.y}
        visible={hoverVisible}
      />

      {/* Modal: Nova Nota no Desktop Vault */}
      <Modal
        isOpen={isNewNoteOpen}
        onClose={() => setIsNewNoteOpen(false)}
        title="Criar Nota no Desktop Vault"
        subtitle="Armazena um novo arquivo Markdown permanente no seu computador."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsNewNoteOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleCreateNote}>
              Criar Nota
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateNote} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <Input
            label="Título da Nota"
            placeholder="Ex: Arquitetura de Cache, Regras de Design..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--teia-muted)" }}>
              Tipo Semântico do Nó
            </label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as TeiaNodeType)}
              style={{
                height: "36px",
                padding: "0 10px",
                borderRadius: "var(--teia-r-sm)",
                backgroundColor: "var(--teia-void)",
                border: "1px solid var(--teia-line)",
                color: "var(--teia-text)",
                fontSize: "13px",
                outline: "none",
              }}
            >
              <option value="concept">concept (Conceito)</option>
              <option value="technology">technology (Tecnologia)</option>
              <option value="project">project (Projeto)</option>
              <option value="decision">decision (Decisão)</option>
              <option value="problem">problem (Problema)</option>
              <option value="solution">solution (Solução)</option>
              <option value="idea">idea (Ideia)</option>
              <option value="reference">reference (Referência)</option>
              <option value="preference">preference (Preferência do Usuário)</option>
              <option value="memory">memory (Memória IA)</option>
            </select>
          </div>

          <Textarea
            label="Conteúdo Inicial (opcional)"
            placeholder="Use [[Wikilinks]] e relacao:: [[Alvo]]..."
            rows={4}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
          />
        </form>
      </Modal>

      {/* Modal: Configurar Pasta do Desktop Vault */}
      <Modal
        isOpen={isVaultPathModalOpen}
        onClose={() => setIsVaultPathModalOpen(false)}
        title="Local do Desktop Vault"
        subtitle="Pasta física do computador onde suas notas da Mente em Teia ficam salvas."
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsVaultPathModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSetVault}>
              Salvar Caminho
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "12px", color: "var(--teia-muted)" }}>Seletor Rápido:</span>
            <button
              onClick={handlePickNativeFolder}
              type="button"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "var(--teia-r-sm)",
                backgroundColor: "var(--teia-p2)",
                border: "1px solid var(--teia-line)",
                color: "var(--teia-text-bright)",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <FolderIcon size={14} color="#F4B84A" />
              <span>Abrir Seletor de Pastas do Windows</span>
            </button>
          </div>

          <Input
            label="Caminho Absoluto da Pasta no Disco"
            value={customVaultInput}
            onChange={(e) => setCustomVaultInput(e.target.value)}
            placeholder="Ex: C:/Users/guerr/Desktop/Mente em Teia"
          />

          <p style={{ margin: 0, fontSize: "11px", color: "var(--teia-muted)", lineHeight: 1.45 }}>
            Suas notas são arquivos Markdown puros. Você pode sincronizá-las diretamente com o Obsidian ou qualquer editor.
          </p>
        </div>
      </Modal>
    </div>
  );
};
