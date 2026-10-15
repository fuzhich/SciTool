import { BrowserWindow, dialog, Notification } from 'electron'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'fs'
import { join } from 'path'
import extract from 'extract-zip'
import { SDK_VERSION, type AppManifest, type AppRecord, type Permission } from '@scitool/sdk'
import { addAppRecord, getAppRecord, removeAppRecord, loadRegistry, setAppDomains } from './app-registry'
import { appDir, appsDir } from './paths'
import { registerAppWindow, unregisterAppWindow } from './permission-gateway'
import { getSettings } from './settings-store'
import { writeLog } from './logger'

const KNOWN_PERMISSIONS: Permission[] = ['storage', 'settings', 'log', 'ui', 'sharedData', 'events', 'ai', 'fileStore', 'net']
const ID_PATTERN = /^[a-z0-9][a-z0-9._-]{2,63}$/
const MAX_AUTO_RESTARTS = 1

export function validateManifest(manifest: unknown): string | null {
  const m = manifest as Partial<AppManifest>
  if (!m || typeof m !== 'object') return 'manifest 缺失'
  if (typeof m.id !== 'string' || !ID_PATTERN.test(m.id)) return '应用 id 非法（需 3-64 位小写字母/数字/._-）'
  if (!m.name || typeof m.name.zh !== 'string' || typeof m.name.en !== 'string') return '应用名称缺失（zh/en）'
  if (typeof m.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(m.version)) return '版本号需为 x.y.z 语义化格式'
  if (typeof m.minSdkVersion !== 'string') return 'minSdkVersion 缺失'
  if (!m.description || typeof m.description.zh !== 'string') return '应用描述缺失'
  if (typeof m.entry !== 'string' || !m.entry) return '入口 entry 缺失'
  if (!Array.isArray(m.permissions)) return '权限清单缺失'
  for (const p of m.permissions) {
    if (!KNOWN_PERMISSIONS.includes(p)) return `未知权限声明: ${p}`
  }
  if (m.sharedDomains !== undefined) {
    if (!Array.isArray(m.sharedDomains)) return 'sharedDomains 需为数组'
    for (const g of m.sharedDomains) {
      if (!g || typeof g.domain !== 'string' || !/^[a-z][a-z0-9-]{0,63}$/.test(g.domain)) {
        return `共享域名非法: ${JSON.stringify(g)}`
      }
      if (g.access !== 'read' && g.access !== 'write') return `共享域名权限非法: ${g.domain}`
    }
  }
  return null
}

export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1
  }
  return 0
}

export async function installApp(zipPath: string): Promise<AppRecord> {
  const tempDir = join(appsDir(), '.tmp-install')
  rmSync(tempDir, { recursive: true, force: true })
  await extract(zipPath, { dir: tempDir })

  let manifest: AppManifest
  try {
    manifest = JSON.parse(readFileSync(join(tempDir, 'manifest.json'), 'utf-8')) as AppManifest
  } catch {
    throw new Error('安装包缺少 manifest.json 或格式非法')
  }
  const err = validateManifest(manifest)
  if (err) throw new Error(err)

  const target = appDir(manifest.id)
  const entryPath = join(target, manifest.entry)
  if (!entryPath.startsWith(target)) throw new Error('entry 路径非法（禁止越界）')

  rmSync(target, { recursive: true, force: true })
  await extract(zipPath, { dir: target })

  if (!existsSync(entryPath)) throw new Error(`入口文件不存在: ${manifest.entry}`)
  rmSync(tempDir, { recursive: true, force: true })

  const record: AppRecord = {
    id: manifest.id,
    name: manifest.name,
    version: manifest.version,
    description: manifest.description,
    icon: manifest.icon,
    permissions: manifest.permissions,
    entry: manifest.entry,
    minSdkVersion: manifest.minSdkVersion,
    installPath: target,
    installedAt: new Date().toISOString()
  }
  addAppRecord(record)
  if (manifest.sharedDomains) {
    setAppDomains(manifest.id, manifest.sharedDomains)
  }
  writeLog('platform', 'info', `app installed: ${manifest.id}@${manifest.version}`)
  return record
}

export async function uninstallApp(appId: string): Promise<void> {
  const record = getAppRecord(appId)
  if (!record) throw new Error(`应用未安装: ${appId}`)
  removeAppRecord(appId)
  rmSync(record.installPath, { recursive: true, force: true })
  writeLog('platform', 'info', `app uninstalled: ${appId}`)
}

const runningWindows = new Map<number, { appId: string; restarts: number; win: BrowserWindow }>()

export function closeAppWindows(appId: string): void {
  for (const entry of runningWindows.values()) {
    if (entry.appId === appId && !entry.win.isDestroyed()) {
      entry.win.destroy()
    }
  }
}

export async function launchApp(appId: string): Promise<BrowserWindow> {
  const record = getAppRecord(appId)
  if (!record) throw new Error(`应用未安装: ${appId}`)
  if (compareVersions(record.minSdkVersion, SDK_VERSION) > 0) {
    throw new Error(`应用要求 SDK >= ${record.minSdkVersion}，当前平台 SDK 为 ${SDK_VERSION}，请升级平台`)
  }

  const entryPath = join(record.installPath, record.entry)
  const lang = getSettings().language
  const title = lang === 'en' ? record.name.en : record.name.zh

  const win = new BrowserWindow({
    width: 980,
    height: 680,
    minWidth: 720,
    minHeight: 480,
    title,
    autoHideMenuBar: true,
    backgroundColor: '#fafafa',
    webPreferences: {
      preload: join(__dirname, '../preload/app-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      partition: `persist:scitool-app-${appId}`,
      additionalArguments: [`--scitool-app-id=${appId}`]
    }
  })

  const wcId = win.webContents.id
  registerAppWindow(wcId, { appId, permissions: record.permissions })
  runningWindows.set(wcId, { appId, restarts: 0, win })

  win.webContents.on('render-process-gone', (_e, details) => {
    writeLog('platform', 'error', `app renderer gone: ${appId} (${details.reason})`)
    const state = runningWindows.get(wcId)
    if (state && state.restarts < MAX_AUTO_RESTARTS) {
      state.restarts += 1
      setTimeout(() => {
        if (!win.isDestroyed()) win.loadFile(entryPath).catch(() => {})
      }, 500)
    }
  })
  win.webContents.on('unresponsive', () => {
    writeLog('platform', 'warn', `app unresponsive: ${appId}`)
  })

  win.on('closed', () => {
    runningWindows.delete(wcId)
    unregisterAppWindow(wcId)
    writeLog('platform', 'info', `app window closed: ${appId}`)
  })

  await win.loadFile(entryPath)
  writeLog('platform', 'info', `app launched: ${appId}`)
  return win
}

export function notifyUser(title: string, body?: string): void {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show()
  }
}

export function ensureAppsDir(): void {
  mkdirSync(appsDir(), { recursive: true })
}

export function listApps(): AppRecord[] {
  return loadRegistry()
}

export async function pickZipPath(): Promise<string | null> {
  const res = await dialog.showOpenDialog({
    title: '选择应用安装包',
    filters: [{ name: 'SciTool 应用包', extensions: ['zip'] }],
    properties: ['openFile']
  })
  if (res.canceled || !res.filePaths[0]) return null
  return res.filePaths[0]
}
