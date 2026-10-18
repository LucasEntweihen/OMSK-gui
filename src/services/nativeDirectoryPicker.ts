import type { ContextFileItem } from "@/types";

interface FileSystemHandleLike {
  kind: "file" | "directory";
  name: string;
}

interface FileSystemFileHandleLike extends FileSystemHandleLike {
  kind: "file";
  getFile: () => Promise<File>;
}

interface FileSystemDirectoryHandleLike extends FileSystemHandleLike {
  kind: "directory";
  values: () => AsyncIterable<FileSystemHandleLike>;
}

export interface NativeDirectoryResult {
  folderName: string;
  folderPath: string;
  files: ContextFileItem[];
}

/**
 * Abre o seletor nativo de pastas do sistema operacional (Windows / macOS / Linux)
 * através da File System Access API padrão (window.showDirectoryPicker).
 */
export async function pickNativeDirectory(): Promise<NativeDirectoryResult | null> {
  const windowObj = window as unknown as {
    showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandleLike>;
  };

  if (typeof windowObj.showDirectoryPicker === "function") {
    try {
      const dirHandle = await windowObj.showDirectoryPicker({ mode: "read" });
      const folderName = dirHandle.name;
      const folderPath = `~/${folderName}`;
      const files = await scanDirectoryHandle(dirHandle, folderPath, 2);

      return {
        folderName,
        folderPath,
        files,
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        // Usuário cancelou a seleção nativa
        return null;
      }
      throw err;
    }
  }

  return null;
}

async function scanDirectoryHandle(
  dirHandle: FileSystemDirectoryHandleLike,
  currentPath: string,
  maxDepth: number,
  currentDepth = 0
): Promise<ContextFileItem[]> {
  if (currentDepth > maxDepth) return [];

  const items: ContextFileItem[] = [];

  try {
    for await (const entry of dirHandle.values()) {
      if (entry.name.startsWith(".git") || entry.name === "node_modules" || entry.name === "dist") {
        continue;
      }

      const itemPath = `${currentPath}/${entry.name}`;

      if (entry.kind === "directory") {
        const subHandle = entry as FileSystemDirectoryHandleLike;
        const children = await scanDirectoryHandle(subHandle, itemPath, maxDepth, currentDepth + 1);
        items.push({
          id: `dir-${itemPath}`,
          name: entry.name,
          path: itemPath,
          type: "directory",
          availability: "selected",
          isExpanded: currentDepth === 0,
          children,
        });
      } else {
        const fileHandle = entry as FileSystemFileHandleLike;
        let sizeStr = "";
        try {
          const file = await fileHandle.getFile();
          sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
        } catch {
          // ignora
        }

        items.push({
          id: `file-${itemPath}`,
          name: entry.name,
          path: itemPath,
          type: "file",
          availability: "available",
          size: sizeStr,
        });
      }
    }
  } catch {
    // Erro ao iterar diretório
  }

  return items;
}

export interface BrowseDirectoryResponse {
  success: boolean;
  currentDir: string;
  parentDir: string | null;
  homedir: string;
  entries: Array<{
    name: string;
    path: string;
    isDirectory: boolean;
    size: number;
  }>;
  error?: string;
}

/**
 * Consulta a API local do servidor Vite para navegar nos diretórios do computador
 */
export async function browseLocalDirectory(dirPath?: string): Promise<BrowseDirectoryResponse> {
  const query = dirPath ? `?dir=${encodeURIComponent(dirPath)}` : "";
  const res = await fetch(`/api/fs/browse${query}`);
  if (!res.ok) {
    throw new Error(`Falha ao navegar no diretório local (${res.status})`);
  }
  return (await res.json()) as BrowseDirectoryResponse;
}

export interface TreeDirectoryResponse {
  success: boolean;
  rootPath: string;
  tree: ContextFileItem[];
  error?: string;
}

/**
 * Carrega a árvore completa de arquivos do diretório escolhido no computador
 */
export async function fetchLocalTree(dirPath?: string): Promise<TreeDirectoryResponse> {
  const query = dirPath ? `?dir=${encodeURIComponent(dirPath)}` : "";
  const res = await fetch(`/api/fs/tree${query}`);
  if (!res.ok) {
    throw new Error(`Falha ao varrer árvore do diretório (${res.status})`);
  }
  return (await res.json()) as TreeDirectoryResponse;
}
