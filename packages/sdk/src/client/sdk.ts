import { SDK_CHANNELS } from '../shared/channels'
import type {
  LogPayload,
  NotificationOptions,
  PlatformLanguage,
  PlatformSettings,
  Sdk,
  SdkResult,
  StorageResult
} from '../shared/types'

export interface SdkInvoker {
  invoke<T = unknown>(channel: string, payload?: unknown): Promise<T>
}

export function createSdk(appId: string, invoker: SdkInvoker): Sdk {
  return {
    version: '0.1.0',
    appId,
    storage: {
      get: async <T = unknown>(key: string): Promise<SdkResult<T | null>> => {
        const res = await invoker.invoke<StorageResult<T>>(SDK_CHANNELS.storageGet, { key })
        if (!res.exists) return { ok: true, data: null }
        return { ok: true, data: res.value }
      },
      set: async (key: string, value: unknown): Promise<SdkResult> => {
        await invoker.invoke(SDK_CHANNELS.storageSet, { key, value })
        return { ok: true }
      },
      remove: async (key: string): Promise<SdkResult> => {
        await invoker.invoke(SDK_CHANNELS.storageRemove, { key })
        return { ok: true }
      }
    },
    settings: {
      get: async (): Promise<SdkResult<PlatformSettings>> => {
        const data = await invoker.invoke<PlatformSettings>(SDK_CHANNELS.settingsGet)
        return { ok: true, data }
      },
      getLanguage: async (): Promise<SdkResult<PlatformLanguage>> => {
        const data = await invoker.invoke<PlatformSettings>(SDK_CHANNELS.settingsGet)
        return { ok: true, data: data.language }
      }
    },
    log: async (level: LogPayload['level'], message: string, data?: unknown): Promise<SdkResult> => {
      await invoker.invoke(SDK_CHANNELS.log, { level, message, data })
      return { ok: true }
    },
    ui: {
      notify: async (options: NotificationOptions): Promise<SdkResult> => {
        await invoker.invoke(SDK_CHANNELS.uiNotify, options)
        return { ok: true }
      },
      minimize: async (): Promise<SdkResult> => {
        await invoker.invoke(SDK_CHANNELS.uiMinimize)
        return { ok: true }
      },
      close: async (): Promise<SdkResult> => {
        await invoker.invoke(SDK_CHANNELS.uiClose)
        return { ok: true }
      }
    }
  }
}
