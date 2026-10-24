import React from "react";
import { type TeiaNode, type TeiaEdge, type TeiaNodeType, type GraphifyCommunity, stepTeiaPhysics } from "@/services/teiaEngine";
import { PlusIcon, WebNetIcon } from "@/components/icons";

export interface TeiaCanvasProps {
  nodes: TeiaNode[];
  edges: TeiaEdge[];
  communities?: GraphifyCommunity[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
  onOpen?: (id: string) => void;
  onCreateEmpty?: () => void;
  typeFilter?: TeiaNodeType | "all";
  physicsRunning?: boolean;
}

const TEIA_COLOR_MAP: Record<string, string> = {
  concept: "#7A82E6",
  technology: "#4AE2E8",
  decision: "#FFB86C",
  project: "#38BDF8",
  memory: "#C678DD",
  preference: "#E06C75",
  problem: "#F85149",
  solution: "#65DCA2",
  idea: "#E5C07B",
  reference: "#9CB4D4",
  ghost: "#4B535B",
};

export const TeiaCanvas: React.FC<TeiaCanvasProps> = ({
  nodes,
  edges,
  communities = [],
  activeId,
  onSelect,
  onOpen,
  onCreateEmpty,
  typeFilter = "all",
  physicsRunning = true,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [showLegend, setShowLegend] = React.useState(true);

  const stateRef = React.useRef<{
    cam: { x: number; y: number; k: number };
    alpha: number;
    hoverId: string | null;
    nodesMap: Map<string, TeiaNode>;
    localEdges: TeiaEdge[];
    localNodes: TeiaNode[];
    w: number;
    h: number;
    raf: number;
    orbitPulse: number;
  }>({
    cam: { x: 0, y: 0, k: 1 },
    alpha: 0,
    hoverId: null,
    nodesMap: new Map(),
    localEdges: [],
    localNodes: [],
    w: 600,
    h: 400,
    raf: 0,
    orbitPulse: 0,
  });

  // Mapeia comunidades por ID
  const communityColorMap = React.useMemo(() => {
    const map = new Map<number, string>();
    for (const c of communities) {
      map.set(c.id, c.color);
    }
    return map;
  }, [communities]);

  // Atualiza nós e arestas quando dados mudam
  React.useEffect(() => {
    const s = stateRef.current;
    const oldMap = s.nodesMap;
    const newMap = new Map<string, TeiaNode>();

    const TAU = Math.PI * 2;
    s.localNodes = nodes.map((n, i) => {
      const old = oldMap.get(n.id);
      const angle = (i / Math.max(nodes.length, 1)) * TAU;
      const radius = 70 + Math.sqrt(nodes.length) * 42;

      const nodeObj: TeiaNode = {
        ...n,
        x: old?.x ?? Math.cos(angle) * radius + (Math.random() - 0.5) * 24,
        y: old?.y ?? Math.sin(angle) * radius + (Math.random() - 0.5) * 24,
        vx: 0,
        vy: 0,
        pinned: old?.pinned ?? false,
        r: (n.ghost ? 4.5 : 7.0) + Math.sqrt(n.degree || 0) * 2.4 + (n.hub ? 5.0 : 0) + (n.isGodNode ? 3.0 : 0),
      };
      newMap.set(n.id, nodeObj);
      return nodeObj;
    });

    s.nodesMap = newMap;
    s.localEdges = edges
      .filter((e) => newMap.has(e.source) && newMap.has(e.target))
      .map((e) => ({
        ...e,
        s: newMap.get(e.source),
        t: newMap.get(e.target),
      }));

    s.alpha = 1;
  }, [nodes, edges]);

  // Loop de Renderização e Física Cósmica
  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const s = stateRef.current;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(rect.width, 100);
      const h = Math.max(rect.height, 100);
      s.w = w;
      s.h = h;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let running = true;

    const renderFrame = () => {
      if (!running) return;
      const dpr = window.devicePixelRatio || 1;

      // Pulso para anéis orbitais de nós centrais
      s.orbitPulse = (s.orbitPulse + 0.025) % (Math.PI * 2);

      // Simulação física suave
      if (physicsRunning && s.alpha > 0.02) {
        stepTeiaPhysics(s.localNodes, s.localEdges, s.alpha, s.w / s.h);
        s.alpha *= 0.988;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, s.w, s.h);

      // 1. Fundo Cósmico Profundo (Neural Obsidian Void Gradient)
      const grad = ctx.createRadialGradient(s.w / 2, s.h / 2, 60, s.w / 2, s.h / 2, Math.max(s.w, s.h));
      grad.addColorStop(0, "#10121A");
      grad.addColorStop(0.55, "#0B0D13");
      grad.addColorStop(1, "#07080C");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, s.w, s.h);

      // Grade sutil da Teia
      ctx.save();
      ctx.strokeStyle = "rgba(180, 192, 230, 0.025)";
      ctx.lineWidth = 1;
      const gridSize = 48;
      for (let x = 0; x < s.w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, s.h);
        ctx.stroke();
      }
      for (let y = 0; y < s.h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(s.w, y);
        ctx.stroke();
      }
      ctx.restore();

      // Câmera Pan/Zoom
      ctx.translate(s.w / 2 + s.cam.x, s.h / 2 + s.cam.y);
      ctx.scale(s.cam.k, s.cam.k);

      // 2. Arestas (Conexões Sinápticas da Teia com Destaque para Pontes)
      for (const e of s.localEdges) {
        if (!e.s || !e.t) continue;
        const isConnectedToActive = e.source === activeId || e.target === activeId;
        const isHovered = e.source === s.hoverId || e.target === s.hoverId;
        const isBridge = e.isCrossCommunity || (e.surpriseScore !== undefined && e.surpriseScore >= 40);

        const isFilteredOut =
          typeFilter !== "all" && e.s.type !== typeFilter && e.t.type !== typeFilter;

        ctx.beginPath();
        ctx.moveTo(e.s.x!, e.s.y!);
        ctx.lineTo(e.t.x!, e.t.y!);

        if (isBridge) {
          // Ponte inter-comunitária (Surprising Connection)
          ctx.setLineDash([6, 3]);
          ctx.strokeStyle = isConnectedToActive
            ? "#FFB86C"
            : isHovered
            ? "rgba(255, 184, 108, 0.9)"
            : "rgba(255, 184, 108, 0.45)";
          ctx.lineWidth = isConnectedToActive ? 2.5 : 1.5;
        } else if (e.ai) {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = isConnectedToActive
            ? "#C678DD"
            : isFilteredOut
            ? "rgba(198, 120, 221, 0.12)"
            : "rgba(198, 120, 221, 0.45)";
          ctx.lineWidth = isConnectedToActive ? 2 : 1;
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = isConnectedToActive
            ? "#7A82E6"
            : isHovered
            ? "rgba(148, 155, 242, 0.65)"
            : isFilteredOut
            ? "rgba(180, 192, 230, 0.03)"
            : "rgba(180, 192, 230, 0.12)";
          ctx.lineWidth = isConnectedToActive ? 2 : 1;
        }

        ctx.stroke();
        ctx.setLineDash([]);

        // Rótulo da relação se zoom estiver ampliado ou se for ponte
        if ((s.cam.k > 1.2 || isBridge) && (isConnectedToActive || isHovered) && !isFilteredOut) {
          const mx = (e.s.x! + e.t.x!) / 2;
          const my = (e.s.y! + e.t.y!) / 2;
          ctx.font = "10px 'JetBrains Mono', monospace";
          ctx.fillStyle = isBridge ? "#FFB86C" : isConnectedToActive ? "#B8C0FF" : "#828B9C";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const label = (e.relation || "") + (isBridge ? " ⚡" : e.ai ? " ✦" : "");
          ctx.fillText(label, mx, my - 6);
        }
      }

      // 3. Nós (Pontos Nodais da Constelação)
      for (const n of s.localNodes) {
        const isAct = n.id === activeId;
        const isHov = n.id === s.hoverId;
        const isDimmed = typeFilter !== "all" && n.type !== typeFilter;
        const color = TEIA_COLOR_MAP[n.type] || (n.ghost ? "#4B535B" : "#7A82E6");
        const radius = n.r || 6;
        const commColor = n.communityId ? communityColorMap.get(n.communityId) : undefined;

        ctx.save();
        if (isDimmed) {
          ctx.globalAlpha = 0.22;
        }

        // Halo de Comunidade Graphify (se o nó pertencer a um cluster)
        if (commColor && !n.ghost) {
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, radius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `${commColor}14`;
          ctx.fill();
        }

        // Brilho de aura cósmica (Radial Glow)
        if (isAct || isHov || n.hub || n.isGodNode) {
          const auraColor = n.isGodNode ? "#FFB86C" : color;
          const aura = ctx.createRadialGradient(n.x!, n.y!, radius * 0.5, n.x!, n.y!, radius * 2.8);
          aura.addColorStop(0, `${auraColor}45`);
          aura.addColorStop(1, `${auraColor}00`);
          ctx.fillStyle = aura;
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, radius * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // God Node — Anel estelar dourado pulsante
        if (n.isGodNode) {
          const pulseOffset = Math.sin(s.orbitPulse) * 2;
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, radius + 6 + pulseOffset, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 184, 108, 0.75)";
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(n.x!, n.y!, radius + 11 - pulseOffset, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255, 184, 108, 0.25)";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (n.hub) {
          // Hub orbital estelar comum
          const pulseOffset = Math.sin(s.orbitPulse) * 1.6;
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, radius + 5 + pulseOffset, 0, Math.PI * 2);
          ctx.strokeStyle = isAct ? "rgba(148, 155, 242, 0.85)" : "rgba(184, 192, 255, 0.35)";
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Anel ativo
        if (isAct) {
          ctx.beginPath();
          ctx.arc(n.x!, n.y!, radius + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "#949BF2";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Corpo do Nó
        ctx.beginPath();
        ctx.arc(n.x!, n.y!, radius, 0, Math.PI * 2);

        if (n.ghost) {
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = "#828B9C";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = isAct ? "#FFFFFF" : isHov ? "#F4F6FC" : "rgba(7, 8, 12, 0.9)";
          ctx.lineWidth = isAct ? 2 : 1;
          ctx.stroke();
        }

        // Etiqueta do nó
        ctx.font = `${isAct || n.isGodNode ? "bold " : ""}${Math.max(10, Math.min(13, 11 / Math.sqrt(s.cam.k)))}px 'Inter', sans-serif`;
        ctx.fillStyle = isAct ? "#FFFFFF" : n.isGodNode ? "#FFB86C" : isHov ? "#F4F6FC" : n.ghost ? "#828B9C" : "#D2D5E2";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(n.title, n.x!, n.y! + radius + 5);

        ctx.restore();
      }

      ctx.restore();
      s.raf = requestAnimationFrame(renderFrame);
    };

    s.raf = requestAnimationFrame(renderFrame);

    return () => {
      running = false;
      cancelAnimationFrame(stateRef.current.raf);
      observer.disconnect();
    };
  }, [activeId, typeFilter, physicsRunning, communityColorMap]);

