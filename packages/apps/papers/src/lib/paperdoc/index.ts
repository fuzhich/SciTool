// 文档引擎统一入口（接口化）：外部（导入/导出/AI 回流）只经此模块。
import { PAPERDOC_FORMAT, PAPERDOC_VERSION, type PaperDoc, type PaperMeta } from './types'

export { PAPERDOC_FORMAT, PAPERDOC_VERSION } from './types'
export type { PaperDoc, PaperMeta } from './types'

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export function emptyMeta(): PaperMeta {
  return { title: '', authors: '', affiliations: '', year: '', venue: '', doi: '', abstract: '', keywords: '' }
}

export function createPaperDoc(title: string, folderId: string | null, pdfRef: string | null, pdfName: string): PaperDoc {
  const now = new Date().toISOString()
  return {
    format: PAPERDOC_FORMAT,
    version: PAPERDOC_VERSION,
    id: newId('paper'),
    folderId,
    createdAt: now,
    updatedAt: now,
    pdfRef,
    pdfName,
    meta: emptyMeta()
  }
}

export function normalizeDoc(raw: unknown): PaperDoc {
  const d = raw as Record<string, unknown> | null
  if (!d || typeof d !== 'object') throw new Error('paperdoc 校验失败: 文档不是对象')
  if (d.format !== PAPERDOC_FORMAT) throw new Error(`paperdoc 校验失败: format 应为 ${PAPERDOC_FORMAT}`)
  if (d.version !== PAPERDOC_VERSION) throw new Error(`paperdoc 校验失败: 不支持的版本 ${String(d.version)}`)
  if (typeof d.id !== 'string' || !d.id) throw new Error('paperdoc 校验失败: id 缺失')
  if (d.folderId !== null && typeof d.folderId !== 'string') throw new Error('paperdoc 校验失败: folderId 非法')
  if (d.pdfRef !== null && typeof d.pdfRef !== 'string') throw new Error('paperdoc 校验失败: pdfRef 非法')
  if (typeof d.pdfName !== 'string') throw new Error('paperdoc 校验失败: pdfName 缺失')
  const meta = d.meta as Record<string, unknown> | null
  if (!meta || typeof meta !== 'object') throw new Error('paperdoc 校验失败: meta 缺失')
  for (const k of ['title', 'authors', 'affiliations', 'year', 'venue', 'doi', 'abstract', 'keywords']) {
    if (typeof meta[k] !== 'string') throw new Error(`paperdoc 校验失败: meta.${k} 缺失`)
  }
  return raw as unknown as PaperDoc
}
