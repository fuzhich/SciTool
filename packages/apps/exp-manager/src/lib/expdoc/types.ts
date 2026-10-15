// expdoc 文档格式 v2 —— 块式渲染文档。
// 应用与外部（导出/AI）之间的契约；格式变更走版本号升级 + migrate 钩子。
export const EXPDOC_FORMAT = 'scitool-expdoc'
export const EXPDOC_VERSION = 3
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

// 元数据（悬浮面板内容）
export interface ExpMeta {
  title: string
  type: string
  settings: ExpSetting[]
  notes: string
}

export interface TextBlock {
  id: string
  kind: 'text'
  content: string
}

export interface TableSheet {
  name: string
  columns: ExpColumn[]
  rows: Record<string, string>[]
}

export interface TableBlock {
  id: string
  kind: 'table'
  name: string
  sheets: TableSheet[]
  activeSheet: number
}

export interface ImageBlock {
  id: string
  kind: 'image'
  name: string
  caption: string
  mimeType: string
  dataBase64: string
}

export type ExpBlock = TextBlock | TableBlock | ImageBlock

export interface ExpDoc {
  format: string
  version: number
  id: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  meta: ExpMeta
  blocks: ExpBlock[]
}

// v1 结构（迁移用）
export interface ExpDocV1 {
  format: string
  version: 1
  id: string
  type: string
  title: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  settings: ExpSetting[]
  tables: { id: string; name: string; columns: ExpColumn[]; rows: Record<string, string>[] }[]
  images: { id: string; name: string; caption: string; mimeType: string; dataBase64: string }[]
  results: { id: string; title: string; content: string }[]
  notes: string
}
