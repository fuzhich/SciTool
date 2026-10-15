import { SDK_CHANNELS } from '../shared/channels'
import type {
  AiChatResult,
  FileEntry,
  LogPayload,
  NetResult,
  NotificationOptions,
  PickedFile,
  PlatformLanguage,
  PlatformSettings,
  Sdk,
  SdkResult,
  SharedDataPutOptions,
  SharedDataQuery,
  SharedDoc,
  SharedDocEvent,
  StorageResult,
  StoredFile
} from '../shared/types'

export interface SdkInvoker {
  invoke<T = unknown>(channel: string, payload?: unknown): Promise<T>
  on(channel: string, listener: (payload: unknown) => void): () => void
}

interface SharedDocRow {
  id: string
  appId: string
  domain: string
  revision: number
  data: unknown
  createdAt: string
  updatedAt: string
}

function toDoc(row: SharedDocRow): SharedDoc {
  return {
    id: row.id,
    appId: row.appId,
    domain: row.domain,
    revision: row.revision,
    data: typeof row.data === 'string' ? JSON.parse(row.data) : row.data,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }
}

export function createSdk(appId: string, invoker: SdkInvoker): Sdk {
  return {
    version: '0.2.0',
    appId,
    storage: {
      get: async <T = unknown>(key: string): Promise<SdkResult<T | null>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: StorageResult<T>; error?: string }>(
          SDK_CHANNELS.storageGet,
          { key }
        )
        if (!res.ok) return { ok: false, error: res.error }
        if (!res.data?.exists) return { ok: true, data: null }
        return { ok: true, data: res.data.value }
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
      },
      maximize: async (): Promise<SdkResult> => {
        await invoker.invoke(SDK_CHANNELS.uiMaximize)
        return { ok: true }
      },
      saveTextFile: async (options): Promise<SdkResult<{ path: string } | null>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: { path: string } | null; error?: string }>(
          SDK_CHANNELS.uiSaveTextFile,
          options
        )
        return res.ok ? { ok: true, data: res.data ?? null } : { ok: false, error: res.error }
      },
      pickFile: async (filters): Promise<SdkResult<PickedFile | null>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: PickedFile | null; error?: string }>(
          SDK_CHANNELS.uiPickFile,
          filters
        )
        return res.ok ? { ok: true, data: res.data ?? null } : { ok: false, error: res.error }
      }
    },
    sharedData: {
      get: async (id: string): Promise<SdkResult<SharedDoc | null>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: SharedDocRow | null; error?: string }>(
          SDK_CHANNELS.sharedDataGet,
          { id }
        )
        if (!res.ok) return { ok: false, error: res.error }
        return { ok: true, data: res.data ? toDoc(res.data) : null }
      },
      put: async (id: string, data: unknown, options: SharedDataPutOptions): Promise<SdkResult<SharedDoc>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: SharedDocRow; error?: string }>(
          SDK_CHANNELS.sharedDataPut,
          { id, data, options }
        )
        if (!res.ok) return { ok: false, error: res.error }
        return { ok: true, data: toDoc(res.data as SharedDocRow) }
      },
      list: async (query?: SharedDataQuery): Promise<SdkResult<SharedDoc[]>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: SharedDocRow[]; error?: string }>(
          SDK_CHANNELS.sharedDataList,
          query ?? {}
        )
        if (!res.ok) return { ok: false, error: res.error }
        return { ok: true, data: (res.data ?? []).map(toDoc) }
      },
      remove: async (id: string, expectedRevision?: number): Promise<SdkResult> => {
        const res = await invoker.invoke<{ ok: boolean; error?: string }>(SDK_CHANNELS.sharedDataRemove, {
          id,
          expectedRevision
        })
        return res.ok ? { ok: true } : { ok: false, error: res.error }
      }
    },
    ai: {
      available: async (): Promise<SdkResult<boolean>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: boolean; error?: string }>(SDK_CHANNELS.aiAvailable)
        return res.ok ? { ok: true, data: res.data ?? false } : { ok: false, error: res.error }
      },
      chat: async (messages, options): Promise<SdkResult<AiChatResult>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: AiChatResult; error?: string }>(
          SDK_CHANNELS.aiChat,
          { messages, options }
        )
        return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.error }
      }
    },
    events: {
      subscribe: async (
        domain: string,
        callback: (event: SharedDocEvent) => void
      ): Promise<SdkResult<() => void>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: { subscriptionId: number }; error?: string }>(
          SDK_CHANNELS.eventsSubscribe,
          { domain }
        )
        if (!res.ok) return { ok: false, error: res.error }
        const subId = res.data?.subscriptionId
        const off = invoker.on(SDK_CHANNELS.eventsNotify, (payload) => {
          const event = payload as SharedDocEvent & { subscriptionId?: number }
          if (subId !== undefined && event.subscriptionId !== subId) return
          callback(event)
        })
        return {
          ok: true,
          data: () => {
            off()
            void invoker.invoke(SDK_CHANNELS.eventsUnsubscribe, { subscriptionId: subId })
          }
        }
      }
    },
    fileStore: {
      put: async (name, data): Promise<SdkResult<string>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: string; error?: string }>(
          SDK_CHANNELS.fileStorePut,
          { name, data }
        )
        return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.error }
      },
      get: async (id): Promise<SdkResult<StoredFile | null>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: StoredFile | null; error?: string }>(
          SDK_CHANNELS.fileStoreGet,
          id
        )
        return res.ok ? { ok: true, data: res.data ?? null } : { ok: false, error: res.error }
      },
      remove: async (id): Promise<SdkResult> => {
        const res = await invoker.invoke<{ ok: boolean; error?: string }>(SDK_CHANNELS.fileStoreRemove, id)
        return res.ok ? { ok: true } : { ok: false, error: res.error }
      },
      list: async (): Promise<SdkResult<FileEntry[]>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: FileEntry[]; error?: string }>(SDK_CHANNELS.fileStoreList)
        return res.ok ? { ok: true, data: res.data ?? [] } : { ok: false, error: res.error }
      }
    },
    net: {
      get: async (url, headers): Promise<SdkResult<NetResult>> => {
        const res = await invoker.invoke<{ ok: boolean; data?: NetResult; error?: string }>(SDK_CHANNELS.netGet, {
          url,
          headers
        })
        return res.ok ? { ok: true, data: res.data } : { ok: false, error: res.error }
      }
    }
  }
}
