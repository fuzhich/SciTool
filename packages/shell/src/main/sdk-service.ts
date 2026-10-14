import { BrowserWindow } from 'electron'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { SDK_CHANNELS, type LogPayload, type NotificationOptions } from '@scitool/sdk'
import { appStorageDir } from './paths'
import { registerSdkHandler } from './permission-gateway'
import { getSettings } from './settings-store'
import { notifyUser } from './app-manager'
import { writeLog } from './logger'

interface StorageFile {
  [key: string]: unknown
}

function storageFile(appId: string): string {
  return join(appStorageDir(), `${appId}.json`)
}

function loadStorage(appId: string): StorageFile {
  try {
    if (existsSync(storageFile(appId))) {
      return JSON.parse(readFileSync(storageFile(appId), 'utf-8')) as StorageFile
    }
  } catch {
    // 损坏则重建
  }
  return {}
}

function saveStorage(appId: string, data: StorageFile): void {
  mkdirSync(appStorageDir(), { recursive: true })
  writeFileSync(storageFile(appId), JSON.stringify(data, null, 2), 'utf-8')
}

export function registerSdkServices(): void {
  registerSdkHandler(SDK_CHANNELS.storageGet, (_e, payload, appId) => {
    const { key } = payload as { key: string }
    if (typeof key !== 'string') return { ok: false, error: 'key 非法' }
    const data = loadStorage(appId)
    return { ok: true, data: key in data ? { exists: true, value: data[key] } : { exists: false, value: null } }
  })

  registerSdkHandler(SDK_CHANNELS.storageSet, (_e, payload, appId) => {
    const { key, value } = payload as { key: string; value: unknown }
    if (typeof key !== 'string') return { ok: false, error: 'key 非法' }
    const data = loadStorage(appId)
    data[key] = value
    saveStorage(appId, data)
    return { ok: true }
  })

  registerSdkHandler(SDK_CHANNELS.storageRemove, (_e, payload, appId) => {
    const { key } = payload as { key: string }
    const data = loadStorage(appId)
    delete data[key]
    saveStorage(appId, data)
    return { ok: true }
  })

  registerSdkHandler(SDK_CHANNELS.settingsGet, () => {
    return { ok: true, data: getSettings() }
  })

  registerSdkHandler(SDK_CHANNELS.log, (_e, payload, appId) => {
    const { level, message, data } = payload as LogPayload
    writeLog(appId, level, message, data)
    return { ok: true }
  })

  registerSdkHandler(SDK_CHANNELS.uiNotify, (_e, payload) => {
    const { title, body } = payload as NotificationOptions
    notifyUser(title, body)
    return { ok: true }
  })

  registerSdkHandler(SDK_CHANNELS.uiMinimize, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
    return { ok: true }
  })

  registerSdkHandler(SDK_CHANNELS.uiClose, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
    return { ok: true }
  })
}
