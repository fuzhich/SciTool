import type { AppRecord, Permission } from '@scitool/sdk'
import { getDb } from './db'

interface AppRow {
  id: string
  name_zh: string
  name_en: string
  version: string
  description_zh: string
  description_en: string
  icon: string | null
  permissions: string
  entry: string
  min_sdk_version: string
  install_path: string
  installed_at: string
}

function toRecord(row: AppRow): AppRecord {
  return {
    id: row.id,
    name: { zh: row.name_zh, en: row.name_en },
    version: row.version,
    description: { zh: row.description_zh, en: row.description_en },
    icon: row.icon ?? undefined,
    permissions: JSON.parse(row.permissions) as Permission[],
    entry: row.entry,
    minSdkVersion: row.min_sdk_version,
    installPath: row.install_path,
    installedAt: row.installed_at
  }
}

export function loadRegistry(): AppRecord[] {
  const rows = getDb().prepare(`SELECT * FROM apps ORDER BY installed_at DESC`).all() as AppRow[]
  return rows.map(toRecord)
}

export function getAppRecord(appId: string): AppRecord | undefined {
  const row = getDb().prepare(`SELECT * FROM apps WHERE id = ?`).get(appId) as AppRow | undefined
  return row ? toRecord(row) : undefined
}

export function addAppRecord(record: AppRecord): void {
  getDb()
    .prepare(
      `INSERT OR REPLACE INTO apps
       (id, name_zh, name_en, version, description_zh, description_en, icon, permissions, entry, min_sdk_version, install_path, installed_at)
       VALUES (@id, @nameZh, @nameEn, @version, @descZh, @descEn, @icon, @permissions, @entry, @minSdkVersion, @installPath, @installedAt)`
    )
    .run({
      id: record.id,
      nameZh: record.name.zh,
      nameEn: record.name.en,
      version: record.version,
      descZh: record.description?.zh ?? '',
      descEn: record.description?.en ?? '',
      icon: record.icon ?? null,
      permissions: JSON.stringify(record.permissions ?? []),
      entry: record.entry,
      minSdkVersion: record.minSdkVersion,
      installPath: record.installPath,
      installedAt: record.installedAt
    })
}

export function removeAppRecord(appId: string): void {
  const d = getDb()
  d.prepare(`DELETE FROM apps WHERE id = ?`).run(appId)
  d.prepare(`DELETE FROM app_domains WHERE app_id = ?`).run(appId)
}

export interface DomainGrant {
  domain: string
  access: 'read' | 'write'
}

export function setAppDomains(appId: string, domains: DomainGrant[]): void {
  const d = getDb()
  d.prepare(`DELETE FROM app_domains WHERE app_id = ?`).run(appId)
  const insert = d.prepare(`INSERT OR REPLACE INTO app_domains (app_id, domain, access) VALUES (?, ?, ?)`)
  for (const g of domains) insert.run(appId, g.domain, g.access)
}

export function getAppDomains(appId: string): DomainGrant[] {
  const rows = getDb()
    .prepare(`SELECT domain, access FROM app_domains WHERE app_id = ?`)
    .all(appId) as DomainGrant[]
  return rows
}

export function getAppDomainAccess(appId: string, domain: string): 'read' | 'write' | null {
  const row = getDb()
    .prepare(`SELECT access FROM app_domains WHERE app_id = ? AND domain = ?`)
    .get(appId, domain) as { access: 'read' | 'write' } | undefined
  return row?.access ?? null
}
