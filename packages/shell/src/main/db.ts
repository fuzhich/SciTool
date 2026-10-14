import Database from 'better-sqlite3'
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync } from 'fs'
import { join } from 'path'
import type { AppRecord } from '@scitool/sdk'
import { dataDir, logsDir } from './paths'
import { writeLog } from './logger'

let db: Database.Database | null = null

export function getDb(): Database.Database {
  if (db) return db
  const dir = join(dataDir(), 'data')
  mkdirSync(dir, { recursive: true })
  db = new Database(join(dir, 'scitool.db'))
  db.pragma('journal_mode = WAL')
  db.exec(SCHEMA)
  migrateLegacyJson()
  return db
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS platform_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS apps (
  id            TEXT PRIMARY KEY,
  name_zh       TEXT NOT NULL,
  name_en       TEXT NOT NULL,
  version       TEXT NOT NULL,
  description_zh TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  icon          TEXT,
  permissions   TEXT NOT NULL,
  entry         TEXT NOT NULL,
  min_sdk_version TEXT NOT NULL,
  install_path  TEXT NOT NULL,
  installed_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_domains (
  app_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  access TEXT NOT NULL CHECK (access IN ('read','write')),
  PRIMARY KEY (app_id, domain)
);

CREATE TABLE IF NOT EXISTS kv_store (
  app_id TEXT NOT NULL,
  key    TEXT NOT NULL,
  value  TEXT NOT NULL,
  PRIMARY KEY (app_id, key)
);

CREATE TABLE IF NOT EXISTS shared_docs (
  id         TEXT PRIMARY KEY,
  app_id     TEXT NOT NULL,
  domain     TEXT NOT NULL,
  revision   INTEGER NOT NULL DEFAULT 1,
  data       TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_shared_docs_domain ON shared_docs(domain);
`

function migrateLegacyJson(): void {
  if (!db) return
  const meta = db.prepare(`SELECT value FROM platform_meta WHERE key = 'legacy_migrated'`).get() as
    | { value: string }
    | undefined
  if (meta?.value === '1') return

  const backupDir = join(dataDir(), 'legacy-json-backup')
  let migrated = 0

  const registryPath = join(dataDir(), 'registry.json')
  if (existsSync(registryPath)) {
    try {
      const records = JSON.parse(readFileSync(registryPath, 'utf-8')) as AppRecord[]
      const insert = db.prepare(
        `INSERT OR REPLACE INTO apps
         (id, name_zh, name_en, version, description_zh, description_en, icon, permissions, entry, min_sdk_version, install_path, installed_at)
         VALUES (@id, @nameZh, @nameEn, @version, @descZh, @descEn, @icon, @permissions, @entry, @minSdkVersion, @installPath, @installedAt)`
      )
      for (const r of records) {
        insert.run({
          id: r.id,
          nameZh: r.name.zh,
          nameEn: r.name.en,
          version: r.version,
          descZh: r.description?.zh ?? '',
          descEn: r.description?.en ?? '',
          icon: r.icon ?? null,
          permissions: JSON.stringify(r.permissions ?? []),
          entry: r.entry,
          minSdkVersion: r.minSdkVersion,
          installPath: r.installPath,
          installedAt: r.installedAt
        })
        migrated++
      }
    } catch (err) {
      writeLog('platform', 'error', `legacy registry migration failed: ${String(err)}`)
    }
  }

  const storageDir = join(dataDir(), 'app-storage')
  if (existsSync(storageDir)) {
    try {
      const insert = db.prepare(`INSERT OR REPLACE INTO kv_store (app_id, key, value) VALUES (?, ?, ?)`)
      for (const file of readdirSync(storageDir)) {
        if (!file.endsWith('.json')) continue
        const appId = file.slice(0, -5)
        try {
          const data = JSON.parse(readFileSync(join(storageDir, file), 'utf-8')) as Record<string, unknown>
          for (const [key, value] of Object.entries(data)) {
            insert.run(appId, key, JSON.stringify(value))
          }
          migrated++
        } catch (err) {
          writeLog('platform', 'error', `legacy app-storage migration failed (${file}): ${String(err)}`)
        }
      }
    } catch (err) {
      writeLog('platform', 'error', `legacy app-storage migration failed: ${String(err)}`)
    }
  }

  if (migrated > 0) {
    mkdirSync(backupDir, { recursive: true })
    if (existsSync(registryPath)) renameSync(registryPath, join(backupDir, 'registry.json'))
    if (existsSync(storageDir)) renameSync(storageDir, join(backupDir, 'app-storage'))
    writeLog('platform', 'info', `legacy JSON data migrated to SQLite (${migrated} entries), backup at ${backupDir}`)
  }

  db.prepare(`INSERT OR REPLACE INTO platform_meta (key, value) VALUES ('legacy_migrated', '1')`).run()
}

export function closeDb(): void {
  db?.close()
  db = null
}

export { logsDir }
