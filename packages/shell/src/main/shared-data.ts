import type { SharedDoc } from '@scitool/sdk'
import { getDb } from './db'
import { getAppDomainAccess } from './app-registry'
import { emitSharedDocEvent } from './event-bus'

interface SharedDocRow {
  id: string
  app_id: string
  domain: string
  revision: number
  data: string
  created_at: string
  updated_at: string
}

const DOMAIN_PATTERN = /^[a-z][a-z0-9-]{0,63}$/

function toDoc(row: SharedDocRow): SharedDoc {
  return {
    id: row.id,
    appId: row.app_id,
    domain: row.domain,
    revision: row.revision,
    data: JSON.parse(row.data),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function requireDomain(appId: string, domain: string, access: 'read' | 'write'): void {
  if (typeof domain !== 'string' || !DOMAIN_PATTERN.test(domain)) {
    throw new Error(`域名非法: ${domain}`)
  }
  const granted = getAppDomainAccess(appId, domain)
  if (granted === null) throw new Error(`应用未获授权访问域名: ${domain}`)
  if (access === 'write' && granted !== 'write') throw new Error(`应用对域名 ${domain} 仅有读取权限`)
}

export function getSharedDoc(appId: string, id: string): SharedDoc | null {
  const row = getDb().prepare(`SELECT * FROM shared_docs WHERE id = ?`).get(id) as SharedDocRow | undefined
  if (!row) return null
  requireDomain(appId, row.domain, 'read')
  return toDoc(row)
}

export function putSharedDoc(
  appId: string,
  id: string,
  data: unknown,
  domain: string,
  expectedRevision?: number
): SharedDoc {
  if (typeof id !== 'string' || !id || id.length > 256) throw new Error('文档 id 非法')
  requireDomain(appId, domain, 'write')

  const db = getDb()
  const existing = db.prepare(`SELECT * FROM shared_docs WHERE id = ?`).get(id) as SharedDocRow | undefined
  const now = new Date().toISOString()

  if (existing) {
    if (existing.domain !== domain) throw new Error(`文档 ${id} 已存在于域名 ${existing.domain}，不可跨域名改写`)
    if (expectedRevision !== undefined && expectedRevision !== existing.revision) {
      throw new Error(`revision 冲突：本地 ${expectedRevision}，当前 ${existing.revision}`)
    }
    db.prepare(`UPDATE shared_docs SET data = ?, revision = revision + 1, updated_at = ? WHERE id = ?`).run(
      JSON.stringify(data),
      now,
      id
    )
  } else {
    if (expectedRevision !== undefined && expectedRevision !== 0) {
      throw new Error(`revision 冲突：文档不存在，期望 revision ${expectedRevision}`)
    }
    db.prepare(
      `INSERT INTO shared_docs (id, app_id, domain, revision, data, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?, ?)`
    ).run(id, appId, domain, JSON.stringify(data), now, now)
  }

  const row = db.prepare(`SELECT * FROM shared_docs WHERE id = ?`).get(id) as SharedDocRow
  const doc = toDoc(row)
  emitSharedDocEvent({ type: existing ? 'updated' : 'created', doc })
  return doc
}

export function listSharedDocs(appId: string, domain?: string): SharedDoc[] {
  let rows: SharedDocRow[]
  if (domain) {
    requireDomain(appId, domain, 'read')
    rows = getDb().prepare(`SELECT * FROM shared_docs WHERE domain = ? ORDER BY updated_at DESC`).all(domain) as SharedDocRow[]
  } else {
    // 无域名参数时返回应用有权限的所有文档
    const domains = getDb()
      .prepare(`SELECT domain FROM app_domains WHERE app_id = ?`)
      .all(appId) as { domain: string }[]
    if (domains.length === 0) return []
    const placeholders = domains.map(() => '?').join(',')
    rows = getDb()
      .prepare(`SELECT * FROM shared_docs WHERE domain IN (${placeholders}) ORDER BY updated_at DESC`)
      .all(...domains.map((d) => d.domain)) as SharedDocRow[]
  }
  return rows.map(toDoc)
}

export function removeSharedDoc(appId: string, id: string, expectedRevision?: number): void {
  const db = getDb()
  const existing = db.prepare(`SELECT * FROM shared_docs WHERE id = ?`).get(id) as SharedDocRow | undefined
  if (!existing) throw new Error(`文档不存在: ${id}`)
  requireDomain(appId, existing.domain, 'write')
  if (expectedRevision !== undefined && expectedRevision !== existing.revision) {
    throw new Error(`revision 冲突：本地 ${expectedRevision}，当前 ${existing.revision}`)
  }
  db.prepare(`DELETE FROM shared_docs WHERE id = ?`).run(id)
  emitSharedDocEvent({ type: 'removed', doc: toDoc(existing) })
}
