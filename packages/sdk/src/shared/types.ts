export const SDK_VERSION = '0.1.0'

export type Permission =
  | 'storage'
  | 'settings'
  | 'log'
  | 'ui'
  // 预留（M2+）
  | 'sharedData'
  | 'events'

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
  update?: { url?: string }
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

export interface SdkUi {
  notify: (options: NotificationOptions) => Promise<SdkResult>
  minimize: () => Promise<SdkResult>
  close: () => Promise<SdkResult>
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
}
