import type { Sdk } from '@scitool/sdk'
import type { PaperMeta } from './paperdoc'
import { extractFirstPageText, extractPdfInfo } from './pdf'

// 三通道元数据链：
//  1) PDF 内嵌元数据（无 AI 也可用）
//  2) DOI 命中 → Crossref 权威校准（无 AI 也可用）
//  3) AI 从首页文本提取 {title, doi} 候选（开关开启时增强）

interface CrossrefMessage {
  title?: string[]
  author?: { given?: string; family?: string; affiliation?: { name?: string }[] }[]
  'container-title'?: string[]
  DOI?: string
  published?: { 'date-parts'?: number[][] }
  issued?: { 'date-parts'?: number[][] }
}

export async function fetchCrossrefByDoi(sdk: Sdk, doi: string): Promise<Partial<PaperMeta>> {
  const res = await sdk.net.get(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
    Accept: 'application/json'
  })
  if (!res.ok || !res.data) throw new Error(res.error ?? '网络请求失败')
  if (res.data.status !== 200) throw new Error(`Crossref HTTP ${res.data.status}`)
  const msg = JSON.parse(res.data.text).message as CrossrefMessage
  const authors = (msg.author ?? [])
    .map((a) => [a.given, a.family].filter(Boolean).join(' '))
    .filter(Boolean)
    .join(', ')
  const affs = [
    ...new Set(
      (msg.author ?? [])
        .flatMap((a) => (a.affiliation ?? []).map((x) => x.name))
        .filter((x): x is string => Boolean(x))
    )
  ].join('; ')
  const year = String(msg.published?.['date-parts']?.[0]?.[0] ?? msg.issued?.['date-parts']?.[0]?.[0] ?? '')
  return {
    title: msg.title?.[0] ?? '',
    authors,
    affiliations: affs,
    year,
    venue: msg['container-title']?.[0] ?? '',
    doi: msg.DOI ?? doi
  }
}

export async function aiExtractCandidates(
  sdk: Sdk,
  firstPageText: string
): Promise<{ title: string; doi: string }> {
  const res = await sdk.ai.chat([
    { role: 'system', content: '你是学术论文元数据提取器。只输出 JSON，不要任何解释。' },
    {
      role: 'user',
      content: `从以下论文首页文本提取标题与 DOI。输出格式：{"title": string|null, "doi": string|null}\n\n${firstPageText}`
    }
  ])
  if (!res.ok || !res.data) throw new Error(res.error ?? 'AI 不可用')
  const text = res.data.content.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(text) as { title?: string | null; doi?: string | null }
  return { title: parsed.title ?? '', doi: parsed.doi ?? '' }
}

export interface ExtractResult {
  meta: Partial<PaperMeta>
  sources: string[]
  failed: string[]
}

// 编排：降级优先保证基本可用（内嵌元数据/Crossref），AI 仅增强
export async function autoExtractMeta(sdk: Sdk, pdfData: Uint8Array, useAi: boolean): Promise<ExtractResult> {
  const sources: string[] = []
  const failed: string[] = []
  let title = ''
  let authors = ''
  let doi = ''

  try {
    const info = await extractPdfInfo(pdfData)
    if (info.title || info.authors || info.doi) sources.push('PDF 内嵌元数据')
    title = info.title
    authors = info.authors
    doi = info.doi
  } catch {
    failed.push('PDF 解析失败')
  }

  if (!doi && useAi) {
    try {
      const text = await extractFirstPageText(pdfData)
      const cand = await aiExtractCandidates(sdk, text)
      if (cand.doi) {
        doi = cand.doi
        sources.push('AI 提取 DOI')
      }
      if (!title && cand.title) {
        title = cand.title
        sources.push('AI 提取标题')
      }
    } catch {
      failed.push('AI 提取失败')
    }
  }

  if (doi) {
    try {
      const x = await fetchCrossrefByDoi(sdk, doi)
      sources.push('Crossref 校准')
      return {
        meta: { ...x, title: x.title || title, authors: x.authors || authors },
        sources,
        failed
      }
    } catch {
      failed.push('Crossref 查询失败')
    }
  }
  return { meta: { title, authors, doi }, sources, failed }
}
