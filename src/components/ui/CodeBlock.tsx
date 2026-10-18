import React from "react";
import { CopyIcon, CheckIcon } from "@/components/icons";

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "typescript",
  filename,
  showLineNumbers = true,
  className = "",
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const lines = code.trim().split("\n");

  return (
    <div
      className={`oms-code-block ${className}`}
      style={{
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--ocean-950)",
        overflow: "hidden",
        fontFamily: "var(--font-code)",
        fontSize: "var(--text-sm)",
        margin: "8px 0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
          backgroundColor: "rgba(6, 19, 38, 0.7)",
          borderBottom: "1px solid var(--color-border)",
          fontSize: "var(--text-xs)",
          color: "var(--color-text-muted)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-text-secondary)" }}>
          {filename ? (
            <span style={{ fontWeight: 600 }}>{filename}</span>
          ) : (
            <span style={{ textTransform: "uppercase", letterSpacing: "0.5px" }}>{language}</span>
          )}
        </span>

        <button
          onClick={handleCopy}
          title="Copiar código"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            padding: "2px 8px",
            borderRadius: "var(--radius-sm)",
            backgroundColor: copied ? "var(--state-success-bg)" : "var(--ocean-850)",
            color: copied ? "var(--state-success)" : "var(--color-text-secondary)",
            border: `1px solid ${copied ? "rgba(53, 211, 154, 0.4)" : "var(--color-border)"}`,
            fontSize: "var(--text-xs)",
            cursor: "pointer",
            transition: "all var(--duration-fast) var(--ease-out)",
          }}
        >
          {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
          <span>{copied ? "Copiado!" : "Copiar"}</span>
        </button>
      </div>

      <div style={{ padding: "12px 0", overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", tableLayout: "auto" }}>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} style={{ lineHeight: "1.5" }}>
                {showLineNumbers && (
                  <td
                    style={{
                      width: "42px",
                      textAlign: "right",
                      paddingRight: "16px",
                      color: "var(--ocean-750)",
                      userSelect: "none",
                      verticalAlign: "top",
                      fontSize: "var(--text-xs)",
                    }}
                  >
                    {idx + 1}
                  </td>
                )}
                <td
                  style={{
                    paddingRight: "16px",
                    paddingLeft: showLineNumbers ? "0" : "16px",
                    whiteSpace: "pre",
                    color: "var(--color-text)",
                  }}
                >
                  {highlightSyntax(line, language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Highlighting simples e seguro sem dependências pesadas
function highlightSyntax(text: string, _lang: string): React.ReactNode {
  // Comentários
  if (text.trim().startsWith("//") || text.trim().startsWith("#")) {
    return <span style={{ color: "var(--color-text-muted)", fontStyle: "italic" }}>{text}</span>;
  }

  // Tokens chave
  const keywords = /\b(import|export|from|const|let|var|function|return|if|else|switch|case|async|await|interface|type|class|new|try|catch|true|false|null|undefined)\b/g;
  const parts = text.split(keywords);

  return (
    <>
      {parts.map((part, i) => {
        if (keywords.test(part)) {
          return (
            <span key={i} style={{ color: "var(--blue-400)", fontWeight: 600 }}>
              {part}
            </span>
          );
        }
        if (part.startsWith('"') || part.startsWith("'") || part.startsWith("`")) {
          return (
            <span key={i} style={{ color: "var(--state-success)" }}>
              {part}
            </span>
          );
        }
        return part;
      })}
    </>
  );
}
