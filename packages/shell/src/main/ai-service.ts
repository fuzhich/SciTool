import { net } from 'electron'
import type { AiChatResult, AiMessage } from '@scitool/sdk'
import { getApiKey, loadAiConfig, type AiConfig } from './ai-config'

// net.fetch 走系统代理（Node fetch 不遵循，openai 等域名必需代理）

interface ValidateInput {
  baseUrl: string
  apiKey: string
}

export async function validateAiConfig(input: ValidateInput): Promise<void> {
  const res = await net.fetch(`${input.baseUrl.replace(/\/+$/, '')}/models`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${input.apiKey}` },
    signal: AbortSignal.timeout(15000)
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`API 验证失败（HTTP ${res.status}）${body ? `：${body.slice(0, 200)}` : ''}`)
  }
}

export async function aiAvailable(): Promise<boolean> {
  return getApiKey() !== null
}

export async function aiChat(
  messages: AiMessage[],
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<AiChatResult> {
  const cfg: AiConfig = loadAiConfig()
  const key = getApiKey()
  if (!key) throw new Error('平台未配置 AI API Key（请在设置 → AI 服务中配置）')
  if (!Array.isArray(messages) || messages.length === 0) throw new Error('messages 非法')

  const res = await net.fetch(`${cfg.baseUrl.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: options?.model ?? cfg.model,
      messages,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens,
      stream: false
    }),
    signal: AbortSignal.timeout(120000)
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`AI 服务错误（HTTP ${res.status}）${body ? `：${body.slice(0, 300)}` : ''}`)
  }
  const data = (await res.json()) as {
    model?: string
    choices?: { message?: { content?: string } }[]
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }
  return {
    content: data.choices?.[0]?.message?.content ?? '',
    model: data.model ?? options?.model ?? cfg.model,
    usage: {
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens
    }
  }
}
