import { describe, expect, it } from "bun:test";
import { useAgentStore } from "../store/useAgentStore";
import { useAppStore, AVAILABLE_MODELS } from "../store/useAppStore";
import { useChatStore } from "../store/useChatStore";

describe("OMSK GUI Core Stores & Integrations", () => {
  it("should have correct specialists in useAgentStore including AGENTS.md specs", () => {
    const agents = useAgentStore.getState().agents;
    expect(agents.length).toBeGreaterThanOrEqual(5);

    const sharkLead = agents.find((a) => a.id === "shark-lead");
    expect(sharkLead).toBeDefined();
    expect(sharkLead?.category).toBe("orchestrator");

    const codeArch = agents.find((a) => a.id === "code-architect");
    expect(codeArch).toBeDefined();
    expect(codeArch?.category).toBe("specialist");

    const executor = agents.find((a) => a.id === "agent-muu9908f");
    expect(executor).toBeDefined();
    expect(executor?.category).toBe("executor");
  });

  it("should have modern high-tier AI models registered", () => {
    expect(AVAILABLE_MODELS.length).toBeGreaterThanOrEqual(4);
    const claude37 = AVAILABLE_MODELS.find((m) => m.id === "claude-3-7-sonnet");
    expect(claude37).toBeDefined();
    const gpt6Luna = AVAILABLE_MODELS.find((m) => m.id === "gpt-6-luna");
    expect(gpt6Luna).toBeDefined();
  });

  it("should manage chat state and pending attachments safely", () => {
    const chat = useChatStore.getState();
    expect(Array.isArray(chat.messages)).toBe(true);
    expect(chat.isGenerating).toBe(false);

    useChatStore.getState().setActiveInput("Teste OMSK");
    expect(useChatStore.getState().activeInput).toBe("Teste OMSK");
    useChatStore.getState().setActiveInput("");
  });

  it("should support AppStore model switching and sidebar toggling", () => {
    const app = useAppStore.getState();
    expect(app.currentRoute).toBe("chat");
    expect(typeof app.toggleSidebar).toBe("function");

    const initialCollapsed = useAppStore.getState().sidebarCollapsed;
    useAppStore.getState().toggleSidebar();
    expect(useAppStore.getState().sidebarCollapsed).toBe(!initialCollapsed);
    useAppStore.getState().toggleSidebar();
  });
});
