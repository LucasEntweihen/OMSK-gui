import React from "react";
import {
  ContextIcon,
  SearchIcon,
  FolderIcon,
  FileIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { useContextStore, type SystemRule } from "@/store/useContextStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { FolderPickerModal } from "@/components/layout/FolderPickerModal";
import type { ContextFileItem, ContextAvailability } from "@/types";

export const ContextPage: React.FC = () => {
  const {
    files,
    rules,
    filterSearch,
    setFilterSearch,
    selectedScope,
    isNativeDirectory,
    cycleAvailability,
    toggleDirectoryExpand,
    toggleRule,
  } = useContextStore();

  const [activeTab, setActiveTab] = React.useState<"files" | "rules">("files");
  const [isFolderModalOpen, setIsFolderModalOpen] = React.useState(false);

  const allFlattened = flattenFiles(files);
  const stats = {
    available: allFlattened.filter((f) => f.availability === "available").length,
    selected: allFlattened.filter((f) => f.availability === "selected").length,
    used: allFlattened.filter((f) => f.availability === "effectively_used").length,
  };

  return (
    <div
      className="oms-context-page"
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
            <ContextIcon size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 800, color: "var(--color-text)" }}>
                Contexto de Trabalho
              </h1>
              {isNativeDirectory && (
                <Badge variant="success" size="sm" dot>
                  Pasta Local Conectada
                </Badge>
              )}
            </div>
            <p style={{ margin: "2px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)" }}>
              Diretório ativo: <code style={{ color: "var(--color-text-secondary)" }}>{selectedScope}</code>
            </p>
          </div>
        </div>

        {/* Botão de Seleção Nativa de Pasta do OS */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button
            variant="primary"
            icon={<FolderIcon size={15} />}
            onClick={() => setIsFolderModalOpen(true)}
          >
            Selecionar Pasta no Computador
          </Button>

          {/* Tab Switcher */}
          <div style={{ display: "flex", gap: "4px", backgroundColor: "var(--ocean-900)", padding: "4px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <button
              onClick={() => setActiveTab("files")}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: activeTab === "files" ? "var(--blue-selected)" : "transparent",
                color: activeTab === "files" ? "var(--color-text)" : "var(--color-text-muted)",
                border: "none",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Arquivos ({allFlattened.length})
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: activeTab === "rules" ? "var(--blue-selected)" : "transparent",
                color: activeTab === "rules" ? "var(--color-text)" : "var(--color-text-muted)",
                border: "none",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Regras ({rules.filter((r) => r.status === "active").length})
            </button>
          </div>
        </div>
      </div>

      {/* Regra de Integridade do Contexto */}
      <Card variant="raised" padding="md">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--blue-400)" }}>
              Integridade do Escopo de Contexto
            </span>
          </div>

          <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
            O Oh My Shark distingue com rigor as três condições de cada arquivo: <strong>Disponível</strong> (presente na máquina), <strong>Selecionado</strong> (incluído no escopo de atenção) e <strong>Efetivamente Utilizado</strong> (processado no turno ativo). Clique nos badges para alternar.
          </p>

          <div style={{ display: "flex", gap: "16px", marginTop: "4px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Badge variant="default" size="sm">Disponível</Badge>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-code)" }}>{stats.available} arquivos</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Badge variant="primary" size="sm">Selecionado</Badge>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-code)" }}>{stats.selected} arquivos</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Badge variant="success" size="sm">Efetivamente Utilizado</Badge>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-code)" }}>{stats.used} arquivos</span>
            </div>
          </div>
        </div>
      </Card>

      
      {/* Barra de Controles Rápidos e Ações em Lote do Contexto */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", padding: "12px 16px", backgroundColor: "var(--ocean-900)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-text)" }}>
            Ações de Escopo:
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                allFlattened.forEach((f) => {
                  if (f.availability !== "selected") cycleAvailability(f.id);
                });
              }}
            >
              Selecionar Todos
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                allFlattened.forEach((f) => {
                  if (f.availability === "selected") cycleAvailability(f.id);
                });
              }}
            >
              Limpar Seleção
            </Button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "var(--text-xs)" }}>
          <span style={{ color: "var(--color-text-muted)" }}>
            Ocupação estimada do Contexto: <strong style={{ color: "var(--blue-400)" }}>{Math.round((stats.selected / (allFlattened.length || 1)) * 100)}%</strong>
          </span>
        </div>
      </div>

      {/* Busca de Arquivos ou Regras */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "8px 14px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--ocean-900)",
          border: "1px solid var(--color-border)",
        }}
      >
        <SearchIcon size={14} color="var(--color-text-muted)" />
        <input
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder={activeTab === "files" ? "Filtrar caminhos..." : "Filtrar regras..."}
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

      {/* Conteúdo: Arquivos ou Regras */}
      {activeTab === "files" ? (
        <Card variant="raised" padding="sm">
          <div style={{ display: "flex", flexDirection: "column" }}>
            {files.map((item) => (
              <FileTreeNode
                key={item.id}
                item={item}
                depth={0}
                filterSearch={filterSearch}
                onToggleExpand={toggleDirectoryExpand}
                onCycleAvailability={cycleAvailability}
              />
            ))}
          </div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {rules
            .filter((r) => r.title.toLowerCase().includes(filterSearch.toLowerCase()) || r.description.toLowerCase().includes(filterSearch.toLowerCase()))
            .map((rule) => (
              <RuleItemCard key={rule.id} rule={rule} onToggle={toggleRule} />
            ))}
        </div>
      )}

      {/* Modal de Seleção de Pasta */}
      <FolderPickerModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
      />
    </div>
  );
};

