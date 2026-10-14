import { readFileSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { getAppRecord } from './app-registry'
import { closeAppWindows, compareVersions, installApp } from './app-manager'
import { appsDir } from './paths'
import { writeLog } from './logger'

interface AppUpdateManifest {
  version: string
  url: string
}

export interface AppUpdateResult {
  updated: boolean
  from: string
  to?: string
  reason?: string
}

export async function checkAppUpdate(appId: string): Promise<AppUpdateResult> {
  const record = getAppRecord(appId)
  if (!record) throw new Error(`应用未安装: ${appId}`)

  let manifest: { update?: { url?: string } }
  try {
    manifest = JSON.parse(readFileSync(join(record.installPath, 'manifest.json'), 'utf-8')) as {
      update?: { url?: string }
    }
  } catch {
    return { updated: false, from: record.version, reason: 'manifest 读取失败' }
  }
  const updateUrl = manifest.update?.url
  if (!updateUrl) return { updated: false, from: record.version, reason: '应用未声明更新地址' }

  const res = await fetch(updateUrl)
  if (!res.ok) return { updated: false, from: record.version, reason: `更新清单获取失败 HTTP ${res.status}` }
  const update = (await res.json()) as Partial<AppUpdateManifest>
  if (typeof update.version !== 'string' || typeof update.url !== 'string') {
    return { updated: false, from: record.version, reason: '更新清单格式非法（需 version + url）' }
  }
  if (compareVersions(update.version, record.version) <= 0) {
    writeLog('platform', 'info', `app update not needed: ${appId} ${record.version} >= ${update.version}`)
    return { updated: false, from: record.version, to: update.version }
  }

  const zipRes = await fetch(update.url)
  if (!zipRes.ok) return { updated: false, from: record.version, reason: `安装包下载失败 HTTP ${zipRes.status}` }
  const tmpZip = join(appsDir(), `.tmp-update-${appId}.zip`)
  writeFileSync(tmpZip, Buffer.from(await zipRes.arrayBuffer()))

  try {
    closeAppWindows(appId)
    const next = await installApp(tmpZip)
    writeLog('platform', 'info', `app updated: ${appId} ${record.version} -> ${next.version}`)
    return { updated: true, from: record.version, to: next.version }
  } finally {
    rmSync(tmpZip, { force: true })
  }
}
