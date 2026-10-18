import { create } from "zustand";
import type { ContextFileItem, ContextAvailability } from "@/types";

const INITIAL_FILES: readonly ContextFileItem[] = [
  {
    id: "f-src",
    name: "src",
    path: "src/",
    type: "directory",
    availability: "selected",
    isExpanded: true,
    children: [
      {
        id: "f-auth",
        name: "auth",
        path: "src/auth/",
        type: "directory",
        availability: "selected",
        isExpanded: true,
        children: [
          {
            id: "f-auth-service",
            name: "service.ts",
            path: "src/auth/service.ts",
            type: "file",
            availability: "effectively_used",
            size: "3.2 KB",
            lines: 112,
          },
          {
            id: "f-auth-types",
            name: "types.ts",
            path: "src/auth/types.ts",
            type: "file",
            availability: "selected",
            size: "1.1 KB",
            lines: 48,
          },
        ],
      },
      {
        id: "f-middleware",
        name: "middleware",
        path: "src/middleware/",
        type: "directory",
        availability: "selected",
        isExpanded: true,
        children: [
          {
            id: "f-mid-auth",
            name: "auth.ts",
            path: "src/middleware/auth.ts",
            type: "file",
            availability: "effectively_used",
            size: "2.4 KB",
            lines: 84,
          },
        ],
      },
      {
        id: "f-routes",
        name: "routes",
        path: "src/routes/",
        type: "directory",
        availability: "selected",
        isExpanded: false,
        children: [
          {
            id: "f-routes-api",
            name: "api.ts",
            path: "src/routes/api.ts",
            type: "file",
            availability: "selected",
            size: "4.8 KB",
            lines: 165,
          },
        ],
      },
      {
        id: "f-models",
        name: "models",
        path: "src/models/",
        type: "directory",
        availability: "available",
        isExpanded: false,
        children: [
          {
            id: "f-models-user",
            name: "user.ts",
            path: "src/models/user.ts",
            type: "file",
            availability: "available",
            size: "1.8 KB",
            lines: 62,
          },
        ],
      },
    ],
  },
  {
    id: "f-pkg",
    name: "package.json",
    path: "package.json",
    type: "file",
    availability: "effectively_used",
    size: "1.4 KB",
    lines: 45,
  },
  {
    id: "f-readme",
    name: "README.md",
    path: "README.md",
    type: "file",
    availability: "selected",
    size: "4.2 KB",
    lines: 130,
  },
  {
    id: "f-tsconfig",
    name: "tsconfig.json",
    path: "tsconfig.json",
    type: "file",
    availability: "available",
    size: "0.8 KB",
    lines: 32,
  },
];

export interface SystemRule {
  id: string;
  title: string;
  description: string;
  status: "active" | "inactive";
  source: string;
}

const INITIAL_RULES: readonly SystemRule[] = [
  {
    id: "rule-1",
    title: "TypeScript Estrito & Zero Any",
    description: "Todo código deve possuir tipagem exata sem recurso a 'any' ou supressões @ts-ignore.",
    status: "active",
    source: ".omp/rules/code-standards.md",
  },
  {
    id: "rule-2",
    title: "Bun APIs Primeiro",
    description: "Priorizar Bun.file, Bun.write, Bun.spawn e bun:sqlite em detrimento de dependências pesadas de terceiros.",
    status: "active",
    source: ".omp/rules/bun-preference.md",
  },
  {
    id: "rule-3",
    title: "Deep Ocean Visual Identity",
    description: "Preservar a paleta ocean-950 a ocean-800 e aplicar blue-500 somente para foco, seleção e ações afirmativas.",
    status: "active",
    source: "Oh_My_Shark_Design_System.md",
  },
  {
    id: "rule-4",
    title: "Continuidade Não-Destrutiva",
    description: "Proibido remover funcionalidades existentes ou atalhos prévios sem consentimento explícito.",
    status: "active",
    source: ".omp/rules/continuity.md",
  },
];

interface ContextState {
  files: readonly ContextFileItem[];
  rules: readonly SystemRule[];
  filterSearch: string;
  selectedScope: string;
  isNativeDirectory: boolean;

  setFilterSearch: (search: string) => void;
  setSelectedScope: (scope: string) => void;
  setWorkspaceFiles: (scope: string, newFiles: readonly ContextFileItem[], isNative?: boolean) => void;
  cycleAvailability: (fileId: string) => void;
  toggleDirectoryExpand: (dirId: string) => void;
  toggleRule: (ruleId: string) => void;
}

export const useContextStore = create<ContextState>((set) => ({
  files: INITIAL_FILES,
  rules: INITIAL_RULES,
  filterSearch: "",
  selectedScope: "~/projects/oh-my-shark",
  isNativeDirectory: false,

  setFilterSearch: (search) => set({ filterSearch: search }),
  setSelectedScope: (scope) => set({ selectedScope: scope }),

  setWorkspaceFiles: (scope, newFiles, isNative = true) =>
    set({
      selectedScope: scope,
      files: newFiles,
      isNativeDirectory: isNative,
    }),

  cycleAvailability: (fileId) =>
    set((state) => ({
      files: updateItemRecursive(state.files, fileId, (item) => {
        const nextMap: Record<ContextAvailability, ContextAvailability> = {
          available: "selected",
          selected: "effectively_used",
          effectively_used: "available",
        };
        return { ...item, availability: nextMap[item.availability] };
      }),
    })),

  toggleDirectoryExpand: (dirId) =>
    set((state) => ({
      files: updateItemRecursive(state.files, dirId, (item) => ({
        ...item,
        isExpanded: !item.isExpanded,
      })),
    })),

  toggleRule: (ruleId) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId ? { ...r, status: r.status === "active" ? "inactive" : "active" } : r
      ),
    })),
}));

function updateItemRecursive(
  items: readonly ContextFileItem[],
  targetId: string,
  fn: (item: ContextFileItem) => ContextFileItem
): ContextFileItem[] {
  return items.map((item) => {
    if (item.id === targetId) {
      return fn(item);
    }
    if (item.children) {
      return {
        ...item,
        children: updateItemRecursive(item.children, targetId, fn),
      };
    }
    return item;
  });
}
