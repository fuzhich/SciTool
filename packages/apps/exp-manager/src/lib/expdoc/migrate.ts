import { normalizeDoc } from './validate'
import { EXPDOC_VERSION, type ExpBlock, type ExpDoc, type ExpDocV1 } from './types'

// 版本迁移入口：旧版本文档在此逐级升级到当前版本（当前 v2）。
export function migrateDoc(raw: unknown): ExpDoc {
  const version = (raw as { version?: number } | null)?.version
  if (version === EXPDOC_VERSION) return normalizeDoc(raw)
  if (version === 1) return normalizeDoc(migrateV1toV2(raw as ExpDocV1))
  return normalizeDoc(raw)
}

function migrateV1toV2(v1: ExpDocV1): Omit<ExpDoc, 'format' | 'version'> {
  const blocks: ExpBlock[] = []
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
