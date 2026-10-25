import React from "react";
import {
  SharkFinIcon,
  PaperclipIcon,
  CameraIcon,
  ArrowUpIcon,
  PlusIcon,
  ToolsIcon,
  ProvidersIcon,
  SettingsIcon,
  ContextIcon,
  FileIcon,
  CloseIcon,
} from "@/components/icons";
import { useChatStore } from "@/store/useChatStore";
import { useAppStore } from "@/store/useAppStore";
import { useContextStore } from "@/store/useContextStore";

export const MessageComposer: React.FC = () => {
  const {
    activeInput,
    setActiveInput,
    sendMessage,
    abortGeneration,
    isGenerating,
    pendingAttachments,
    addFileAttachment,
    addContextAttachment,
    removePendingAttachment,
  } = useChatStore();

  const { showNotification } = useAppStore();
  const { files } = useContextStore();

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [contextDropdownOpen, setContextDropdownOpen] = React.useState(false);

  const handleSend = () => {
    if ((!activeInput.trim() && pendingAttachments.length === 0) || isGenerating) return;
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Suporte a Ctrl+V para colar capturas de tela ou arquivos da área de transferência
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    let foundFile = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item && item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          foundFile = true;
          await addFileAttachment(file);
          showNotification(`Anexo colado da área de transferência: ${file.name}`, "info");
        }
      }
    }

    if (foundFile) {
      e.preventDefault();
    }
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    for (let i = 0; i < selectedFiles.length; i++) {
      const f = selectedFiles[i];
      if (f) {
        await addFileAttachment(f);
      }
    }

    showNotification(`${selectedFiles.length} arquivo(s) anexado(s) para leitura`, "success");
    e.target.value = "";
  };

  return (
    <div
      className="oms-composer"
      style={{
        padding: "16px 24px",
        backgroundColor: "var(--ocean-950)",
        borderTop: "1px solid rgba(23, 51, 83, 0.4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Hidden native file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFilesSelected}
        style={{ display: "none" }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleFilesSelected}
        style={{ display: "none" }}
      />

      {/* Popover / Dropdown de @ Contexto para vincular arquivos do projeto */}
      {contextDropdownOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "85px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "600px",
            backgroundColor: "var(--ocean-900)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-dialog)",
            zIndex: 100,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderBottom: "1px solid var(--color-border)",
              backgroundColor: "var(--ocean-850)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-text)" }}>
              Vincular Arquivo de Contexto para a IA Ler
            </span>
            <button
              onClick={() => setContextDropdownOpen(false)}
              style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", cursor: "pointer", display: "flex" }}
            >
              <CloseIcon size={14} />
            </button>
          </div>

          <div style={{ maxHeight: "200px", overflowY: "auto", padding: "6px" }}>
            {files.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  addContextAttachment({ name: item.name, path: item.path, size: item.size });
                  setContextDropdownOpen(false);
                  showNotification(`Arquivo @${item.name} vinculado como contexto`, "success");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  fontSize: "var(--text-xs)",
                  fontFamily: "var(--font-code)",
                  color: "var(--color-text)",
                  transition: "background-color var(--duration-fast)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--ocean-800)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <FileIcon size={14} color="var(--blue-400)" />
                  <span>{item.path}</span>
                </div>
                {item.size && <span style={{ color: "var(--color-text-muted)" }}>{item.size}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Box Principal do Compositor */}
      <div
        style={{
          width: "100%",
          maxWidth: "880px",
          backgroundColor: "var(--ocean-900)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 8px 32px rgba(2, 10, 22, 0.5)",
          overflow: "hidden",
          transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)",
        }}
      >
        {/* Barra de Anexos Pendentes Prontos para Envio */}
        {pendingAttachments.length > 0 && (
          <div
            style={{
              padding: "10px 16px 4px",
              borderBottom: "1px solid rgba(23, 51, 83, 0.4)",
              backgroundColor: "rgba(2, 10, 22, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--ocean-800)",
                  border: "1px solid var(--color-border)",
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text)",
                  maxWidth: "260px",
                }}
              >
                {att.previewUrl ? (
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    style={{ width: "24px", height: "24px", borderRadius: "3px", objectFit: "cover" }}
                  />
                ) : (
                  <FileIcon size={14} color="var(--blue-400)" />
                )}

                <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <span style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {att.name}
                  </span>
                  <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                    {att.size} {att.lineCount ? `· ${att.lineCount} linhas` : ""}
                  </span>
                </div>

                <button
                  onClick={() => removePendingAttachment(att.id)}
                  title="Remover anexo"
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                    padding: "2px",
                    display: "flex",
                    marginLeft: "2px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--state-danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                >
                  <CloseIcon size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Linha de entrada de texto */}
        <div
          style={{
            padding: "14px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          {/* Shark Icon Watermark */}
          <div
            style={{
              paddingTop: "2px",
              color: "var(--blue-400)",
              flexShrink: 0,
            }}
          >
            <SharkFinIcon size={18} active />
          </div>

          {/* Textarea com suporte a Paste de imagens/arquivos */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={activeInput}
            onChange={(e) => setActiveInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={isGenerating}
            placeholder={
              isGenerating
                ? "Processando raciocínio..."
                : pendingAttachments.length > 0
                ? "Adicione uma instrução sobre os anexos ou pressione Enviar..."
                : "Digite uma instrução ou cole arquivos (Ctrl+V)..."
            }
            style={{
              flex: 1,
              backgroundColor: "transparent",
              border: "none",
              outline: "none",
              color: "var(--color-text)",
              fontSize: "var(--text-md)",
              fontFamily: "var(--font-ui)",
              resize: "none",
              minHeight: "24px",
              maxHeight: "140px",
              lineHeight: 1.5,
              padding: 0,
            }}
          />

          {/* Controles do lado direito */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {/* Botão Anexar Arquivo (Paperclip) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Anexar arquivo local (.ts, .js, .json, .md, .txt)"
              style={{
                color: "var(--color-text-muted)",
                background: "transparent",
                border: "none",
                padding: "6px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                display: "flex",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <PaperclipIcon size={16} />
            </button>

            {/* Botão Captura de Tela / Imagem (Camera) */}
            <button
              onClick={() => imageInputRef.current?.click()}
              title="Anexar captura de tela ou imagem (.png, .jpg, .svg)"
              style={{
                color: "var(--color-text-muted)",
                background: "transparent",
                border: "none",
                padding: "6px",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                display: "flex",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
            >
              <CameraIcon size={16} />
            </button>

            {/* Botão Enviar ou Interromper */}
            {isGenerating ? (
              <button
                onClick={abortGeneration}
                title="Interromper geração (Abort)"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--state-error)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all var(--duration-fast)",
                }}
              >
                <span>Parar</span>
                <span style={{ fontSize: "10px" }}>■</span>
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={(!activeInput.trim() && pendingAttachments.length === 0)}
                title="Enviar mensagem"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 14px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor:
                    activeInput.trim() || pendingAttachments.length > 0
                      ? "var(--blue-500)"
                      : "var(--ocean-800)",
                  color:
                    activeInput.trim() || pendingAttachments.length > 0
                      ? "#FFFFFF"
                      : "var(--color-text-muted)",
                  border: "1px solid rgba(38, 120, 255, 0.3)",
                  fontSize: "var(--text-xs)",
                  fontWeight: 600,
                  cursor:
                    activeInput.trim() || pendingAttachments.length > 0
                      ? "pointer"
                      : "not-allowed",
                  transition: "all var(--duration-fast)",
                }}
              >
                <span>Enviar</span>
                <ArrowUpIcon size={13} />
              </button>
            )}
          </div>
        </div>
        {/* Barra de Acessórios Limpa com Ícones Vetoriais sem emojis */}
        <div
          style={{
            padding: "7px 16px",
            borderTop: "1px solid rgba(23, 51, 83, 0.5)",
            backgroundColor: "rgba(2, 10, 22, 0.3)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            style={accessoryBtnStyle}
            title="Escolher arquivo do computador"
          >
            <PlusIcon size={12} color="var(--blue-400)" />
            <span>Arquivo</span>
          </button>

          <button
            onClick={() => setContextDropdownOpen(!contextDropdownOpen)}
            style={{
              ...accessoryBtnStyle,
              backgroundColor: contextDropdownOpen ? "var(--ocean-800)" : "var(--ocean-850)",
              borderColor: contextDropdownOpen ? "var(--blue-500)" : "rgba(23, 51, 83, 0.6)",
            }}
            title="Vincular arquivo do projeto como contexto"
          >
            <ContextIcon size={12} color="var(--color-text-muted)" />
            <span>Contexto</span>
          </button>

          <button
            onClick={() => showNotification("Ferramentas disponíveis: bash, read, edit, write, grep, lsp", "info")}
            style={accessoryBtnStyle}
            title="Ver ferramentas do sistema"
          >
            <ToolsIcon size={12} color="var(--color-text-muted)" />
            <span>Ferramentas</span>
          </button>

          <button
            onClick={() => showNotification("Modelo em uso: Claude 3.5 Sonnet", "info")}
            style={accessoryBtnStyle}
            title="Ver modelo atual"
          >
            <ProvidersIcon size={12} color="var(--color-text-muted)" />
            <span>Modelos</span>
          </button>

          <button
            onClick={() => showNotification("Opções: Modo Autônomo, Tolerância de Erro Zero", "info")}
            style={accessoryBtnStyle}
            title="Opções de execução"
          >
            <SettingsIcon size={12} color="var(--color-text-muted)" />
            <span>Opções</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const accessoryBtnStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  padding: "4px 10px",
  borderRadius: "var(--radius-sm)",
  backgroundColor: "var(--ocean-850)",
  border: "1px solid rgba(23, 51, 83, 0.6)",
  color: "var(--color-text-secondary)",
  fontSize: "11px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all var(--duration-fast)",
};
