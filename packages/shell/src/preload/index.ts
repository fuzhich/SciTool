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
  updates: {
    status: (): Promise<SdkResult<{ status: unknown; version: string }>> =>
      ipcRenderer.invoke(SHELL_CHANNELS.updateStatusGet),
    check: (): Promise<SdkResult<unknown>> => ipcRenderer.invoke(SHELL_CHANNELS.updateCheck),
    download: (): Promise<SdkResult> => ipcRenderer.invoke(SHELL_CHANNELS.updateDownload),
    install: (): Promise<SdkResult> => ipcRenderer.invoke(SHELL_CHANNELS.updateInstall),
    checkApp: (appId: string): Promise<SdkResult<unknown>> =>
      ipcRenderer.invoke(SHELL_CHANNELS.appUpdateCheck, appId),
    onStatusChanged: (callback: (status: unknown) => void): (() => void) => {
      const listener = (_e: Electron.IpcRendererEvent, status: unknown): void => callback(status)
      ipcRenderer.on(SHELL_CHANNELS.updateStatusChanged, listener)
      return () => {
        ipcRenderer.removeListener(SHELL_CHANNELS.updateStatusChanged, listener)
      }
    }
  },
  ai: {
    get: (): Promise<SdkResult<{ provider: string; baseUrl: string; model: string; hasKey: boolean }>> =>
      ipcRenderer.invoke(SHELL_CHANNELS.aiConfigGet),
    set: (patch: {
      provider?: string
      baseUrl?: string
      model?: string
      apiKey?: string
    }): Promise<SdkResult> => ipcRenderer.invoke(SHELL_CHANNELS.aiConfigSet, patch)
  },
  market: {
    fetch: (): Promise<SdkResult<import('../shared/market').MarketManifest>> =>
      ipcRenderer.invoke(SHELL_CHANNELS.marketFetch),
    install: (app: import('../shared/market').MarketApp): Promise<SdkResult> =>
      ipcRenderer.invoke(SHELL_CHANNELS.marketInstall, app)
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
