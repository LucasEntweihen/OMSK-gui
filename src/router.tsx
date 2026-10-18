import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPage } from "@/features/chat/ChatPage";
import { TasksPage } from "@/features/tasks/TasksPage";
import { ContextPage } from "@/features/context/ContextPage";
import { ToolsPage } from "@/features/tools/ToolsPage";
import { ProvidersPage } from "@/features/providers/ProvidersPage";
import { SettingsPage } from "@/features/settings/SettingsPage";
import { SystemPromptPage } from "@/features/system-prompt/SystemPromptPage";
import { SpecificationsPage } from "@/features/specifications/SpecificationsPage";
import { AgentsPage } from "@/features/agents/AgentsPage";
import { AnalyticsPage } from "@/features/analytics/AnalyticsPage";
import { TeiaPage } from "@/features/teia/TeiaPage";
import { NotFoundPage } from "@/features/not-found/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <ChatPage />,
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
      {
        path: "teia",
        element: <TeiaPage />,
      },
      {
        path: "tasks",
        element: <TasksPage />,
      },
      {
        path: "context",
        element: <ContextPage />,
      },
      {
        path: "tools",
        element: <ToolsPage />,
      },
      {
        path: "providers",
        element: <ProvidersPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "system-prompt",
        element: <SystemPromptPage />,
      },
      {
        path: "specifications",
        element: <SpecificationsPage />,
      },
      {
        path: "agents",
        element: <AgentsPage />,
      },
      {
        path: "analytics",
        element: <AnalyticsPage />,
      },
      {
        path: "404",
        element: <NotFoundPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