interface FileTreeNodeProps {
  item: ContextFileItem;
  depth: number;
  filterSearch: string;
  onToggleExpand: (id: string) => void;
  onCycleAvailability: (id: string) => void;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  item,
  depth,
  filterSearch,
  onToggleExpand,
  onCycleAvailability,
}) => {
  const isDir = item.type === "directory";

  if (filterSearch && !item.name.toLowerCase().includes(filterSearch.toLowerCase())) {
    if (!item.children || item.children.every((c) => !c.name.toLowerCase().includes(filterSearch.toLowerCase()))) {
      return null;
    }
  }

  const availabilityBadges: Record<ContextAvailability, { variant: "default" | "primary" | "success"; label: string }> = {
    available: { variant: "default", label: "Disponível" },
    selected: { variant: "primary", label: "Selecionado" },
    effectively_used: { variant: "success", label: "Efetivamente Utilizado" },
  };

  const badgeConfig = availabilityBadges[item.availability];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          paddingLeft: `${depth * 18 + 12}px`,
          borderRadius: "var(--radius-sm)",
          fontSize: "var(--text-sm)",
          fontFamily: "var(--font-code)",
          transition: "background-color var(--duration-fast)",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--ocean-800)")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <div
          onClick={() => isDir && onToggleExpand(item.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: isDir ? "pointer" : "default",
            color: isDir ? "#F4B84A" : "var(--color-text)",
            flex: 1,
          }}
        >
          {isDir ? (
            item.isExpanded ? <ChevronDownIcon size={13} /> : <ChevronRightIcon size={13} />
          ) : (
            <span style={{ width: "13px" }} />
          )}

          {isDir ? <FolderIcon size={15} color="#F4B84A" /> : <FileIcon size={15} color="var(--blue-400)" />}

          <span style={{ fontWeight: isDir ? 700 : 500 }}>{item.name}</span>

          {item.size && (
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>({item.size})</span>
          )}
        </div>

        <Badge
          variant={badgeConfig.variant}
          size="sm"
          onClick={() => onCycleAvailability(item.id)}
        >
          {badgeConfig.label}
        </Badge>
      </div>

      {isDir && item.isExpanded && item.children && (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {item.children.map((child) => (
            <FileTreeNode
              key={child.id}
              item={child}
              depth={depth + 1}
              filterSearch={filterSearch}
              onToggleExpand={onToggleExpand}
              onCycleAvailability={onCycleAvailability}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RuleItemCard: React.FC<{ rule: SystemRule; onToggle: (id: string) => void }> = ({ rule, onToggle }) => {
  return (
    <Card variant="raised" padding="md">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
              {rule.title}
            </span>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)", fontFamily: "var(--font-code)" }}>
              {rule.source}
            </span>
          </div>

          <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", lineHeight: 1.4 }}>
            {rule.description}
          </p>
        </div>

        <Toggle
          checked={rule.status === "active"}
          onChange={() => onToggle(rule.id)}
        />
      </div>
    </Card>
  );
};

function flattenFiles(items: readonly ContextFileItem[]): ContextFileItem[] {
  let list: ContextFileItem[] = [];
  for (const item of items) {
    list.push(item);
    if (item.children) {
      list = list.concat(flattenFiles(item.children));
    }
  }
  return list;
}
