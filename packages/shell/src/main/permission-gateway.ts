import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import { SDK_CHANNELS, type Permission } from '@scitool/sdk'
import { clearSubscriptionsForWebContents } from './event-bus'

const CHANNEL_PERMISSION: Record<string, Permission> = {
  [SDK_CHANNELS.storageGet]: 'storage',
  [SDK_CHANNELS.storageSet]: 'storage',
  [SDK_CHANNELS.storageRemove]: 'storage',
  [SDK_CHANNELS.settingsGet]: 'settings',
  [SDK_CHANNELS.log]: 'log',
  [SDK_CHANNELS.uiNotify]: 'ui',
  [SDK_CHANNELS.uiMinimize]: 'ui',
  [SDK_CHANNELS.uiClose]: 'ui',
  [SDK_CHANNELS.uiMaximize]: 'ui',
  [SDK_CHANNELS.uiSaveTextFile]: 'ui',
  [SDK_CHANNELS.sharedDataGet]: 'sharedData',
  [SDK_CHANNELS.sharedDataPut]: 'sharedData',
  [SDK_CHANNELS.sharedDataList]: 'sharedData',
  [SDK_CHANNELS.sharedDataRemove]: 'sharedData',
  [SDK_CHANNELS.eventsSubscribe]: 'events',
  [SDK_CHANNELS.eventsUnsubscribe]: 'events'
}

export interface AppWindowEntry {
  appId: string
  permissions: Permission[]
}

const appWindows = new Map<number, AppWindowEntry>()

export function registerAppWindow(webContentsId: number, entry: AppWindowEntry): void {
  appWindows.set(webContentsId, entry)
}

export function unregisterAppWindow(webContentsId: number): void {
  appWindows.delete(webContentsId)
  clearSubscriptionsForWebContents(webContentsId)
}

export function appIdOfSender(event: IpcMainInvokeEvent): string | null {
  return appWindows.get(event.sender.id)?.appId ?? null
}

function checkPermission(event: IpcMainInvokeEvent, channel: string): string | null {
  const required = CHANNEL_PERMISSION[channel]
  if (!required) return `unknown sdk channel: ${channel}`
  const entry = appWindows.get(event.sender.id)
  if (!entry) return `sender is not an app window (channel: ${channel})`
  if (!entry.permissions.includes(required)) {
    return `permission denied: app "${entry.appId}" lacks "${required}" (channel: ${channel})`
  }
  return null
}

export function registerSdkHandler(
  channel: string,
  handler: (event: IpcMainInvokeEvent, payload: unknown, appId: string) => unknown | Promise<unknown>
): void {
  ipcMain.handle(channel, async (event, payload) => {
    const denial = checkPermission(event, channel)
    if (denial) return { ok: false, error: denial }
    const appId = appIdOfSender(event) as string
    try {
      return await handler(event, payload, appId)
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : String(err) }
    }
  })
}
