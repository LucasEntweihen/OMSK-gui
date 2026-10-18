import { create } from "zustand";
import type { TaskItem, TaskStatus, TaskPriority } from "@/types";

const INITIAL_TASKS: readonly TaskItem[] = [
  {
    id: "task-1",
    title: "Analisar estrutura do projeto",
    status: "completed",
    priority: "high",
    description: "Inspeção recursiva de manifestos, rotas e dependências centrais para mapeamento de arquitetura.",
    progress: 100,
    duration: "1m 45s",
    createdAt: "14:15",
    completedAt: "14:17",
    steps: [
      { title: "Verificar package.json e lockfile", done: true },
      { title: "Mapear árvore de diretórios src/", done: true },
    ],
    logs: [
      "14:15:02 [INFO] Iniciando varredura via pi-walker",
      "14:16:30 [SUCCESS] 42 arquivos catalogados com sucesso",
    ],
  },
  {
    id: "task-2",
    title: "Verificar sistema de autenticação",
    status: "completed",
    priority: "high",
    description: "Busca de tokens JWT, sessões em cookies e middlewares existentes no projeto.",
    progress: 100,
    duration: "2m 10s",
    createdAt: "14:18",
    completedAt: "14:20",
    steps: [
      { title: "Grep em busca de referências a JWT ou OAuth", done: true },
      { title: "Auditar middleware de requisição", done: true },
    ],
    logs: [
      "14:18:12 [INFO] Executando grep por padrões de autenticação",
      "14:19:45 [WARN] Nenhum middleware JWT encontrado em src/middleware",
    ],
  },
  {
    id: "task-3",
    title: "Identificar arquivos a modificar",
    status: "completed",
    priority: "medium",
    description: "Levantamento cirúrgico dos arquivos alvo para inclusão da feature de login e cadastro.",
    progress: 100,
    duration: "45s",
    createdAt: "14:21",
    completedAt: "14:22",
    steps: [
      { title: "Determinar arquivos novos e modificações", done: true },
      { title: "Validar impacto em rotas existentes", done: true },
    ],
    logs: [
      "14:21:05 [INFO] Mapeamento concluído: 1 novo, 4 a modificar",
    ],
  },
  {
    id: "task-4",
    title: "Implementar autenticação",
    status: "in_progress",
    priority: "high",
    description: "Criação de AuthService, geração de tokens JWT e proteção das rotas privadas.",
    progress: 45,
    duration: "Em execução (3m)",
    createdAt: "14:25",
    steps: [
      { title: "Criar src/auth/service.ts", done: true },
      { title: "Configurar middleware de validação", done: false },
      { title: "Conectar endpoints de login e registro", done: false },
    ],
    logs: [
      "14:25:30 [INFO] Criando scaffold de autenticação",
      "14:26:15 [DEBUG] Aplicando hashline patch no serviço",
    ],
  },
  {
    id: "task-5",
    title: "Testar e validar",
    status: "pending",
    priority: "medium",
    description: "Bateria de testes de ponta a ponta: emissão de token, expiração e rejeição de credenciais inválidas.",
    progress: 0,
    createdAt: "14:26",
    steps: [
      { title: "Testes unitários com bun:test", done: false },
      { title: "Smoke test em rotas protegidas", done: false },
    ],
    logs: [],
  },
  {
    id: "task-6",
    title: "Executar benchmark de latência e TTFT",
    status: "pending",
    priority: "low",
    description: "Avaliação comparativa de tempo de resposta dos provedores configurados sob carga de trabalho.",
    progress: 0,
    createdAt: "14:28",
    steps: [
      { title: "Coletar métricas de p50/p95", done: false },
      { title: "Gerar relatório de consumo de tokens", done: false },
    ],
    logs: [],
  },
];

interface TaskState {
  tasks: readonly TaskItem[];
  statusFilter: TaskStatus | "all";
  selectedTaskId: string | null;

  setStatusFilter: (filter: TaskStatus | "all") => void;
  selectTask: (id: string | null) => void;
  toggleTask: (id: string) => void;
  addTask: (title: string, priority: TaskPriority, description?: string) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: INITIAL_TASKS,
  statusFilter: "all",
  selectedTaskId: "task-4",

  setStatusFilter: (filter) => set({ statusFilter: filter }),
  selectTask: (id) => set({ selectedTaskId: id }),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== id) return t;
        const nextStatus: TaskStatus = t.status === "completed" ? "pending" : "completed";
        return {
          ...t,
          status: nextStatus,
          progress: nextStatus === "completed" ? 100 : 0,
          completedAt: nextStatus === "completed" ? new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : undefined,
        };
      }),
    })),

  addTask: (title, priority, description) =>
    set((state) => {
      const newTask: TaskItem = {
        id: `task-${Date.now()}`,
        title,
        priority,
        status: "pending",
        description: description || "Tarefa criada pelo usuário.",
        progress: 0,
        createdAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        steps: [{ title: "Iniciar planejamento", done: false }],
        logs: [`${new Date().toLocaleTimeString("pt-BR")} [INFO] Tarefa registrada no backlog`],
      };
      return { tasks: [newTask, ...state.tasks] };
    }),

  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
    })),
}));
