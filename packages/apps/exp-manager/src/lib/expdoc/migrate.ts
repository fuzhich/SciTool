import { normalizeDoc, validateDoc } from './validate'
import type { ExpDoc } from './types'

// 版本迁移入口：旧版本文档在此逐级升级到当前版本。
// 当前即 v1；未来（如 AI 阶段的 charts[] spec）新增版本时在此实现 v1→v2 等转换。
export function migrateDoc(raw: unknown): ExpDoc {
  if (validateDoc(raw) === null) {
    return raw as unknown as ExpDoc
  }
  // 预留：按 (raw as { version?: number }).version 逐级迁移
  return normalizeDoc(raw)
}
