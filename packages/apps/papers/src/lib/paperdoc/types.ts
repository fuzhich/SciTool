// paperdoc 文档格式 v1 —— 论文文档契约。
export const PAPERDOC_FORMAT = 'scitool-paperdoc'
export const PAPERDOC_VERSION = 1

export interface PaperMeta {
  title: string
  authors: string
  affiliations: string
  year: string
  venue: string
  doi: string
  abstract: string
  keywords: string
}

export interface PaperDoc {
  format: string
  version: number
  id: string
  folderId: string | null
  createdAt: string
  updatedAt: string
  pdfRef: string | null
  pdfName: string
  meta: PaperMeta
}
