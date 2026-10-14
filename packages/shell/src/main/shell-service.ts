import { app, dialog, ipcMain, type BrowserWindow, type IpcMainInvokeEvent } from 'electron'
import type { AppRecord, PlatformSettings, SdkResult } from '@scitool/sdk'
import { SHELL_CHANNELS } from '../shared/shell-channels'
import { installApp, launchApp, listApps, pickZipPath, uninstallApp } from './app-manager'
import { getSettings, updateSettings } from './settings-store'
import { moveDataDir } from './data-dir'
import {
  checkForUpdates,
  downloadUpdate,
  getUpdateStatus,
  platformVersion,
  quitAndInstall
} from './updater'

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

  ipcMain.handle(SHELL_CHANNELS.dataDirGet, (event) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return { ok: true, data: { current: app.getPath('userData') } }
  })

  ipcMain.handle(SHELL_CHANNELS.dataDirPick, (event) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return wrap(async () => {
      const res = await dialog.showOpenDialog({
        title: '选择数据目录',
        properties: ['openDirectory', 'createDirectory']
      })
      if (res.canceled || !res.filePaths[0]) return null
      return res.filePaths[0]
    })
  })

  ipcMain.handle(SHELL_CHANNELS.dataDirMove, (event, target: unknown) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    try {
      if (typeof target !== 'string' || !target) throw new Error('目录路径缺失')
      moveDataDir(target, true)
      return { ok: true }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })

  ipcMain.handle(SHELL_CHANNELS.updateStatusGet, (event) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return { ok: true, data: { status: getUpdateStatus(), version: platformVersion() } }
  })

  ipcMain.handle(SHELL_CHANNELS.updateCheck, (event) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return wrap(() => checkForUpdates())
  })

  ipcMain.handle(SHELL_CHANNELS.updateDownload, (event) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return wrap(() => downloadUpdate())
  })

  ipcMain.handle(SHELL_CHANNELS.updateInstall, (event) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    quitAndInstall()
    return { ok: true }
  })

  ipcMain.handle(SHELL_CHANNELS.appUpdateCheck, (event, appId: unknown) => {
    if (!isShellSender(event)) return { ok: false, error: 'forbidden' }
    return wrap(async () => {
      if (typeof appId !== 'string') throw new Error('应用 id 缺失')
      const { checkAppUpdate } = await import('./app-updater')
      return checkAppUpdate(appId)
    })
  })
}

export function broadcastUpdateStatus(): void {
  if (shellWindow && !shellWindow.isDestroyed()) {
    shellWindow.webContents.send(SHELL_CHANNELS.updateStatusChanged, getUpdateStatus())
  }
}

export type { AppRecord }
