import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FolderIcon, FileIcon, ChevronRightIcon, RefreshIcon } from "@/components/icons";
import {
  pickNativeDirectory,
  browseLocalDirectory,
  fetchLocalTree,
  type BrowseDirectoryResponse,
} from "@/services/nativeDirectoryPicker";
import { useAppStore } from "@/store/useAppStore";
import { useContextStore } from "@/store/useContextStore";

export interface FolderPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FolderPickerModal: React.FC<FolderPickerModalProps> = ({ isOpen, onClose }) => {
  const { activeScope, showNotification } = useAppStore();
  const { setWorkspaceFiles } = useContextStore();

  const [loading, setLoading] = React.useState(false);
  const [browseData, setBrowseData] = React.useState<BrowseDirectoryResponse | null>(null);
  const [currentPath, setCurrentPath] = React.useState<string>(activeScope.replace(/^~\//, ""));

  const loadDirectory = React.useCallback(async (targetPath?: string) => {
    setLoading(true);
    try {
      const data = await browseLocalDirectory(targetPath);
      setBrowseData(data);
      setCurrentPath(data.currentDir);
    } catch {
      // Falha ao navegar
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      loadDirectory();
    }
  }, [isOpen, loadDirectory]);

  // Abertura com a interface nativa do Sistema Operacional (Windows Explorer)
  const handleNativePicker = async () => {
    setLoading(true);
    try {
      const result = await pickNativeDirectory();
      if (result) {
        try {
          await fetch("/api/fs/set-directory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: result.folderPath }),
          });
        } catch {}
        setWorkspaceFiles(result.folderPath, result.files, true);
        useAppStore.setState({ activeScope: result.folderPath });
        showNotification(`Pasta local conectada: ${result.folderName}`, "success");
        onClose();
      }
    } catch {
      showNotification("Não foi possível acessar a pasta via seletor nativo", "error");
    } finally {
      setLoading(false);
    }
  };

  // Selecionar o diretório atual do browser de servidor
  const handleSelectCurrentFolder = async () => {
    if (!browseData?.currentDir) return;
    setLoading(true);
    try {
      try {
        await fetch("/api/fs/set-directory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: browseData.currentDir }),
        });
      } catch {}

      const treeRes = await fetchLocalTree(browseData.currentDir);
      if (treeRes.success) {
        const displayPath = browseData.currentDir.replace(browseData.homedir, "~");
        setWorkspaceFiles(displayPath, treeRes.tree, true);
        useAppStore.setState({ activeScope: displayPath });
        showNotification(`Ambiente de trabalho alterado para: ${displayPath}`, "success");
        onClose();
      }
    } catch {
      showNotification("Erro ao carregar árvore do diretório", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Selecionar Diretório de Trabalho"
      subtitle="Escolha a pasta do seu computador onde o Oh My Shark irá atuar."
      maxWidth="640px"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSelectCurrentFolder} loading={loading}>
            Usar Pasta Atual
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Opção 1: Seletor Nativo do OS */}
        <div
          style={{
            padding: "16px",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--ocean-850)",
            border: "1px solid var(--blue-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
              Seletor Nativo do Sistema (Windows / Explorer)
            </span>
            <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
              Abre a janela nativa de seleção de pastas do seu sistema operacional.
            </p>
          </div>

          <Button variant="primary" icon={<FolderIcon size={16} />} onClick={handleNativePicker} loading={loading}>
            Selecionar no OS
          </Button>
        </div>

        {/* Separador */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
          <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", textTransform: "uppercase" }}>
            Ou Navegue pelas Pastas da Máquina
          </span>
          <div style={{ flex: 1, height: "1px", backgroundColor: "var(--color-border)" }} />
        </div>

        {/* Opção 2: Navegador de Pastas Local */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Barra de Caminho Atual */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--ocean-950)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-code)",
              fontSize: "var(--text-xs)",
              color: "var(--color-text)",
            }}
          >
            <FolderIcon size={14} color="#F4B84A" />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {currentPath}
            </span>
            {browseData?.parentDir && (
              <button
                onClick={() => loadDirectory(browseData.parentDir!)}
                title="Subir um nível de pasta"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--blue-400)",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>↑ Subir</span>
              </button>
            )}
            <button
              onClick={() => loadDirectory(currentPath)}
              title="Atualizar pasta"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
              }}
            >
              <RefreshIcon size={12} />
            </button>
          </div>

          {/* Lista de Pastas e Arquivos */}
          <div
            style={{
              maxHeight: "240px",
              overflowY: "auto",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--ocean-950)",
              border: "1px solid var(--color-border)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {loading ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                Lendo diretório local...
              </div>
            ) : browseData?.entries.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                Diretório vazio
              </div>
            ) : (
              browseData?.entries.map((entry) => (
                <div
                  key={entry.path}
                  onClick={() => entry.isDirectory && loadDirectory(entry.path)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "7px 12px",
                    borderBottom: "1px solid rgba(23, 51, 83, 0.3)",
                    cursor: entry.isDirectory ? "pointer" : "default",
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-code)",
                    transition: "background-color var(--duration-fast)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--ocean-850)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {entry.isDirectory ? (
                      <FolderIcon size={14} color="#F4B84A" />
                    ) : (
                      <FileIcon size={14} color="var(--blue-400)" />
                    )}
                    <span style={{ color: entry.isDirectory ? "var(--color-text)" : "var(--color-text-secondary)", fontWeight: entry.isDirectory ? 600 : 400 }}>
                      {entry.name}
                    </span>
                  </div>

                  {entry.isDirectory ? (
                    <ChevronRightIcon size={12} color="var(--color-text-muted)" />
                  ) : (
                    <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                      {(entry.size / 1024).toFixed(1)} KB
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
