import { appendFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { LogPayload } from '@scitool/sdk'
import { logsDir } from './paths'

export function writeLog(scope: string, level: LogPayload['level'], message: string, data?: unknown): void {
  const line = JSON.stringify({ time: new Date().toISOString(), scope, level, message, data: data ?? null })
  try {
    mkdirSync(logsDir(), { recursive: true })
    appendFileSync(join(logsDir(), `${scope}.log`), line + '\n', 'utf-8')
  } catch {
    // 日志失败不影响主流程
  }
  const prefix = level === 'error' ? 'ERROR' : level.toUpperCase()
  console.log(`[SciTool][${prefix}][${scope}] ${message}`)
}
