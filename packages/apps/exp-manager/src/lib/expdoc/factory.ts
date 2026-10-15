import { EXPDOC_FORMAT, EXPDOC_VERSION, type ExpDoc } from './types'

export function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export function createExpDoc(title: string, type: string, folderId: string | null): ExpDoc {
  const now = new Date().toISOString()
  return {
    format: EXPDOC_FORMAT,
    version: EXPDOC_VERSION,
    id: newId('exp'),
    type,
    title,
    folderId,
    createdAt: now,
    updatedAt: now,
    settings: [],
    tables: [],
    images: [],
    results: [],
    notes: ''
  }
}

export function createSetting(): ExpDoc['settings'][number] {
  return { id: newId('st'), name: '', value: '', unit: '' }
}

export function createColumn(): ExpDoc['tables'][number]['columns'][number] {
  return { id: newId('col'), name: '', unit: '' }
}

export function createTable(): ExpDoc['tables'][number] {
  return { id: newId('tab'), name: '', columns: [], rows: [] }
}

export function createResultBlock(): ExpDoc['results'][number] {
  return { id: newId('res'), title: '', content: '' }
}
