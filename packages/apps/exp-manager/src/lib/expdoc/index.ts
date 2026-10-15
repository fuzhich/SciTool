// 文档引擎统一入口（接口化）：外部（导出/导入/AI 回流）只经此模块。
import { migrateDoc } from './migrate'
import type { ExpDoc } from './types'

export { EXPDOC_FORMAT, EXPDOC_VERSION, MAX_IMAGE_BYTES } from './types'
export type { ExpBlock, ExpColumn, ExpDoc, ExpImage, ExpSetting, ExpTable } from './types'
export { normalizeDoc, validateDoc } from './validate'
export { migrateDoc } from './migrate'
export { createExpDoc, createSetting, createColumn, createTable, createResultBlock, newId } from './factory'

export function parseDoc(jsonText: string): ExpDoc {
  return migrateDoc(JSON.parse(jsonText))
}

export function serializeDoc(doc: ExpDoc): string {
  return JSON.stringify(doc, null, 2)
}
