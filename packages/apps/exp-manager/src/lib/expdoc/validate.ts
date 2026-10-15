import { EXPDOC_FORMAT, EXPDOC_VERSION, type ExpDoc } from './types'

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function isStrArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

// 结构校验：返回错误信息，null 表示通过。导入外部数据（AI 产出等）时同一入口。
export function validateDoc(raw: unknown): string | null {
  if (!isRecord(raw)) return '文档不是对象'
  if (raw.format !== EXPDOC_FORMAT) return `format 应为 ${EXPDOC_FORMAT}`
  if (raw.version !== EXPDOC_VERSION) return `不支持的文档版本: ${String(raw.version)}`
  if (typeof raw.id !== 'string' || !raw.id) return 'id 缺失'
  if (typeof raw.title !== 'string') return 'title 缺失'
  if (typeof raw.type !== 'string') return 'type 缺失'
  if (raw.folderId !== null && typeof raw.folderId !== 'string') return 'folderId 非法'
  if (typeof raw.createdAt !== 'string' || typeof raw.updatedAt !== 'string') return '时间戳缺失'

  if (!Array.isArray(raw.settings) || !Array.isArray(raw.tables) || !Array.isArray(raw.images) || !Array.isArray(raw.results)) {
    return 'settings/tables/images/results 需为数组'
  }
  for (const s of raw.settings) {
    if (!isRecord(s) || !isStrArray([s.id, s.name, s.value, s.unit])) return 'settings 项结构非法'
  }
  for (const t of raw.tables) {
    if (!isRecord(t) || typeof t.id !== 'string' || typeof t.name !== 'string' || !Array.isArray(t.columns) || !Array.isArray(t.rows)) {
      return 'tables 项结构非法'
    }
    for (const c of t.columns) {
      if (!isRecord(c) || !isStrArray([c.id, c.name, c.unit])) return '表格列结构非法'
    }
    for (const r of t.rows) {
      if (!isRecord(r)) return '表格行结构非法'
    }
  }
  for (const img of raw.images) {
    if (!isRecord(img) || !isStrArray([img.id, img.name, img.caption, img.mimeType, img.dataBase64])) {
      return 'images 项结构非法'
    }
  }
  for (const b of raw.results) {
    if (!isRecord(b) || !isStrArray([b.id, b.title, b.content])) return 'results 项结构非法'
  }
  if (typeof raw.notes !== 'string') return 'notes 缺失'
  return null
}

export function normalizeDoc(raw: unknown): ExpDoc {
  const err = validateDoc(raw)
  if (err) throw new Error(`expdoc 校验失败: ${err}`)
  return raw as unknown as ExpDoc
}
