import React from "react";
import { useNavigate } from "react-router-dom";
import { SharkFinIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "32px",
        textAlign: "center",
        gap: "20px",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          backgroundColor: "rgba(38, 120, 255, 0.1)",
          border: "2px solid rgba(38, 120, 255, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 32px rgba(38, 120, 255, 0.2)",
        }}
      >
        <SharkFinIcon size={44} color="var(--blue-400)" />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <span style={{ fontSize: "48px", fontWeight: 900, color: "var(--blue-400)", fontFamily: "var(--font-code)", letterSpacing: "2px" }}>
          404
        </span>
        <h2 style={{ margin: 0, fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--color-text)" }}>
          Coordenada Não Encontrada nas Profundezas
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)", color: "var(--color-text-muted)", maxWidth: "460px" }}>
          O destino solicitado não faz parte das rotas registradas do ecossistema Oh My Shark.
        </p>
      </div>

      <Button variant="primary" size="md" onClick={() => navigate("/")}>
        Retornar ao Workspace Principal
      </Button>
    </div>
  );
};
