import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import type { PlatformSettings } from '@scitool/sdk'
import { settingsFile } from './paths'

const DEFAULTS: PlatformSettings = {
  language: 'zh',
  theme: 'light'
}

let cache: PlatformSettings | null = null

function persist(settings: PlatformSettings): void {
  mkdirSync(dirname(settingsFile()), { recursive: true })
  writeFileSync(settingsFile(), JSON.stringify(settings, null, 2), 'utf-8')
  cache = settings
}

export function getSettings(): PlatformSettings {
  if (cache) return cache
  let loaded: PlatformSettings | null = null
  try {
    if (existsSync(settingsFile())) {
      loaded = JSON.parse(readFileSync(settingsFile(), 'utf-8')) as PlatformSettings
    }
  } catch {
    loaded = null
  }
  const settings = { ...DEFAULTS, ...(loaded ?? {}) }
  persist(settings)
  return settings
}

export function updateSettings(patch: Partial<PlatformSettings>): PlatformSettings {
  persist({ ...getSettings(), ...patch })
  return cache as PlatformSettings
}
