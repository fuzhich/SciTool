import { EXPDOC_FORMAT, EXPDOC_VERSION, type ExpDoc, type ImageBlock, type TableBlock, type TableSheet, type TextBlock } from './types'

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

export function createTableBlock(name: string, sheets: TableSheet[]): TableBlock {
  return { id: newId('tab'), kind: 'table', name, sheets, activeSheet: 0 }
}

export function createImageBlock(name: string, mimeType: string, dataBase64: string): ImageBlock {
  return { id: newId('img'), kind: 'image', name, caption: '', mimeType, dataBase64 }
}

export function createSetting(): ExpDoc['meta']['settings'][number] {
  return { id: newId('st'), name: '', value: '', unit: '' }
}
