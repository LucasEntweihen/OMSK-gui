import React from "react";
import { motion } from "framer-motion";
import { ChatIcon, UserIcon, SharkFinIcon, FileIcon, WebNetIcon } from "@/components/icons";
import { useChatStore } from "@/store/useChatStore";
import { useAppStore } from "@/store/useAppStore";
import { ThinkingBlock } from "./components/ThinkingBlock";
import { PlanCard } from "./components/PlanCard";
import { ToolExecutionCard } from "./components/ToolExecutionCard";
import { IdentifiedFilesCard } from "./components/IdentifiedFilesCard";
import { MessageComposer } from "./components/MessageComposer";
import type { ChatAttachment, ChatMessage } from "@/types";


function renderHighlightedMessageContent(content: string) {
  if (!content) return null;

  // Se for mensagem de slash command (/doomania, /deepseaneuron, etc.)
  if (content.startsWith("/")) {
    const parts = content.split(" ");
    const cmd = parts[0];
    const rest = parts.slice(1).join(" ");

    let cmdColor = "var(--blue-400)";
    let badgeText = "COMANDO";
    if (cmd === "/doomania") {
      cmdColor = "#10B981"; // Verde esmeralda de deliberação tripla
      badgeText = "DOOMANIA DELIBERATION";
    } else if (cmd === "/deepseaneuron") {
      cmdColor = "#00F0FF"; // Ciano neon do contrato deepseaneuron
      badgeText = "NEURAL OPTIMIZATION";
    } else if (cmd === "/clear") {
      cmdColor = "#EF4444";
      badgeText = "CLEAR TRANSCRIPT";
    } else if (cmd === "/model") {
      cmdColor = "#F59E0B";
      badgeText = "MODEL SWITCH";
    } else if (cmd === "/tools") {
      cmdColor = "#8B5CF6";
      badgeText = "TOOL REGISTRY";
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontFamily: "var(--font-code)",
              fontWeight: 800,
              fontSize: "15px",
              color: cmdColor,
              textShadow: "0 0 10px " + cmdColor + "40",
            }}
          >
            {cmd}
          </span>
          <span
            style={{
              fontSize: "10px",
              padding: "2px 7px",
              borderRadius: "var(--radius-full)",
              backgroundColor: cmdColor + "20",
              color: cmdColor,
              border: "1px solid " + cmdColor + "50",
              fontWeight: 700,
              fontFamily: "var(--font-code)",
            }}
          >
            {badgeText}
          </span>
        </div>
        {rest && (
          <span style={{ color: "var(--color-text)", fontSize: "var(--text-md)" }}>
            {rest}
          </span>
        )}
      </div>
    );
  }

  return content;
}