  // Interatividade com pointer events
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let drag: {
      node: TeiaNode | null;
      startX: number;
      startY: number;
      moved: boolean;
      camX: number;
      camY: number;
    } | null = null;

    const toWorld = (px: number, py: number) => {
      const s = stateRef.current;
      return {
        x: (px - s.w / 2 - s.cam.x) / s.cam.k,
        y: (py - s.h / 2 - s.cam.y) / s.cam.k,
      };
    };

    const hitTest = (px: number, py: number) => {
      const w = toWorld(px, py);
      const s = stateRef.current;
      let best: TeiaNode | null = null;
      let bestDist = Infinity;

      for (const n of s.localNodes) {
        const d = Math.hypot(n.x! - w.x, n.y! - w.y);
        if (d < (n.r || 6) + 8 / s.cam.k && d < bestDist) {
          best = n;
          bestDist = d;
        }
      }
      return best;
    };

    const getPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const pos = getPos(e);
      const hit = hitTest(pos.x, pos.y);

      drag = {
        node: hit,
        startX: pos.x,
        startY: pos.y,
        moved: false,
        camX: stateRef.current.cam.x,
        camY: stateRef.current.cam.y,
      };

      if (hit) {
        hit.pinned = true;
        canvas.style.cursor = "grabbing";
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const pos = getPos(e);
      const s = stateRef.current;

      if (drag) {
        if (Math.hypot(pos.x - drag.startX, pos.y - drag.startY) > 3) {
          drag.moved = true;
        }

        if (drag.node && drag.moved) {
          const w = toWorld(pos.x, pos.y);
          drag.node.x = w.x;
          drag.node.y = w.y;
          s.alpha = Math.max(s.alpha, 0.25);
        } else if (!drag.node) {
          s.cam.x = drag.camX + (pos.x - drag.startX);
          s.cam.y = drag.camY + (pos.y - drag.startY);
        }
      } else {
        const hit = hitTest(pos.x, pos.y);
        s.hoverId = hit ? hit.id : null;
        canvas.style.cursor = hit ? "pointer" : "grab";
      }
    };

