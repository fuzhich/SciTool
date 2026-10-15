import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = workerUrl

export interface PdfMetaInfo {
  title: string
  authors: string
  doi: string
}

const DOI_RE = /10\.\d{4,9}\/[-._;()/:A-Za-z0-9]+/i

// PDF 内嵌元数据（非 AI 降级路径的第一步）
export async function extractPdfInfo(data: Uint8Array): Promise<PdfMetaInfo> {
  const doc: PDFDocumentProxy = await getDocument({ data }).promise
  try {
    const meta = await doc.getMetadata()
    const info = (meta.info ?? {}) as Record<string, unknown>
    const subject = typeof info.Subject === 'string' ? info.Subject : ''
    let doi = subject.match(DOI_RE)?.[0] ?? ''
    if (!doi) {
      const raw = meta.metadata as unknown
      if (typeof raw === 'string') {
        doi = raw.match(DOI_RE)?.[0] ?? ''
      }
    }
    return {
      title: typeof info.Title === 'string' ? info.Title.trim() : '',
      authors: typeof info.Author === 'string' ? info.Author.trim() : '',
      doi
    }
  } finally {
    void doc.destroy()
  }
}

// 首页文本（AI 提取候选用）
export async function extractFirstPageText(data: Uint8Array): Promise<string> {
  const doc: PDFDocumentProxy = await getDocument({ data }).promise
  try {
    const page = await doc.getPage(1)
    const content = await page.getTextContent()
    const text = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text.slice(0, 3500)
  } finally {
    void doc.destroy()
  }
}
