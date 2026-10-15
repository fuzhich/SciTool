import type { PlatformSettings, Sdk, SdkResult, SharedDoc, SharedDocEvent } from '@scitool/sdk'

// 浏览器开发（vite dev）时平台不在场，用内存 mock 预览 UI；
// 平台启动的应用由平台 preload 注入真实 window.sdk。
function createMockSdk(): Sdk {
  const kv = new Map<string, unknown>()
  const docs = new Map<string, SharedDoc>()
  const listeners = new Set<(e: SharedDocEvent) => void>()

  const ok = <T,>(data?: T): SdkResult<T> => ({ ok: true, data })
  const emit = (type: SharedDocEvent['type'], doc: SharedDoc): void => {
    for (const l of listeners) l({ type, doc })
  }
  const mockId = 'com.scitool.exp-manager (mock)'

  return {
    version: '0.6.0',
    appId: mockId,
    storage: {
      get: async (key) => (kv.has(key) ? ok(kv.get(key) as never) : ok(null)),
      set: async (key, value) => {
        kv.set(key, value)
        return ok()
      },
      remove: async (key) => {
        kv.delete(key)
        return ok()
      }
    },
    settings: {
      get: async () => ok<PlatformSettings>({ language: 'zh', theme: 'light' }),
      getLanguage: async () => ok<'zh' | 'en'>('zh')
    },
    log: async () => ok(),
    ui: {
      notify: async () => ok(),
      minimize: async () => ok(),
      close: async () => ok(),
      maximize: async () => ok(),
      saveTextFile: async (options) => {
        const blob = new Blob([options.content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = options.defaultFileName ?? 'export.txt'
        a.click()
        URL.revokeObjectURL(url)
        return ok({ path: a.download })
      },
      pickFile: async () => ok(null)
    },
    sharedData: {
      get: async (id) => ok(docs.get(id) ?? null),
      put: async (id, data, options) => {
        const existing = docs.get(id)
        if (
          options.expectedRevision !== undefined &&
          existing &&
          existing.revision !== options.expectedRevision
        ) {
          return { ok: false, error: `revision 冲突：期望 ${options.expectedRevision}，实际 ${existing.revision}` }
        }
        const now = new Date().toISOString()
        const doc: SharedDoc = existing
          ? { ...existing, revision: existing.revision + 1, data, updatedAt: now }
          : { id, appId: mockId, domain: options.domain, revision: 1, data, createdAt: now, updatedAt: now }
        docs.set(id, doc)
        emit(existing ? 'updated' : 'created', doc)
        return ok(doc)
      },
      list: async (query) =>
        ok([...docs.values()].filter((d) => !query?.domain || d.domain === query.domain)),
      remove: async (id, expectedRevision) => {
        const existing = docs.get(id)
        if (!existing) return { ok: false, error: `文档不存在: ${id}` }
        if (expectedRevision !== undefined && existing.revision !== expectedRevision) {
          return { ok: false, error: `revision 冲突：期望 ${expectedRevision}，实际 ${existing.revision}` }
        }
        docs.delete(id)
        emit('removed', existing)
        return ok()
      }
    },
    events: {
      subscribe: async (_domain, callback) => {
        listeners.add(callback)
        return ok(() => listeners.delete(callback))
      }
    },
    ai: {
      available: async () => ok(false),
      chat: async () => ok({ content: '（mock AI 回复）浏览器预览模式下为模拟回复。', model: 'mock' })
    },
    fileStore: {
      put: async (name, data) => {
        const id = 'mock-' + (mockFiles.size + 1) + '-' + name
        mockFiles.set(id, { name, data })
        return ok(id)
      },
      get: async (id) => ok(mockFiles.get(id) ?? null),
      remove: async (id) => {
        mockFiles.delete(id)
        return ok()
      },
      list: async () =>
        ok(
          [...mockFiles.entries()].map(([id, f]) => ({
            id,
            name: f.name,
            size: f.data.byteLength,
            createdAt: new Date().toISOString()
          }))
        )
    },
    net: {
      get: async (url) => ({ ok: false, error: 'mock 模式不支持网络请求: ' + url })
    }
  }
}

const mockFiles = new Map<string, { name: string; data: Uint8Array }>()

export function getSdk(): Sdk | null {
  if (window.sdk) return window.sdk
  if (import.meta.env.DEV) return createMockSdk()
  return null
}
