import { contextBridge, ipcRenderer } from "electron"
import type { EventParams, IpcEvent } from "./ipc"
import type { IpcMainAPI } from "./ipcMain"

type Tail<T extends unknown[]> = T extends [any, ...infer Rest] ? Rest : []

function register<T extends IpcEvent>(
  name: T["name"],
  callback: (params: EventParams<T>) => void,
) {
  ipcRenderer.on(name, (_event, value) => callback(value))
}

function invoke<T extends keyof IpcMainAPI>(
  name: T,
  ...params: Tail<Parameters<IpcMainAPI[T]>>
) {
  return ipcRenderer.invoke(name, ...params) as ReturnType<IpcMainAPI[T]>
}

const api = {
  onNewFile: (callback: () => void) => register("onNewFile", callback),
  onClickOpenFile: (callback: () => void) =>
    register("onClickOpenFile", callback),
  onOpenFile: (callback: (params: { filePath: string }) => void) =>
    register("onOpenFile", callback),
  onSaveFile: (callback: () => void) => register("onSaveFile", callback),
  onSaveFileAs: (callback: () => void) => register("onSaveFileAs", callback),
  onExportWav: (callback: () => void) => register("onExportWav", callback),
  onUndo: (callback: () => void) => register("onUndo", callback),
  onRedo: (callback: () => void) => register("onRedo", callback),
  onCut: (callback: () => void) => register("onCut", callback),
  onCopy: (callback: () => void) => register("onCopy", callback),
  onPaste: (callback: () => void) => register("onPaste", callback),
  onOpenSetting: (callback: () => void) => register("onOpenSetting", callback),
  onOpenHelp: (callback: () => void) => register("onOpenHelp", callback),
  showOpenDialog: async () => await invoke("showOpenDialog"),
  showOpenDirectoryDialog: async () => await invoke("showOpenDirectoryDialog"),
  showSaveDialog: async () => await invoke("showSaveDialog"),
  saveFile: async (path: string, data: ArrayBuffer) =>
    await invoke("saveFile", path, data),
  readFile: async (path: string) => await invoke("readFile", path),
  searchSoundFonts: async (path: string) =>
    await invoke("searchSoundFonts", path),
  addRecentDocument: (path: string) => invoke("addRecentDocument", path),
}

export type ElectronAPI = typeof api

contextBridge.exposeInMainWorld("electronAPI", api)
