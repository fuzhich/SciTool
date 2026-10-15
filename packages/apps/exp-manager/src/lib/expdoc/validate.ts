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
  if (raw.folderId !== null && typeof raw.folderId !== 'string') return 'folderId 非法'
  if (typeof raw.createdAt !== 'string' || typeof raw.updatedAt !== 'string') return '时间戳缺失'

  const meta = raw.meta
  if (!isRecord(meta)) return 'meta 缺失'
  if (typeof meta.title !== 'string' || typeof meta.type !== 'string') return 'meta.title/type 缺失'
  if (typeof meta.notes !== 'string') return 'meta.notes 缺失'
  if (!Array.isArray(meta.settings)) return 'meta.settings 需为数组'
  for (const s of meta.settings) {
    if (!isRecord(s) || !isStrArray([s.id, s.name, s.value, s.unit])) return 'settings 项结构非法'
  }

  if (!Array.isArray(raw.blocks)) return 'blocks 需为数组'
  for (const b of raw.blocks) {
    if (!isRecord(b)) return 'block 结构非法'
    if (b.kind === 'text') {
      if (!isStrArray([b.id, b.content])) return 'text 块结构非法'
    } else if (b.kind === 'table') {
      if (
        typeof b.id !== 'string' ||
        typeof b.name !== 'string' ||
        !Array.isArray(b.sheets) ||
        typeof b.activeSheet !== 'number'
      ) {
        return 'table 块结构非法'
      }
      for (const sh of b.sheets) {
        if (!isRecord(sh) || typeof sh.name !== 'string' || !Array.isArray(sh.columns) || !Array.isArray(sh.rows)) {
          return '表格表结构非法'
        }
        for (const c of sh.columns) {
          if (!isRecord(c) || !isStrArray([c.id, c.name, c.unit])) return '表格列结构非法'
        }
        for (const r of sh.rows) {
          if (!isRecord(r)) return '表格行结构非法'
        }
      }
    } else if (b.kind === 'image') {
      if (!isStrArray([b.id, b.name, b.caption, b.mimeType, b.dataBase64])) return 'image 块结构非法'
    } else {
      return `未知块类型: ${String(b.kind)}`
    }
  }
  return null
}

export function normalizeDoc(raw: unknown): ExpDoc {
  const err = validateDoc(raw)
  if (err) throw new Error(`expdoc 校验失败: ${err}`)
  return raw as unknown as ExpDoc
}
