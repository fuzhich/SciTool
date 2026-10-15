import { net } from 'electron'

export interface NetResult {
  status: number
  text: string
}

// 平台网络代理：net.fetch 无 CORS 限制且遵循系统代理
export async function netGet(url: string, headers?: Record<string, string>): Promise<NetResult> {
  if (typeof url !== 'string' || !/^https?:\/\//.test(url)) throw new Error('仅支持 http(s) 地址')
  const res = await net.fetch(url, {
    method: 'GET',
    headers: headers ?? undefined,
    signal: AbortSignal.timeout(30000)
  })
  const text = await res.text()
  return { status: res.status, text }
}
