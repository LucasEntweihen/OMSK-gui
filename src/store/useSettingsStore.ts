import { create } from "zustand";
import { z } from "zod";
import type { AppSettings } from "@/types";

const SettingsSchema = z.object({
  density: z.enum(["comfortable", "compact"]).default("comfortable"),
  theme: z.enum(["deep-ocean", "ocean-midnight", "high-contrast"]).default("deep-ocean"),
  animationsEnabled: z.boolean().default(true),
  soundEffects: z.boolean().default(false),
  approvalMode: z.enum(["yolo", "write", "always-ask"]).default("write"),
  telemetry: z.boolean().default(false),
  autoTitle: z.boolean().default(true),
  codeEditorFontSize: z.number().min(10).max(24).default(13),
  shortcuts: z.record(z.string(), z.string()).default({
    "app.chat": "⌘K",
    "app.tasks": "⌘T",
    "app.context": "⌘C",
    "app.tools": "⌘P",
    "app.providers": "⌘O",
    "app.settings": "⌘,",
    "app.toggleSidebar": "⌘B",
    "app.toggleInspector": "⌘I",
    "app.commandPalette": "⌘P",
  }),
});

const DEFAULT_SETTINGS: AppSettings = SettingsSchema.parse({});

const STORAGE_KEY = "oh-my-shark-settings-v1";

function loadPersistedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    const result = SettingsSchema.safeParse(parsed);
    return result.success ? result.data : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface SettingsState {
  settings: AppSettings;
  isSaved: boolean;
  hasUnsavedChanges: boolean;

  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  saveSettings: () => void;
  resetDefaults: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: loadPersistedSettings(),
  isSaved: true,
  hasUnsavedChanges: false,

  updateSetting: (key, value) => {
    set((state) => ({
      settings: { ...state.settings, [key]: value },
      hasUnsavedChanges: true,
      isSaved: false,
    }));
  },

  saveSettings: () => {
    const current = get().settings;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      set({ isSaved: true, hasUnsavedChanges: false });
    } catch {
      // Falha de persistência
    }
  },

  resetDefaults: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      set({ settings: DEFAULT_SETTINGS, isSaved: true, hasUnsavedChanges: false });
    } catch {
      // Ignorar falha
    }
  },
}));
