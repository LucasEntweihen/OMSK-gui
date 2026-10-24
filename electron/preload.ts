import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  openDirectory: () => ipcRenderer.invoke("dialog:openDirectory"),
  platform: process.platform,
});