export const ChatPage: React.FC = () => {
  const { messages, isGenerating, sendMessage, abortGeneration, respondToAsk, saveMessageToTeia } = useChatStore();
  const { showNotification } = useAppStore();
  const threadEndRef = React.useRef<HTMLDivElement>(null);
  const [selectedPreviewAttachment, setSelectedPreviewAttachment] = React.useState<ChatAttachment | null>(null);

  React.useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSaveToTeia = async (msg: ChatMessage) => {
    try {
      await saveMessageToTeia(msg);
      showNotification("Nota de memória gravada na Mente em Teia no Desktop", "success");
    } catch {
      showNotification("Erro ao salvar memória na Teia", "error");
    }
  };

  return (
    <div
      className="oms-chat-page"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--ocean-950)",
      }}
    >
      {/* Header da Tela Chat */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backgroundColor: "rgba(2, 10, 22, 0.4)",
          flexShrink: 0,
        }}
      >
        <ChatIcon size={16} color="var(--blue-400)" />
        <h1 style={{ margin: 0, fontSize: "var(--text-md)", fontWeight: 700, color: "var(--color-text)" }}>
          Área de Trabalho
        </h1>
      </div>

      {/* Área de Mensagens com Rolagem Contínua */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div style={{ maxWidth: "860px", width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "14px",
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor: isUser ? "var(--ocean-850)" : "rgba(38, 120, 255, 0.12)",
                    border: `1px solid ${isUser ? "var(--color-border)" : "rgba(38, 120, 255, 0.4)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "2px",
                  }}
                >
                  {isUser ? (
                    <UserIcon size={16} color="var(--color-text-secondary)" />
                  ) : (
                    <SharkFinIcon size={16} color="var(--blue-400)" />
                  )}
                </div>

                {/* Conteúdo da Mensagem */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                  {/* Cabeçalho da mensagem: Nome e horário */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--color-text)" }}>
                        {msg.senderName}
                      </span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)" }}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {!isUser && (
                      <button
                        onClick={() => handleSaveToTeia(msg)}
                        title="Salvar esta conclusão como uma nota na Mente em Teia"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "2px 8px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "var(--ocean-900)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text-muted)",
                          fontSize: "10px",
                          cursor: "pointer",
                          transition: "all var(--duration-fast)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "var(--blue-400)";
                          e.currentTarget.style.borderColor = "var(--blue-500)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "var(--color-text-muted)";
                          e.currentTarget.style.borderColor = "var(--color-border)";
                        }}
                      >
                        <WebNetIcon size={11} color="currentColor" />
                        <span>Salvar na Teia</span>
                      </button>
                    )}
                  </div>

                  {/* Renderização de Anexos da Mensagem */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", margin: "4px 0" }}>
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          onClick={() => setSelectedPreviewAttachment(att)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "6px 12px",
                            borderRadius: "var(--radius-md)",
                            backgroundColor: "var(--ocean-900)",
                            border: "1px solid var(--color-border)",
                            cursor: "pointer",
                            transition: "border-color var(--duration-fast)",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--blue-500)")}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}
                        >
                          {att.previewUrl ? (
                            <img
                              src={att.previewUrl}
                              alt={att.name}
                              style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover" }}
                            />
                          ) : (
                            <FileIcon size={16} color="var(--blue-400)" />
                          )}

                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text)" }}>
                              {att.name}
                            </span>
                            <span style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                              {att.size} {att.lineCount ? `· ${att.lineCount} linhas` : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Thinking Block opcional */}
                  {msg.thinking && (
                    <ThinkingBlock
                      status={msg.thinking.status}
                      text={msg.thinking.text}
                      duration={msg.thinking.duration}
                    />
                  )}

                  {/* Texto principal da mensagem */}
                  <div
                    style={{
                      fontSize: "var(--text-md)",
                      lineHeight: 1.6,
                      color: "var(--color-text)",
                      whiteSpace: "pre-line",
                      userSelect: "text",
                      WebkitUserSelect: "text",
                    }}
                  >
                    {msg.content}
                  </div>

                  {/* Plan Card opcional */}
                  {msg.plan && <PlanCard steps={msg.plan.steps} />}

                  {/* Tool Execution Card opcional */}
                  {msg.toolExecutions &&
                    msg.toolExecutions.map((tool) => (
                      <ToolExecutionCard
                        key={tool.id}
                        toolName={tool.toolName}
                        command={tool.command}
                        duration={tool.duration}
                        output={tool.output}
                        status={tool.status}
                      />
                    ))}

                  {/* Identified Files Card opcional */}
                  {msg.identifiedFiles && (
                    <IdentifiedFilesCard files={msg.identifiedFiles} />
                  )}

                  {/* Protocolo Ask User Interativo em Tempo Real */}
                  {msg.askUser && (
                    <div
                      style={{
                        margin: "12px 0",
                        padding: "16px",
                        borderRadius: "var(--radius-lg)",
                        backgroundColor: "rgba(38, 120, 255, 0.08)",
                        border: "1px solid var(--blue-500)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--blue-400)" }}>
                          ⚡ Autorização / Escolha do Operador:
                        </span>
                      </div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text)", fontWeight: 600 }}>
                        {msg.askUser.question}
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {msg.askUser.options.map((opt) => {
                          const isAnswered = msg.askUser?.answered === opt;
                          return (
                            <button
                              key={opt}
                              disabled={Boolean(msg.askUser?.answered)}
                              onClick={() => {
                                respondToAsk(msg.id, opt);
                                showNotification(`Decisão registrada: "${opt}"`, "success");
                              }}
                              style={{
                                padding: "6px 14px",
                                borderRadius: "var(--radius-sm)",
                                backgroundColor: isAnswered
                                  ? "var(--blue-500)"
                                  : msg.askUser?.answered
                                    ? "var(--ocean-900)"
                                    : "var(--ocean-850)",
                                border: `1px solid ${isAnswered ? "var(--blue-400)" : "var(--color-border)"}`,
                                color: isAnswered ? "#fff" : "var(--color-text)",
                                fontSize: "var(--text-xs)",
                                fontWeight: 600,
                                cursor: msg.askUser?.answered ? "default" : "pointer",
                                transition: "all var(--duration-fast)",
                              }}
                            >
                              {opt} {isAnswered && "✓"}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Quick Suggestion Pills */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
              marginTop: "8px",
              paddingLeft: "46px",
            }}
          >
            <button
              onClick={() => sendMessage("Lembre-se que minha preferência é sempre TypeScript estrito e Bun nativo.")}
              style={suggestionPillStyle}
            >
              Gravar preferência de Bun e TypeScript na Teia
            </button>
            <button
              onClick={() => sendMessage("Sim, inicie a implementação gerando os schemas e o service.")}
              style={suggestionPillStyle}
            >
              Iniciar implementação de schemas
            </button>
            <button
              onClick={() => sendMessage("Exiba o diff das alterações previstas em src/middleware/auth.ts")}
              style={suggestionPillStyle}
            >
              Inspecionar diff do middleware
            </button>
          </div>

          <div ref={threadEndRef} />
        </div>
      </div>

      {/* Compositor Inferior Fixo */}
      <MessageComposer />

      {/* Modal de Inspeção do Conteúdo do Anexo */}
      {selectedPreviewAttachment && (
        <div
          onClick={() => setSelectedPreviewAttachment(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(2, 10, 22, 0.75)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "720px",
              width: "100%",
              backgroundColor: "var(--ocean-900)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow-dialog)",
              overflow: "hidden",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileIcon size={16} color="var(--blue-400)" />
                <span style={{ fontWeight: 700, fontSize: "var(--text-sm)" }}>{selectedPreviewAttachment.name}</span>
                <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>({selectedPreviewAttachment.size})</span>
              </div>
              <button
                onClick={() => setSelectedPreviewAttachment(null)}
                style={{ background: "transparent", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "16px", overflowY: "auto", flex: 1 }}>
              {selectedPreviewAttachment.previewUrl ? (
                <img
                  src={selectedPreviewAttachment.previewUrl}
                  alt={selectedPreviewAttachment.name}
                  style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain", borderRadius: "var(--radius-md)" }}
                />
              ) : selectedPreviewAttachment.content ? (
                <pre
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-code)",
                    fontSize: "12px",
                    lineHeight: 1.5,
                    color: "var(--color-text)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedPreviewAttachment.content}
                </pre>
              ) : (
                <div style={{ color: "var(--color-text-muted)", fontSize: "var(--text-sm)" }}>
                  Conteúdo binário ou sem texto legível disponível para visualização.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const suggestionPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  padding: "5px 12px",
  borderRadius: "var(--radius-full)",
  backgroundColor: "var(--ocean-900)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-secondary)",
  fontSize: "var(--text-xs)",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all var(--duration-fast)",
};
