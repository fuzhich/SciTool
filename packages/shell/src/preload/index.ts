import { contextBridge, ipcRenderer } from 'electron'
import { SHELL_CHANNELS } from '../shared/shell-channels'
import type { AppRecord, DataDirInfo, PlatformSettings, SdkResult } from '@scitool/sdk'

const api = {
  apps: {
    list: (): Promise<SdkResult<AppRecord[]>> => ipcRenderer.invoke(SHELL_CHANNELS.appsList),
    install: (zipPath: string): Promise<SdkResult<AppRecord>> =>
      ipcRenderer.invoke(SHELL_CHANNELS.appsInstall, zipPath),
    uninstall: (appId: string): Promise<SdkResult> => ipcRenderer.invoke(SHELL_CHANNELS.appsUninstall, appId),
    launch: (appId: string): Promise<SdkResult> => ipcRenderer.invoke(SHELL_CHANNELS.appsLaunch, appId),
    pickZip: (): Promise<SdkResult<string | null>> => ipcRenderer.invoke(SHELL_CHANNELS.pickZip)
  },
  settings: {
    get: (): Promise<SdkResult<PlatformSettings>> => ipcRenderer.invoke(SHELL_CHANNELS.settingsGet),
    set: (patch: Partial<PlatformSettings>): Promise<SdkResult<PlatformSettings>> =>
      ipcRenderer.invoke(SHELL_CHANNELS.settingsSet, patch)
  },
  dataDir: {
    get: (): Promise<SdkResult<DataDirInfo>> => ipcRenderer.invoke(SHELL_CHANNELS.dataDirGet),
    pick: (): Promise<SdkResult<string | null>> => ipcRenderer.invoke(SHELL_CHANNELS.dataDirPick),
    move: (target: string): Promise<SdkResult> => ipcRenderer.invoke(SHELL_CHANNELS.dataDirMove, target)
  },
  onAppsChanged: (callback: (apps: AppRecord[]) => void): (() => void) => {
    const listener = (_e: Electron.IpcRendererEvent, apps: AppRecord[]): void => callback(apps)
    ipcRenderer.on(SHELL_CHANNELS.onAppsChanged, listener)
    return () => {
      ipcRenderer.removeListener(SHELL_CHANNELS.onAppsChanged, listener)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)

export type ShellApi = typeof api
