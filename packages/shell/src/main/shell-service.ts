import { ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import type { AppRecord, PlatformSettings, SdkResult } from '@scitool/sdk'
import { SHELL_CHANNELS } from '../shared/shell-channels'
import { installApp, launchApp, listApps, pickZipPath, uninstallApp } from './app-manager'
import { getSettings, updateSettings } from './settings-store'

let shellWindow: BrowserWindow | null = null

export function setShellWindow(win: BrowserWindow | null): void {
  shellWindow = win
}

function isShellSender(event: IpcMainInvokeEvent): boolean {
  return shellWindow !== null && event.sender === shellWindow.webContents
}

function wrap<T>(fn: () => Promise<T> | T): Promise<SdkResult<T>> {
  return Promise.resolve()
    .then(fn)
    .then((data) => ({ ok: true, data }))
    .catch((err) => ({ ok: false, error: err instanceof Error ? err.message : String(err) }))
}

export function broadcastAppsChanged(): void {
  if (shellWindow && !shellWindow.isDestroyed()) {
    shellWindow.webContents.send(SHELL_CHANNELS.onAppsChanged, listApps())
  }
}

export function registerShellServices(): void {
  ipcMain.handle(SHELL_CHANNELS.appsList, (event) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return { ok: true, data: listApps() }
  })

  ipcMain.handle(SHELL_CHANNELS.pickZip, (event) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return wrap(() => pickZipPath())
  })

  ipcMain.handle(SHELL_CHANNELS.appsInstall, (event, zipPath: unknown) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return wrap(async () => {
      if (typeof zipPath !== 'string' || !zipPath) throw new Error('安装包路径缺失')
      const record = await installApp(zipPath)
      broadcastAppsChanged()
      return record
    })
  })

  ipcMain.handle(SHELL_CHANNELS.appsUninstall, (event, appId: unknown) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return wrap(async () => {
      if (typeof appId !== 'string') throw new Error('应用 id 缺失')
      await uninstallApp(appId)
      broadcastAppsChanged()
    })
  })

  ipcMain.handle(SHELL_CHANNELS.appsLaunch, (event, appId: unknown) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return wrap(async () => {
      if (typeof appId !== 'string') throw new Error('应用 id 缺失')
      await launchApp(appId)
    })
  })

  ipcMain.handle(SHELL_CHANNELS.settingsGet, (event) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return { ok: true, data: getSettings() }
  })

  ipcMain.handle(SHELL_CHANNELS.settingsSet, (event, patch: Partial<PlatformSettings>) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return { ok: true, data: updateSettings(patch) }
  })
}

export type { AppRecord }
