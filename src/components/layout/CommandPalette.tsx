import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  SearchIcon,
  ChatIcon,
  WebNetIcon,
  TasksIcon,
  ContextIcon,
  ToolsIcon,
  ProvidersIcon,
  SettingsIcon,
  SystemPromptIcon,
  SpecificationsIcon,
  AgentsIcon,
  AnalyticsIcon,
  CloseIcon,
  CheckIcon,
} from "@/components/icons";
import { useAppStore, AVAILABLE_MODELS } from "@/store/useAppStore";
import { useChatStore } from "@/store/useChatStore";

interface CommandItem {
  id: string;
  title: string;
  category: "Navegação" | "Ações Rápidas" | "Modelos";
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    toggleSidebar,
    toggleInspector,
    setActiveModel,
    showNotification,
  } = useAppStore();
  const { clearMessages, resetToInitial } = useChatStore();

  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd+K / Ctrl+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  React.useEffect(() => {
    if (commandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const commands: readonly CommandItem[] = [
    // Navegação
    { id: "nav-chat", title: "Ir para Chat Interativo", category: "Navegação", icon: <ChatIcon size={16} />, action: () => navigate("/") },
    { id: "nav-teia", title: "Ir para Mente em Teia (Grafo Obsidian)", category: "Navegação", icon: <WebNetIcon size={16} />, action: () => navigate("/teia") },
    { id: "nav-tasks", title: "Ir para Tarefas & Execuções", category: "Navegação", icon: <TasksIcon size={16} />, action: () => navigate("/tasks") },
    { id: "nav-context", title: "Ir para Contexto do Projeto", category: "Navegação", icon: <ContextIcon size={16} />, action: () => navigate("/context") },
    { id: "nav-tools", title: "Ir para Catálogo de Ferramentas", category: "Navegação", icon: <ToolsIcon size={16} />, action: () => navigate("/tools") },
    { id: "nav-providers", title: "Ir para Provedores & Modelos", category: "Navegação", icon: <ProvidersIcon size={16} />, action: () => navigate("/providers") },
    { id: "nav-settings", title: "Ir para Configurações", category: "Navegação", icon: <SettingsIcon size={16} />, action: () => navigate("/settings") },
    { id: "nav-prompt", title: "Ir para Editor de System Prompt", category: "Navegação", icon: <SystemPromptIcon size={16} />, action: () => navigate("/system-prompt") },
    { id: "nav-specs", title: "Ir para Especificações de Arquitetura", category: "Navegação", icon: <SpecificationsIcon size={16} />, action: () => navigate("/specifications") },
    { id: "nav-agents", title: "Ir para Hub de Especialistas", category: "Navegação", icon: <AgentsIcon size={16} />, action: () => navigate("/agents") },
    { id: "nav-analytics", title: "Ir para Dashboard Analítico", category: "Navegação", icon: <AnalyticsIcon size={16} />, action: () => navigate("/analytics") },

    // Ações Rápidas
    { id: "act-toggle-sidebar", title: "Alternar Barra Lateral", category: "Ações Rápidas", icon: <SearchIcon size={16} />, action: () => toggleSidebar() },
    { id: "act-toggle-inspector", title: "Alternar Painel Contextual", category: "Ações Rápidas", icon: <SearchIcon size={16} />, action: () => toggleInspector() },
    { id: "act-clear-chat", title: "Limpar Histórico do Chat", category: "Ações Rápidas", icon: <CloseIcon size={16} />, action: () => { clearMessages(); showNotification("Histórico limpo com sucesso", "info"); } },
    { id: "act-reset-chat", title: "Restaurar Mensagens de Demonstração", category: "Ações Rápidas", icon: <CheckIcon size={16} />, action: () => { resetToInitial(); showNotification("Mensagens restauradas", "success"); } },

    // Modelos
    ...AVAILABLE_MODELS.map((model) => ({
      id: `model-${model.id}`,
      title: `Selecionar Modelo: ${model.name} (${model.provider})`,
      category: "Modelos" as const,
      icon: <ProvidersIcon size={16} />,
      action: () => {
        setActiveModel(model);
        showNotification(`Modelo ativo alterado para ${model.name}`, "success");
      },
    })),
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
    } else if (e.key === "Enter" && filteredCommands[selectedIndex]) {
      e.preventDefault();
      filteredCommands[selectedIndex]!.action();
      setCommandPaletteOpen(false);
    } else if (e.key === "Escape") {
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2000,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingTop: "14vh",
        }}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setCommandPaletteOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(2, 10, 22, 0.75)",
            backdropFilter: "blur(6px)",
          }}
        />

        {/* Palette Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "560px",
            backgroundColor: "var(--ocean-900)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-dialog)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Search Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "14px 18px",
              borderBottom: "1px solid var(--color-border)",
              backgroundColor: "var(--ocean-850)",
            }}
          >
            <SearchIcon size={16} color="var(--blue-400)" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Buscar comando ou destino..."
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--color-text)",
                fontSize: "var(--text-sm)",
                fontFamily: "var(--font-ui)",
              }}
            />
          </div>

          {/* Results List */}
          <div style={{ maxHeight: "360px", overflowY: "auto", padding: "6px" }}>
            {filteredCommands.length === 0 ? (
              <div style={{ padding: "28px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--text-xs)" }}>
                Nenhum comando encontrado para "{query}"
              </div>
            ) : (
              filteredCommands.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      item.action();
                      setCommandPaletteOpen(false);
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isSelected ? "var(--blue-selected)" : "transparent",
                      color: isSelected ? "var(--color-text)" : "var(--color-text-secondary)",
                      cursor: "pointer",
                      fontSize: "var(--text-xs)",
                      transition: "all var(--duration-fast)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: isSelected ? "var(--blue-400)" : "var(--color-text-muted)", display: "flex" }}>
                        {item.icon}
                      </span>
                      <span style={{ fontWeight: isSelected ? 600 : 500 }}>{item.title}</span>
                    </div>

                    <span
                      style={{
                        fontSize: "10px",
                        padding: "1px 6px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--ocean-800)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
