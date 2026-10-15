export const SDK_VERSION = '0.5.0'

export type Permission =
  | 'storage'
  | 'settings'
  | 'log'
  | 'ui'
  // 预留（M2+）
  | 'sharedData'
  | 'events'
  // SDK 0.5.0：经平台代理调用 AI（Key 由平台统一配置，不下发应用）
  | 'ai'

export interface LocalizedText {
  zh: string
  en: string
}

export interface AppManifest {
  id: string
  name: LocalizedText
  version: string
  minSdkVersion: string
  description: LocalizedText
  icon?: string
  entry: string
  permissions: Permission[]
  sharedDomains?: SharedDomainGrant[]
  update?: { url?: string }
}

export interface SharedDomainGrant {
  domain: string
  access: 'read' | 'write'
}

export interface SharedDoc {
  id: string
  appId: string
  domain: string
  revision: number
  data: unknown
  createdAt: string
  updatedAt: string
}

export type SharedDocEventType = 'created' | 'updated' | 'removed'

export interface SharedDocEvent {
  type: SharedDocEventType
  doc: SharedDoc
}

export interface AppRecord {
  id: string
  name: LocalizedText
  version: string
  description: LocalizedText
  icon?: string
  permissions: Permission[]
  entry: string
  minSdkVersion: string
  installPath: string
  installedAt: string
}

export type PlatformLanguage = 'zh' | 'en'
export type Theme = 'light' | 'dark'

export interface PlatformSettings {
  language: PlatformLanguage
  theme: Theme
}

export interface DataDirInfo {
  current: string
}

export interface StorageResult<T = unknown> {
  exists: boolean
  value: T | null
}

export interface LogPayload {
  level: 'debug' | 'info' | 'warn' | 'error'
  message: string
  data?: unknown
}

export interface NotificationOptions {
  title: string
  body?: string
}

export interface SdkResult<T = void> {
  ok: boolean
  data?: T
  error?: string
}

export interface SaveTextFileOptions {
  defaultFileName?: string
  content: string
}

export interface SdkUi {
  notify: (options: NotificationOptions) => Promise<SdkResult>
  minimize: () => Promise<SdkResult>
  close: () => Promise<SdkResult>
  // SDK 0.4.0：最大化应用窗口
  maximize: () => Promise<SdkResult>
  // SDK 0.3.0：弹原生保存对话框并写入文件；用户取消时 data 为 null
  saveTextFile: (options: SaveTextFileOptions) => Promise<SdkResult<{ path: string } | null>>
}

export interface SharedDataQuery {
  domain?: string
}

// === SDK 0.5.0：平台 AI 代理 ===

export interface AiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AiChatOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface AiChatResult {
  content: string
  model: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
  }
}

export interface SdkAi {
  available: () => Promise<SdkResult<boolean>>
  chat: (messages: AiMessage[], options?: AiChatOptions) => Promise<SdkResult<AiChatResult>>
}

export interface SharedDataPutOptions {
  domain: string
  expectedRevision?: number
}

export interface Sdk {
  version: string
  appId: string
  storage: {
    get: <T = unknown>(key: string) => Promise<SdkResult<T | null>>
    set: (key: string, value: unknown) => Promise<SdkResult>
    remove: (key: string) => Promise<SdkResult>
  }
  settings: {
    get: () => Promise<SdkResult<PlatformSettings>>
    getLanguage: () => Promise<SdkResult<PlatformLanguage>>
  }
  log: (level: LogPayload['level'], message: string, data?: unknown) => Promise<SdkResult>
  ui: SdkUi
  sharedData: {
    get: (id: string) => Promise<SdkResult<SharedDoc | null>>
    put: (id: string, data: unknown, options: SharedDataPutOptions) => Promise<SdkResult<SharedDoc>>
    list: (query?: SharedDataQuery) => Promise<SdkResult<SharedDoc[]>>
    remove: (id: string, expectedRevision?: number) => Promise<SdkResult>
  }
  events: {
    subscribe: (domain: string, callback: (event: SharedDocEvent) => void) => Promise<SdkResult<() => void>>
  }
  ai: SdkAi
}
