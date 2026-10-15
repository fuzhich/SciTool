import { BrowserWindow, dialog } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { basename } from 'path'
import { SDK_CHANNELS, type AiMessage, type LogPayload, type NotificationOptions } from '@scitool/sdk'
import { aiAvailable, aiChat } from './ai-service'
import { getDb } from './db'
import { registerSdkHandler } from './permission-gateway'
import { getSettings } from './settings-store'
import { notifyUser } from './app-manager'
import { writeLog } from './logger'
import { getSharedDoc, listSharedDocs, putSharedDoc, removeSharedDoc } from './shared-data'
import { getAppDomainAccess } from './app-registry'
import { subscribeEvents, unsubscribeEvents } from './event-bus'
import { getAppFile, listAppFiles, putAppFile, removeAppFile } from './file-store'
import { netGet } from './net-service'

export function registerSdkServices(): void {
  const db = getDb()

  registerSdkHandler(SDK_CHANNELS.storageGet, (_e, payload, appId) => {
    const { key } = payload as { key: string }
    if (typeof key !== 'string') return { ok: false, error: 'key 非法' }
    const row = db.prepare(`SELECT value FROM kv_store WHERE app_id = ? AND key = ?`).get(appId, key) as
      | { value: string }
      | undefined
    if (!row) return { ok: true, data: { exists: false, value: null } }
    return { ok: true, data: { exists: true, value: JSON.parse(row.value) } }
  })

  registerSdkHandler(SDK_CHANNELS.storageSet, (_e, payload, appId) => {
    const { key, value } = payload as { key: string; value: unknown }
    if (typeof key !== 'string') return { ok: false, error: 'key 非法' }
    db.prepare(`INSERT OR REPLACE INTO kv_store (app_id, key, value) VALUES (?, ?, ?)`).run(
      appId,
      key,
      JSON.stringify(value)
    )
    return { ok: true }
  })

  registerSdkHandler(SDK_CHANNELS.storageRemove, (_e, payload, appId) => {
    const { key } = payload as { key: string }
    db.prepare(`DELETE FROM kv_store WHERE app_id = ? AND key = ?`).run(appId, key)
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

  registerSdkHandler(SDK_CHANNELS.uiMaximize, (event) => {
    BrowserWindow.fromWebContents(event.sender)?.maximize()
    return { ok: true }
  })

  registerSdkHandler(SDK_CHANNELS.uiSaveTextFile, async (event, payload) => {
    const { defaultFileName, content } = payload as { defaultFileName?: string; content: string }
    if (typeof content !== 'string') throw new Error('content 非法')
    const win = BrowserWindow.fromWebContents(event.sender)
    const options = {
      title: '导出文件',
      defaultPath: defaultFileName ?? 'export.md',
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    }
    const result = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options)
    if (result.canceled || !result.filePath) return { ok: true, data: null }
    writeFileSync(result.filePath, content, 'utf-8')
    return { ok: true, data: { path: result.filePath } }
  })

  // === M2: 共享数据 + 事件总线 ===

  registerSdkHandler(SDK_CHANNELS.sharedDataGet, (_e, payload, appId) => {
    const { id } = payload as { id: string }
    return { ok: true, data: getSharedDoc(appId, id) }
  })

  registerSdkHandler(SDK_CHANNELS.sharedDataPut, (_e, payload, appId) => {
    const { id, data, options } = payload as {
      id: string
      data: unknown
      options: { domain: string; expectedRevision?: number }
    }
    const doc = putSharedDoc(appId, id, data, options.domain, options.expectedRevision)
    return { ok: true, data: doc }
  })

  registerSdkHandler(SDK_CHANNELS.sharedDataList, (_e, payload, appId) => {
    const { domain } = (payload ?? {}) as { domain?: string }
    return { ok: true, data: listSharedDocs(appId, domain) }
  })

  registerSdkHandler(SDK_CHANNELS.sharedDataRemove, (_e, payload, appId) => {
    const { id, expectedRevision } = payload as { id: string; expectedRevision?: number }
    removeSharedDoc(appId, id, expectedRevision)
    return { ok: true }
  })

  registerSdkHandler(SDK_CHANNELS.eventsSubscribe, (event, payload, appId) => {
    const { domain } = payload as { domain: string }
    const access = getAppDomainAccess(appId, domain)
    if (access === null) return { ok: false, error: `应用未获授权访问域名: ${domain}` }
    const subId = subscribeEvents(event.sender.id, domain)
    return { ok: true, data: { subscriptionId: subId } }
  })

  registerSdkHandler(SDK_CHANNELS.eventsUnsubscribe, (_e, payload) => {
    const { subscriptionId } = payload as { subscriptionId: number }
    unsubscribeEvents(subscriptionId)
    return { ok: true }
  })

  // === SDK 0.5.0: 平台 AI 代理 ===

  registerSdkHandler(SDK_CHANNELS.aiAvailable, () => {
    return aiAvailable()
  })

  registerSdkHandler(SDK_CHANNELS.aiChat, (_e, payload) => {
    const { messages, options } = payload as {
      messages: AiMessage[]
      options?: { model?: string; temperature?: number; maxTokens?: number }
    }
    return aiChat(messages, options)
  })

  // === SDK 0.6.0: 二进制文件存储 / 网络代理 / 文件选择 ===

  registerSdkHandler(SDK_CHANNELS.uiSaveFile, async (event, payload) => {
    const { defaultFileName, dataBase64, filters } = payload as {
      defaultFileName?: string
      dataBase64: string
      filters?: { name: string; extensions: string[] }[]
    }
    if (typeof dataBase64 !== 'string') throw new Error('dataBase64 非法')
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.SaveDialogOptions = {
      title: '保存文件',
      defaultPath: defaultFileName ?? 'export.bin',
      filters: filters && filters.length > 0 ? filters : undefined
    }
    const result = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options)
    if (result.canceled || !result.filePath) return { ok: true, data: null }
    writeFileSync(result.filePath, Buffer.from(dataBase64, 'base64'))
    return { ok: true, data: { path: result.filePath } }
  })

  registerSdkHandler(SDK_CHANNELS.uiPickFile, async (event, payload) => {
    const filters = payload as { name: string; extensions: string[] }[] | undefined
    const win = BrowserWindow.fromWebContents(event.sender)
    const options: Electron.OpenDialogOptions = {
      title: '选择文件',
      properties: ['openFile'],
      filters: filters && filters.length > 0 ? filters : undefined
    }
    const result = win ? await dialog.showOpenDialog(win, options) : await dialog.showOpenDialog(options)
    if (result.canceled || !result.filePaths[0]) return { ok: true, data: null }
    const p = result.filePaths[0]
    return { ok: true, data: { name: basename(p), data: readFileSync(p) } }
  })

  registerSdkHandler(SDK_CHANNELS.fileStorePut, (_e, payload, appId) => {
    const { name, data } = payload as { name: string; data: Uint8Array }
    if (typeof name !== 'string' || !name) throw new Error('文件名缺失')
    if (!(data instanceof Uint8Array)) throw new Error('文件数据缺失')
    return { ok: true, data: putAppFile(appId, name, data) }
  })

  registerSdkHandler(SDK_CHANNELS.fileStoreGet, (_e, payload, appId) => {
    const id = payload as string
    return { ok: true, data: getAppFile(appId, id) }
  })

  registerSdkHandler(SDK_CHANNELS.fileStoreRemove, (_e, payload, appId) => {
    const id = payload as string
    removeAppFile(appId, id)
    return { ok: true }
  })

  registerSdkHandler(SDK_CHANNELS.fileStoreList, (_e, _payload, appId) => {
    return { ok: true, data: listAppFiles(appId) }
  })

  registerSdkHandler(SDK_CHANNELS.netGet, (_e, payload) => {
    const { url, headers } = payload as { url: string; headers?: Record<string, string> }
    return netGet(url, headers)
  })
}
