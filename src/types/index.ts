/**
 * Oh My Shark — TypeScript Data Contracts
 * Deep Ocean Architecture Specification
 */

export type NavigationId = 
  | "chat" 
  | "teia"
  | "tasks" 
  | "context" 
  | "tools" 
  | "providers" 
  | "settings" 
  | "system-prompt" 
  | "specifications" 
  | "agents" 
  | "analytics";

export interface NavItem {
  readonly id: NavigationId;
  readonly label: string;
  readonly icon: string;
  readonly path: string;
  readonly shortcut?: string;
  readonly badge?: string | number;
}

export type MessageRole = "user" | "assistant" | "system";

export interface PlanStep {
  readonly id: number;
  readonly text: string;
  readonly completed: boolean;
}

export interface ToolExecutionRecord {
  readonly id: string;
  readonly toolName: string;
  readonly command: string;
  readonly duration: string;
  readonly output: string;
  readonly status: "running" | "success" | "error";
}

export interface IdentifiedFile {
  readonly path: string;
  readonly description: string;
  readonly action: "novo" | "modificar" | "adicionar" | "remover";
}

export interface ChatAttachment {
  readonly id: string;
  readonly name: string;
  readonly size: string;
  readonly type: "text" | "image" | "code" | "document";
  readonly content?: string;
  readonly previewUrl?: string;
  readonly lineCount?: number;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: MessageRole;
  readonly senderName: string;
  readonly timestamp: string;
  readonly content: string;
  readonly attachments?: readonly ChatAttachment[];
  readonly thinking?: {
    readonly status: "thinking" | "done";
    readonly text?: string;
    readonly duration?: string;
  };
  readonly plan?: {
    readonly steps: readonly PlanStep[];
  };
  readonly toolExecutions?: readonly ToolExecutionRecord[];
  readonly identifiedFiles?: readonly IdentifiedFile[];
}

export type TaskStatus = 
  | "pending" 
  | "in_progress" 
  | "completed" 
  | "failed" 
  | "cancelled";

export type TaskPriority = "high" | "medium" | "low";

export interface TaskItem {
  readonly id: string;
  readonly title: string;
  readonly status: TaskStatus;
  readonly priority: TaskPriority;
  readonly description?: string;
  readonly progress?: number; // 0 to 100
  readonly duration?: string;
  readonly steps?: readonly { readonly title: string; readonly done: boolean }[];
  readonly logs?: readonly string[];
  readonly createdAt: string;
  readonly completedAt?: string;
}

export type ContextAvailability = "available" | "selected" | "effectively_used";

export interface ContextFileItem {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly type: "file" | "directory";
  readonly availability: ContextAvailability;
  readonly size?: string;
  readonly lines?: number;
  readonly isExpanded?: boolean;
  readonly children?: readonly ContextFileItem[];
}

export type ToolPermission = "yolo" | "write" | "always-ask";

export interface ToolItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: "system" | "fs" | "code" | "vcs" | "ai";
  readonly permission: ToolPermission;
  readonly enabled: boolean;
  readonly invocationCount: number;
  readonly avgDuration: string;
  readonly parameters?: readonly {
    readonly name: string;
    readonly type: string;
    readonly required: boolean;
    readonly description: string;
  }[];
}

export interface AIModel {
  readonly id: string;
  readonly name: string;
  readonly provider: string;
  readonly contextWindow: string;
  readonly maxOutput: string;
  readonly pricing: {
    readonly input: string;
    readonly output: string;
  };
  readonly latencyMs: number;
  readonly isDefault: boolean;
  readonly tags: readonly string[];
}

export type ProviderConnectionStatus = "connected" | "testing" | "disconnected" | "error";

export interface AIProvider {
  readonly id: string;
  readonly name: string;
  readonly status: ProviderConnectionStatus;
  readonly endpoint: string;
  readonly latency: string;
  readonly activeModelId: string;
  readonly models: readonly AIModel[];
}

export interface AgentSpecialist {
  readonly id: "shark-lead" | "code-architect" | "deep-sea-sage" | "security-sentinel" | "theological-scholar";
  readonly name: string;
  readonly title: string;
  readonly category: "orchestrator" | "specialist" | "scholar" | "critic";
  readonly color: string;
  readonly systemPrompt: string;
  readonly functions: readonly string[];
  readonly catchphrase: string;
  readonly status: "idle" | "running" | "active";
}

export interface AppSettings {
  readonly density: "comfortable" | "compact";
  readonly theme: "deep-ocean" | "ocean-midnight" | "high-contrast";
  readonly animationsEnabled: boolean;
  readonly soundEffects: boolean;
  readonly approvalMode: ToolPermission;
  readonly telemetry: boolean;
  readonly autoTitle: boolean;
  readonly codeEditorFontSize: number;
  readonly shortcuts: Record<string, string>;
}

export interface SystemPromptScope {
  readonly id: "global" | "project" | "agent" | "session";
  readonly label: string;
  readonly path?: string;
}

export interface AnalyticsMetric {
  readonly timestamp: string;
  readonly tokensInput: number;
  readonly tokensOutput: number;
  readonly latencyMs: number;
  readonly costUsd: number;
  readonly model: string;
}
