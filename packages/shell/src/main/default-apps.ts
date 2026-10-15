import { app } from 'electron'
import { existsSync, readdirSync } from 'fs'
import { join } from 'path'
import { getDb } from './db'
import { installApp } from './app-manager'
import { writeLog } from './logger'

const SEED_FLAG = 'default_apps_seeded'

function bundledAppsDir(): string | null {
  if (app.isPackaged) {
    const dir = join(process.resourcesPath, 'default-apps')
    return existsSync(dir) ? dir : null
  }
  const dir = join(app.getAppPath(), '../apps/dev-guide/dist')
  return existsSync(dir) ? dir : null
}

// 平台默认应用：打包内置 zip + 一次性 seed。用户卸载后不重装（标记已写）。
export async function seedDefaultApps(): Promise<void> {
  const db = getDb()
  const seeded = db.prepare(`SELECT value FROM platform_meta WHERE key = ?`).get(SEED_FLAG) as
    | { value: string }
    | undefined
  if (seeded?.value === '1') return

  const dir = bundledAppsDir()
  if (!dir) {
    writeLog('platform', 'info', 'no bundled default apps dir, skip seeding')
    return
  }
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.zip'))) {
    try {
      const record = await installApp(join(dir, file))
      writeLog('platform', 'info', `default app seeded: ${record.id}@${record.version}`)
    } catch (err) {
      writeLog('platform', 'error', `default app seed failed (${file}): ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  db.prepare(`INSERT OR REPLACE INTO platform_meta (key, value) VALUES (?, '1')`).run(SEED_FLAG)
}
