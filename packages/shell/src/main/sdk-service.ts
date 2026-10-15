import { BrowserWindow, dialog } from 'electron'
import { writeFileSync } from 'fs'
import { SDK_CHANNELS, type LogPayload, type NotificationOptions } from '@scitool/sdk'
import { getDb } from './db'
import { registerSdkHandler } from './permission-gateway'
import { getSettings } from './settings-store'
import { notifyUser } from './app-manager'
import { writeLog } from './logger'
import { getSharedDoc, listSharedDocs, putSharedDoc, removeSharedDoc } from './shared-data'
import { getAppDomainAccess } from './app-registry'
import { subscribeEvents, unsubscribeEvents } from './event-bus'

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
}
