// expdoc 文档格式 v1 —— 应用与外部（导出/AI）之间的契约。
// 格式变更走版本号升级 + migrate 钩子，不得直接破坏性修改。
export const EXPDOC_FORMAT = 'scitool-expdoc'
export const EXPDOC_VERSION = 1
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export interface ExpSetting {
  id: string
  name: string
  value: string
  unit: string
}

export interface ExpColumn {
  id: string
  name: string
  unit: string
}

export interface ExpTable {
  id: string
  name: string
  columns: ExpColumn[]
  rows: Record<string, string>[]
}

export interface ExpImage {
  id: string
  name: string
  caption: string
  mimeType: string
  dataBase64: string
}

export interface ExpBlock {
  id: string
  title: string
  content: string
}

export interface ExpDoc {
  format: string
  version: number
  id: string
  type: string
  title: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  settings: ExpSetting[]
  tables: ExpTable[]
  images: ExpImage[]
  results: ExpBlock[]
  notes: string
}
