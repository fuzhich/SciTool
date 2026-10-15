import { normalizeDoc } from './validate'
import {
  EXPDOC_FORMAT,
  EXPDOC_VERSION,
  type ExpBlock,
  type ExpColumn,
  type ExpDoc,
  type ExpDocV1
} from './types'

// 版本迁移入口：旧版本文档在此逐级升级到当前版本（当前 v3）。
export function migrateDoc(raw: unknown): ExpDoc {
  const version = (raw as { version?: number } | null)?.version
  if (version === EXPDOC_VERSION) return normalizeDoc(raw)
  if (version === 1) return normalizeDoc(migrateV2toV3(migrateV1toV2(raw as ExpDocV1)))
  if (version === 2) return normalizeDoc(migrateV2toV3(raw as unknown as V2Doc))
  return normalizeDoc(raw)
}

interface V2TableBlock {
  id: string
  kind: 'table'
  name: string
  columns: ExpColumn[]
  rows: Record<string, string>[]
}

interface V2Block {
  id: string
  kind: 'text' | 'table' | 'image'
  content?: string
  name?: string
  caption?: string
  mimeType?: string
  dataBase64?: string
  columns?: ExpColumn[]
  rows?: Record<string, string>[]
}

interface V2Doc {
  format: string
  version: 2
  id: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  meta: ExpDoc['meta']
  blocks: V2Block[]
}

// v2 → v3：表格块升级为多表（原表包成第一个 sheet）
function migrateV2toV3(v2: V2Doc): ExpDoc {
  const blocks: ExpBlock[] = v2.blocks.map((b) => {
    if (b.kind === 'table') {
      const t = b as V2TableBlock
      return {
        id: t.id,
        kind: 'table',
        name: t.name,
        sheets: [{ name: '', columns: t.columns ?? [], rows: t.rows ?? [] }],
        activeSheet: 0
      }
    }
    if (b.kind === 'image') {
      return {
        id: b.id,
        kind: 'image',
        name: b.name ?? '',
        caption: b.caption ?? '',
        mimeType: b.mimeType ?? '',
        dataBase64: b.dataBase64 ?? ''
      }
    }
    return { id: b.id, kind: 'text', content: b.content ?? '' }
  })
  return {
    format: EXPDOC_FORMAT,
    version: EXPDOC_VERSION,
    id: v2.id,
    folderId: v2.folderId,
    createdAt: v2.createdAt,
    updatedAt: v2.updatedAt,
    meta: v2.meta,
    blocks
  }
}

// v1 → v2：tables→表格块、images→图片块、results→文本块（标题为一级标题）、settings/notes→meta
function migrateV1toV2(v1: ExpDocV1): V2Doc {
  const blocks: V2Block[] = []
  for (const t of v1.tables ?? []) {
    blocks.push({ id: t.id, kind: 'table', name: t.name, columns: t.columns ?? [], rows: t.rows ?? [] })
  }
  for (const img of v1.images ?? []) {
    blocks.push({
      id: img.id,
      kind: 'image',
      name: img.name,
      caption: img.caption,
      mimeType: img.mimeType,
      dataBase64: img.dataBase64
    })
  }
  for (const r of v1.results ?? []) {
    const content = r.title ? `# ${r.title}\n\n${r.content}` : r.content
    blocks.push({ id: r.id, kind: 'text', content })
  }
  return {
    format: EXPDOC_FORMAT,
    version: 2,
    id: v1.id,
    folderId: v1.folderId ?? null,
    createdAt: v1.createdAt,
    updatedAt: v1.updatedAt,
    meta: {
      title: v1.title ?? '',
      type: v1.type ?? '',
      settings: v1.settings ?? [],
      notes: v1.notes ?? ''
    },
    blocks
  }
}
