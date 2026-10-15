import { safeStorage } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { settingsFile } from './paths'

export interface AiConfig {
  provider: 'deepseek' | 'openai' | 'custom'
  baseUrl: string
  model: string
  encryptedKey: string | null
}

export const AI_PROVIDER_PRESETS: Record<AiConfig['provider'], { baseUrl: string; model: string }> = {
  deepseek: { baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
  openai: { baseUrl: 'https://api.openai.com', model: 'gpt-4o-mini' },
  custom: { baseUrl: '', model: '' }
}

function configFile(): string {
  return join(dirname(settingsFile()), 'ai-config.json')
}

function defaults(): AiConfig {
  return { provider: 'deepseek', baseUrl: AI_PROVIDER_PRESETS.deepseek.baseUrl, model: AI_PROVIDER_PRESETS.deepseek.model, encryptedKey: null }
}

export function loadAiConfig(): AiConfig {
  try {
    if (existsSync(configFile())) {
      const raw = JSON.parse(readFileSync(configFile(), 'utf-8')) as Partial<AiConfig>
      return { ...defaults(), ...raw }
    }
  } catch {
    // 配置损坏时回退默认
  }
  return defaults()
}

// API Key 用 safeStorage（Windows DPAPI）加密后落盘；明文永不写文件
export function saveAiConfig(patch: {
  provider?: AiConfig['provider']
  baseUrl?: string
  model?: string
  apiKey?: string
}): void {
  const current = loadAiConfig()
  const next: AiConfig = {
    provider: patch.provider ?? current.provider,
    baseUrl: patch.baseUrl ?? current.baseUrl,
    model: patch.model ?? current.model,
    encryptedKey: current.encryptedKey
  }
  if (patch.apiKey !== undefined && patch.apiKey !== '') {
    if (!safeStorage.isEncryptionAvailable()) throw new Error('系统加密不可用，无法安全保存 API Key')
    next.encryptedKey = safeStorage.encryptString(patch.apiKey).toString('base64')
  }
  mkdirSync(dirname(configFile()), { recursive: true })
  writeFileSync(configFile(), JSON.stringify(next, null, 2), 'utf-8')
}

export function getApiKey(): string | null {
  const cfg = loadAiConfig()
  if (!cfg.encryptedKey) return null
  try {
    if (!safeStorage.isEncryptionAvailable()) return null
    return safeStorage.decryptString(Buffer.from(cfg.encryptedKey, 'base64'))
  } catch {
    return null
  }
}