    const onPointerUp = () => {
      if (!drag) return;
      if (drag.node) {
        drag.node.pinned = false;
        if (!drag.moved) {
          onSelect?.(drag.node.id);
        }
      }
      drag = null;
      canvas.style.cursor = stateRef.current.hoverId ? "pointer" : "grab";
    };

    const onDblClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) {
        onOpen?.(hit.id);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const s = stateRef.current;
      const w = toWorld(px, py);

      const zoomFactor = Math.exp(-e.deltaY * 0.0015);
      const nextK = Math.min(4, Math.max(0.15, s.cam.k * zoomFactor));

      s.cam.k = nextK;
      s.cam.x = px - s.w / 2 - w.x * nextK;
      s.cam.y = py - s.h / 2 - w.y * nextK;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("dblclick", onDblClick);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("dblclick", onDblClick);
      canvas.removeEventListener("wheel", onWheel);
    };
  }, [onSelect, onOpen]);

  const handleFit = () => {
    const s = stateRef.current;
    if (!s.localNodes.length) return;
    const xs = s.localNodes.map((n) => n.x!);
    const ys = s.localNodes.map((n) => n.y!);
    const x0 = Math.min(...xs);
    const x1 = Math.max(...xs);
    const y0 = Math.min(...ys);
    const y1 = Math.max(...ys);
    const k = Math.min(s.w / (x1 - x0 + 160), s.h / (y1 - y0 + 140), 1.8);
    s.cam = { k, x: -((x0 + x1) / 2) * k, y: -((y0 + y1) / 2) * k };
    s.alpha = Math.max(s.alpha, 0.2);
  };

  const handleZoom = (inOut: number) => {
    const s = stateRef.current;
    s.cam.k = Math.min(4, Math.max(0.15, s.cam.k * inOut));
  };

  const handleReset = () => {
    const s = stateRef.current;
    s.cam = { x: 0, y: 0, k: 1 };
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "var(--teia-void)",
      }}
    >
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

      {/* Empty State cósmico técnico sem emojis */}
      {nodes.length === 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            backgroundColor: "rgba(7, 8, 12, 0.88)",
            backdropFilter: "blur(8px)",
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "var(--teia-accent-subtle)",
              border: "1px solid var(--teia-accent-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "var(--teia-shadow-node)",
            }}
          >
            <WebNetIcon size={28} color="var(--teia-accent)" />
          </div>

          <div style={{ textAlign: "center" }}>
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "var(--teia-text-bright)" }}>
              Sua Mente em Teia está Pronta
            </h3>
            <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--teia-muted)", maxWidth: "420px", lineHeight: 1.5 }}>
              O vault físico no Desktop foi conectado. Crie sua primeira nota ou converse com a IA para ela registrar memórias e preferências aqui.
            </p>
          </div>

          <button
            onClick={onCreateEmpty}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              borderRadius: "var(--teia-r-sm)",
              backgroundColor: "var(--teia-accent-active)",
              color: "#FFFFFF",
              border: "1px solid var(--teia-accent)",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(122, 130, 230, 0.35)",
            }}
          >
            <PlusIcon size={14} />
            <span>Criar Primeira Nota</span>
          </button>
        </div>
      )}

      {/* Floating Toolbar da Teia (Legenda Retrátil + HUD de Câmera) */}
      <div
        className="teia-canvas-toolbar"
        style={{
          position: "absolute",
          bottom: "14px",
          left: "16px",
          right: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          pointerEvents: "none",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {/* Legenda de cores do Design System próprio */}
        <div style={{ pointerEvents: "auto", display: "flex", flexDirection: "column", gap: "6px" }}>
          {showLegend && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "12px",
                padding: "6px 12px",
                borderRadius: "var(--teia-r-sm)",
                backgroundColor: "rgba(16, 18, 26, 0.85)",
                border: "1px solid var(--teia-line)",
                fontSize: "11px",
                color: "var(--teia-muted)",
                backdropFilter: "blur(8px)",
                maxWidth: "600px",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#7A82E6" }} />
                Conceito
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#4AE2E8" }} />
                Tecnologia
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#C678DD" }} />
                Memória IA
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#E06C75" }} />
                Preferência
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#FFB86C" }} />
                Decisão / Ponte
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#65DCA2" }} />
                Solução
              </span>
            </div>
          )}

          <button
            onClick={() => setShowLegend((prev) => !prev)}
            style={{
              alignSelf: "flex-start",
              padding: "2px 8px",
              borderRadius: "var(--teia-r-full)",
              backgroundColor: "rgba(16, 18, 26, 0.7)",
              border: "1px solid var(--teia-line)",
              color: "var(--teia-faint)",
              fontSize: "10px",
              fontFamily: "var(--teia-font-mono)",
              cursor: "pointer",
            }}
          >
            {showLegend ? "Ocultar Legenda" : "Mostrar Legenda"}
          </button>
        </div>

        {/* Controles de Câmera HUD */}
        <div style={{ pointerEvents: "auto", display: "flex", gap: "6px" }}>
          <button onClick={() => handleZoom(1.25)} style={camBtnStyle} title="Zoom +">
            +
          </button>
          <button onClick={() => handleZoom(0.8)} style={camBtnStyle} title="Zoom -">
            −
          </button>
          <button onClick={handleFit} style={camBtnStyle} title="Centralizar Constelação">
            Ajustar
          </button>
          <button onClick={handleReset} style={camBtnStyle} title="Resetar Câmera (1:1)">
            1:1
          </button>
        </div>
      </div>
    </div>
  );
};

const camBtnStyle: React.CSSProperties = {
  padding: "4px 10px",
  borderRadius: "var(--teia-r-sm)",
  backgroundColor: "rgba(16, 18, 26, 0.85)",
  border: "1px solid var(--teia-line)",
  color: "var(--teia-text)",
  fontSize: "11px",
  fontWeight: 600,
  cursor: "pointer",
  backdropFilter: "blur(6px)",
};
