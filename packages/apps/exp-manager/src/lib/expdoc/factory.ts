import { EXPDOC_FORMAT, EXPDOC_VERSION, type ExpColumn, type ExpDoc, type ImageBlock, type TableBlock, type TextBlock } from './types'

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export function createExpDoc(title: string, type: string, folderId: string | null): ExpDoc {
  const now = new Date().toISOString()
  return {
    format: EXPDOC_FORMAT,
    version: EXPDOC_VERSION,
    id: newId('exp'),
    folderId,
    createdAt: now,
    updatedAt: now,
    meta: { title, type, settings: [], notes: '' },
    blocks: []
  }
}

export function createTextBlock(content = ''): TextBlock {
  return { id: newId('txt'), kind: 'text', content }
}

export function createTableBlock(name: string, columns: ExpColumn[], rows: Record<string, string>[]): TableBlock {
  return { id: newId('tab'), kind: 'table', name, columns, rows }
}

export function createImageBlock(name: string, mimeType: string, dataBase64: string): ImageBlock {
  return { id: newId('img'), kind: 'image', name, caption: '', mimeType, dataBase64 }
}

export function createSetting(): ExpDoc['meta']['settings'][number] {
  return { id: newId('st'), name: '', value: '', unit: '' }
}
