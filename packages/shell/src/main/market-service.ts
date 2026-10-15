import { net } from 'electron'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'
import { dataDir } from './paths'
import { installApp } from './app-manager'
import { writeLog } from './logger'
import type { MarketApp, MarketManifest } from '../shared/market'

const MARKET_URL = 'https://raw.githubusercontent.com/fuzhich/SciTool/main/apps-market.json'

// 应用市场：清单（raw 直链，无 API 限流）+ zip（Release 资产）+ 复用 installApp 校验链路
export async function fetchMarketManifest(): Promise<MarketManifest> {
  const res = await net.fetch(MARKET_URL, { signal: AbortSignal.timeout(20000) })
  if (!res.ok) throw new Error(`市场清单拉取失败（HTTP ${res.status}）`)
  const text = await res.text()
  const manifest = JSON.parse(text) as MarketManifest
  if (!manifest || !Array.isArray(manifest.apps)) throw new Error('市场清单格式非法')
  return manifest
}

export async function installMarketApp(app: MarketApp): Promise<void> {
  if (!/^https?:\/\//.test(app.zipUrl)) throw new Error('应用包地址非法')
  const tmpDir = join(dataDir(), 'market-tmp')
  mkdirSync(tmpDir, { recursive: true })
  const zipPath = join(tmpDir, `${app.id}.zip`)
  try {
    writeLog('platform', 'info', `market download start: ${app.id}@${app.version} <- ${app.zipUrl}`)
    const res = await net.fetch(app.zipUrl, { signal: AbortSignal.timeout(300000) })
    if (!res.ok) throw new Error(`应用包下载失败（HTTP ${res.status}）`)
    const buf = Buffer.from(await res.arrayBuffer())
    writeFileSync(zipPath, buf)
    const record = await installApp(zipPath)
    writeLog('platform', 'info', `market installed: ${record.id}@${record.version}`)
  } finally {
    if (existsSync(zipPath)) rmSync(zipPath, { force: true })
  }
}
