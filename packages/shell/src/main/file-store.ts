import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'fs'
import { basename, join } from 'path'
import { randomUUID } from 'crypto'
import { dataDir } from './paths'

const MAX_FILE_BYTES = 50 * 1024 * 1024

function storeDir(appId: string): string {
  return join(dataDir(), 'app-files', appId)
}

function sanitizeName(name: string): string {
  const base = basename(name).replace(/[\\/:*?"<>|]/g, '_')
  return base || 'file'
}

function resolvePath(appId: string, id: string): string {
  const dir = storeDir(appId)
  const p = join(dir, id)
  if (!p.startsWith(dir)) throw new Error('非法文件 id')
  return p
}

function displayName(id: string): string {
  const idx = id.indexOf('-')
  return idx >= 0 ? id.slice(idx + 1) : id
}

export function putAppFile(appId: string, name: string, data: Uint8Array): string {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data)
  if (buf.byteLength > MAX_FILE_BYTES) throw new Error('文件超过 50MB 上限')
  const dir = storeDir(appId)
  mkdirSync(dir, { recursive: true })
  const id = `${randomUUID()}-${sanitizeName(name)}`
  writeFileSync(join(dir, id), buf)
  return id
}

export function getAppFile(appId: string, id: string): { name: string; data: Uint8Array } | null {
  const p = resolvePath(appId, id)
  if (!existsSync(p)) return null
  return { name: displayName(id), data: readFileSync(p) }
}

export function removeAppFile(appId: string, id: string): void {
  const p = resolvePath(appId, id)
  if (existsSync(p)) rmSync(p, { force: true })
}

export function listAppFiles(appId: string): { id: string; name: string; size: number; createdAt: string }[] {
  const dir = storeDir(appId)
  if (!existsSync(dir)) return []
  return readdirSync(dir).map((f) => {
    const st = statSync(join(dir, f))
    return { id: f, name: displayName(f), size: st.size, createdAt: st.mtime.toISOString() }
  })
}
