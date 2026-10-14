import { app } from 'electron'
import { autoUpdater, type UpdateInfo } from 'electron-updater'
import { is } from '@electron-toolkit/utils'
import { writeLog } from './logger'

type UpdateStatus =
  | { state: 'idle' }
  | { state: 'checking' }
  | { state: 'available'; version: string }
  | { state: 'not-available'; version: string }
  | { state: 'downloading'; percent: number }
  | { state: 'downloaded'; version: string }
  | { state: 'error'; message: string }

let status: UpdateStatus = { state: 'idle' }
let statusListener: ((s: UpdateStatus) => void) | null = null

export function getUpdateStatus(): UpdateStatus {
  return status
}

export function onUpdateStatus(listener: (s: UpdateStatus) => void): void {
  statusListener = listener
}

function setStatus(next: UpdateStatus): void {
  status = next
  statusListener?.(next)
}

export function initUpdater(): void {
  if (is.dev) {
    autoUpdater.forceDevUpdateConfig = true
  }
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.logger = {
    info: (m) => writeLog('updater', 'info', String(m)),
    warn: (m) => writeLog('updater', 'warn', String(m)),
    error: (m) => writeLog('updater', 'error', String(m)),
    debug: (m) => writeLog('updater', 'debug', String(m))
  }

  autoUpdater.on('checking-for-update', () => setStatus({ state: 'checking' }))
  autoUpdater.on('update-available', (info: UpdateInfo) => setStatus({ state: 'available', version: info.version }))
  autoUpdater.on('update-not-available', (info: UpdateInfo) => setStatus({ state: 'not-available', version: info.version }))
  autoUpdater.on('download-progress', (p) => setStatus({ state: 'downloading', percent: Math.round(p.percent) }))
  autoUpdater.on('update-downloaded', (info: UpdateInfo) => setStatus({ state: 'downloaded', version: info.version }))
  autoUpdater.on('error', (err) => {
    writeLog('updater', 'error', String(err))
    setStatus({ state: 'error', message: String(err) })
  })
}

export async function checkForUpdates(): Promise<UpdateStatus> {
  try {
    const result = await autoUpdater.checkForUpdates()
    const info = result?.updateInfo
    if (info) {
      const next: UpdateStatus = { state: 'available', version: info.version }
      setStatus(next)
      return next
    }
  } catch (err) {
    writeLog('updater', 'error', String(err))
    setStatus({ state: 'error', message: err instanceof Error ? err.message : String(err) })
  }
  return status
}

export async function downloadUpdate(): Promise<void> {
  await autoUpdater.downloadUpdate()
}

export function quitAndInstall(): void {
  autoUpdater.quitAndInstall(false, true)
}

export function platformVersion(): string {
  return app.getVersion()
}

export function setUpdateFeed(url: string): void {
  autoUpdater.setFeedURL({ provider: 'generic', url })
  writeLog('updater', 'info', `feed url overridden: ${url}`)
}
