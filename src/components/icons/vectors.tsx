import React from "react";
import { Icon, type IconProps } from "./Icon";

export * from "./Icon";

/**
 * SharkFinIcon — O símbolo heráldico exclusivo do Oh My Shark.
 * Linha aerodinâmica com curvatura predadora e barbatana dorsal estilizada.
 */
export const SharkFinIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path
      d="M3 20C4.5 19.5 7 18.5 9 15C11.5 10.5 13 4 19 3C18 7.5 17.5 11 19.5 14C20.5 15.5 21 17 21 20H3Z"
      fill={props.active ? "currentColor" : "none"}
    />
    <path d="M2 21C6 20.5 18 20.5 22 21" strokeOpacity="0.6" />
  </Icon>
);

export const WebNetIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="3" x2="12" y2="9" />
    <line x1="12" y1="15" x2="12" y2="21" />
    <line x1="3" y1="12" x2="9" y2="12" />
    <line x1="15" y1="12" x2="21" y2="12" />
    <path d="M5.6 5.6L9.9 9.9" />
    <path d="M14.1 14.1L18.4 18.4" />
    <path d="M18.4 5.6L14.1 9.9" />
    <path d="M9.9 14.1L5.6 18.4" />
  </Icon>
);

export const ChatIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5273 20 9.13524 19.6644 7.90425 19.0664L3 20.5L4.43359 16.0957C3.52988 14.7749 3 13.2084 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" />
    <path d="M8 11.5H16" strokeLinecap="round" strokeOpacity="0.7" />
    <path d="M8 8H13" strokeLinecap="round" strokeOpacity="0.7" />
  </Icon>
);

export const TasksIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <path d="M9 2V5" />
    <path d="M15 2V5" />
    <path d="M7 10L9 12L13 8" />
    <path d="M7 16H17" strokeLinecap="round" />
  </Icon>
);

export const ContextIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" strokeOpacity="0.5" />
    <path d="M12 3V6" />
    <path d="M12 18V21" />
    <path d="M3 12H6" />
    <path d="M18 12H21" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
  </Icon>
);

export const ToolsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    <path d="M4.5 19.5L6 21" strokeOpacity="0.6" />
  </Icon>
);

export const ProvidersIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <rect x="4" y="4" width="6" height="6" rx="1.5" />
    <rect x="14" y="4" width="6" height="6" rx="1.5" />
    <rect x="9" y="14" width="6" height="6" rx="1.5" />
    <path d="M7 10V12C7 13.1046 7.89543 14 9 14" />
    <path d="M17 10V12C17 13.1046 16.1046 14 15 14" />
  </Icon>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
);

export const SystemPromptIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" />
    <path d="M6 9L10 12L6 15" />
    <path d="M12 15H17" strokeLinecap="round" />
  </Icon>
);

export const SpecificationsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" />
    <path d="M14 2V8H20" />
    <path d="M8 13H16" strokeLinecap="round" />
    <path d="M8 17H13" strokeLinecap="round" />
  </Icon>
);

export const AgentsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M12 2L20 6V12C20 17 16.5 21 12 22C7.5 21 4 17 4 12V6L12 2Z" />
    <circle cx="12" cy="11" r="3" />
    <path d="M8 17C8.5 15.5 10.1 14.5 12 14.5C13.9 14.5 15.5 15.5 16 17" />
  </Icon>
);

export const AnalyticsIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M3 20H21" />
    <rect x="5" y="11" width="3" height="9" rx="1" />
    <rect x="11" y="7" width="3" height="13" rx="1" />
    <rect x="17" y="3" width="3" height="17" rx="1" />
    <path d="M6 8L12 4L18 8" strokeDasharray="1.5 1.5" strokeOpacity="0.6" />
  </Icon>
);

export const TerminalIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </Icon>
);

export const FolderIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </Icon>
);

export const FileIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <polyline points="13 2 13 9 20 9" />
  </Icon>
);

export const CodeIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </Icon>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </Icon>
);

export const ClockIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Icon>
);

export const AlertCircleIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Icon>
);

export const XCircleIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </Icon>
);

export const PlayIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <polygon points="5 3 19 12 5 21 5 3" />
  </Icon>
);

export const PauseIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </Icon>
);

export const StopIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </Icon>
);

export const RefreshIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </Icon>
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

export const SlidersIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </Icon>
);

export const PaperclipIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </Icon>
);

export const CameraIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </Icon>
);

export const MicIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </Icon>
);

export const SendIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </Icon>
);

export const ArrowUpIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </Icon>
);

export const ChevronDownIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <polyline points="6 9 12 15 18 9" />
  </Icon>
);

export const ChevronRightIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6" />
  </Icon>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Icon>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Icon>
);

export const CopyIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </Icon>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <polyline points="20 6 9 17 4 12" />
  </Icon>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Icon>
);

export const SidebarToggleIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="9" y1="3" x2="9" y2="21" />
  </Icon>
);

export const PanelRightToggleIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </Icon>
);

export const GitBranchIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </Icon>
);

export const CpuIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </Icon>
);

export const BatteryIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <rect x="1" y="6" width="18" height="12" rx="2" />
    <line x1="23" y1="13" x2="23" y2="11" />
    <line x1="5" y1="10" x2="5" y2="14" />
    <line x1="9" y1="10" x2="9" y2="14" />
  </Icon>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M12 3L14.5 8.5L20 11L14.5 13.5L12 19L9.5 13.5L4 11L9.5 8.5L12 3Z" />
  </Icon>
);

export const UserIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Icon>
);

export const CommandIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
  </Icon>
);

export const CompassIcon: React.FC<IconProps> = (props) => (
  <Icon {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </Icon>
);
