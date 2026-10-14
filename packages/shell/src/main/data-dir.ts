import { app } from 'electron'
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'fs'
import { dirname, join, relative, resolve } from 'path'

const APP_DIR_NAME = (): string => (app.isPackaged ? 'SciTool' : 'SciTool-dev')

function pointerFile(): string {
  return join(app.getPath('appData'), APP_DIR_NAME(), 'datadir.json')
}

function isWritable(dir: string): boolean {
  try {
    mkdirSync(dir, { recursive: true })
    const probe = join(dir, `.probe-${Date.now()}`)
    writeFileSync(probe, 'ok', 'utf-8')
    rmSync(probe, { force: true })
    return true
  } catch {
    return false
  }
}

function readPointer(): string | null {
  try {
    if (!existsSync(pointerFile())) return null
    const parsed = JSON.parse(readFileSync(pointerFile(), 'utf-8')) as { path?: string }
    if (typeof parsed.path === 'string' && parsed.path && isWritable(parsed.path)) {
      return parsed.path
    }
    return null
  } catch {
    return null
  }
}

function writePointer(dir: string): void {
  mkdirSync(dirname(pointerFile()), { recursive: true })
  writeFileSync(pointerFile(), JSON.stringify({ path: dir }, null, 2), 'utf-8')
}

/**
 * 解析数据目录，必须在 app ready 之前调用。
 * 优先级：用户迁移指针 > 打包模式安装目录/data > Electron 默认（AppData）
 */
export function resolveDataDir(): string | null {
  const pointer = readPointer()
  if (pointer) return pointer

  if (app.isPackaged) {
    const installData = join(dirname(app.getPath('exe')), 'data')
    if (isWritable(installData)) return installData
  }
  return null
}

export function applyDataDir(): string {
  const dir = resolveDataDir()
  if (dir) app.setPath('userData', dir)
  return app.getPath('userData')
}

function checkNesting(current: string, target: string): void {
  if (target === current) throw new Error('新目录与当前数据目录相同')
  const inside = relative(current, target)
  if (inside !== '' && !inside.startsWith('..')) {
    throw new Error('新目录不能位于当前数据目录内部')
  }
  const ancestor = relative(target, current)
  if (ancestor !== '' && !ancestor.startsWith('..')) {
    throw new Error('新目录不能是当前数据目录的上级目录')
  }
}

// 仅迁移 SciTool 核心数据；Chromium 运行时缓存（Cache/GPUCache 等）被运行中的应用锁定且可再生，跳过
const MIGRATE_ITEMS = ['apps', 'app-storage', 'logs', 'data', 'registry.json', 'settings.json']

/**
 * 迁移数据目录：复制核心数据到新目录，写入指针文件，可选重启。
 * 迁移成功后原目录保留作为备份（由用户决定是否删除）。
 */
export function moveDataDir(targetRaw: string, relaunch: boolean): string {
  const target = resolve(targetRaw)
  const current = resolve(app.getPath('userData'))

  checkNesting(current, target)
  if (!isWritable(target)) throw new Error('新目录不可写')
  if (readdirSync(target).length > 0) throw new Error('新目录必须为空')

  for (const item of MIGRATE_ITEMS) {
    const src = join(current, item)
    if (existsSync(src)) {
      cpSync(src, join(target, item), { recursive: true, force: true })
    }
  }
  writePointer(target)

  if (relaunch) {
    app.relaunch()
    app.exit(0)
  }
  return target
}
