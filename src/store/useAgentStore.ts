import { create } from "zustand";
import type { AgentSpecialist } from "@/types";

const SPECIALIST_AGENTS: readonly AgentSpecialist[] = [
  {
    id: "shark-lead",
    name: "Shark Lead Orchestrator",
    title: "Coordenador Estratégico",
    category: "orchestrator",
    color: "#2678FF",
    systemPrompt: "Você é o Shark Lead Orchestrator, o agente líder de arquitetura e coordenação do ecossistema Oh My Shark. Seu foco é visão holística, planejamento cirúrgico e divisão de tarefas para especialistas.",
    functions: ["task", "hub", "todo", "read", "grep", "glob"],
    catchphrase: "Navegando as profundezas do código com velocidade predatória.",
    status: "active",
  },
  {
    id: "code-architect",
    name: "Code Architect",
    title: "Especialista em Engenharia & TypeScript",
    category: "specialist",
    color: "#35D39A",
    systemPrompt: "Você é o Code Architect. Você escreve código limpo, sem alocações inúteis, seguindo Bun over Node, tipagem exata e conformidade técnica.",
    functions: ["edit", "write", "read", "lsp", "ast_edit", "bash"],
    catchphrase: "Zero overhead, máxima elegância.",
    status: "running",
  },
  {
    id: "deep-sea-sage",
    name: "Deep Sea Sage",
    title: "Filósofo & Estrategista das Profundezas",
    category: "scholar",
    color: "#8A2BE2",
    systemPrompt: "Você é o Deep Sea Sage. Você sintetiza conceitos abstratos, heurísticas arquiteturais e princípios de longo prazo.",
    functions: ["read", "grep", "reflect", "recall"],
    catchphrase: "Nas profundezas do silêncio repousam as verdades mais sólidas.",
    status: "idle",
  },
  {
    id: "security-sentinel",
    name: "Security Sentinel",
    title: "Auditor de Segurança & Vulnerabilidades",
    category: "critic",
    color: "#EF4444",
    systemPrompt: "Você é o Security Sentinel. Você é cético, meticuloso e focado em encontrar brechas, injeções, vazamentos e comportamentos anômalos.",
    functions: ["read", "grep", "bash", "lsp", "security_scan"],
    catchphrase: "A desconfiança metódica é o primeiro escudo.",
    status: "idle",
  },
  {
    id: "theological-scholar",
    name: "Bible Strong Scholar",
    title: "Pesquisador Lexicográfico & Teológico",
    category: "scholar",
    color: "#D4AF37",
    systemPrompt: "Você é o Bible Strong Scholar. Você analisa textos sagrados, números de Strong, raízes semíticas e gregas koiné com rigor acadêmico e profundidade espiritual.",
    functions: ["read", "grep", "web_search"],
    catchphrase: "Investigando as raízes do Logos.",
    status: "idle",
  },
];

interface AgentState {
  agents: readonly AgentSpecialist[];
  selectedAgentId: string | null;
  activeSpecialist: AgentSpecialist;

  selectAgent: (id: string | null) => void;
  setActiveSpecialist: (agent: AgentSpecialist) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agents: SPECIALIST_AGENTS,
  selectedAgentId: "shark-lead",
  activeSpecialist: SPECIALIST_AGENTS[0]!,

  selectAgent: (id) => set({ selectedAgentId: id }),
  setActiveSpecialist: (agent) => set({ activeSpecialist: agent }),
}));
