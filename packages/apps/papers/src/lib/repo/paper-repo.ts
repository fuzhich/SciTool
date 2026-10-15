import type { Sdk, SharedDoc } from '@scitool/sdk'
import { PAPERDOC_FORMAT, normalizeDoc, type PaperDoc } from '../paperdoc'

export const PAPERS_DOMAIN = 'papers'

export interface FolderNode {
  kind: 'folder'
  id: string
  name: string
  parentId: string | null
  createdAt: string
  revision: number
}

export interface PaperSummary {
  kind: 'paper'
  id: string
  title: string
  pdfName: string
  folderId: string | null
  updatedAt: string
  revision: number
}

export type RepoNode = FolderNode | PaperSummary

interface FolderData {
  kind: 'folder'
  name: string
  parentId: string | null
  createdAt: string
}

function isFolderData(v: unknown): v is FolderData {
  const d = v as Record<string, unknown>
  return typeof d === 'object' && d !== null && d.kind === 'folder'
}

// papers 域仓库：文件夹与论文文档均为 sharedData 文档；写操作走乐观锁。
export class PaperRepo {
  constructor(private readonly sdk: Sdk) {}

  private async putDoc(id: string, data: unknown, expectedRevision?: number): Promise<number> {
    const res = await this.sdk.sharedData.put(id, data, { domain: PAPERS_DOMAIN, expectedRevision })
    if (!res.ok) throw new Error(res.error)
    return res.data!.revision
  }

  private async removeDoc(id: string): Promise<void> {
    const res = await this.sdk.sharedData.remove(id)
    if (!res.ok) throw new Error(res.error)
  }

  async listNodes(): Promise<RepoNode[]> {
    const res = await this.sdk.sharedData.list({ domain: PAPERS_DOMAIN })
    if (!res.ok) throw new Error(res.error)
    const nodes: RepoNode[] = []
    for (const d of res.data ?? []) {
      const node = this.toNode(d)
      if (node) nodes.push(node)
    }
    return nodes
  }

  private toNode(d: SharedDoc): RepoNode | null {
    const data = d.data as Record<string, unknown> | null
    if (!data || typeof data !== 'object') return null
    if (isFolderData(data)) {
      return {
        kind: 'folder',
        id: d.id,
        name: data.name,
        parentId: data.parentId ?? null,
        createdAt: d.createdAt,
        revision: d.revision
      }
    }
    if (data.format === PAPERDOC_FORMAT) {
      try {
        const doc = normalizeDoc(data)
        return {
          kind: 'paper',
          id: d.id,
          title: doc.meta.title || doc.pdfName,
          pdfName: doc.pdfName,
          folderId: doc.folderId ?? null,
          updatedAt: doc.updatedAt,
          revision: d.revision
        }
      } catch {
        return null
      }
    }
    return null
  }

  async getPaper(id: string): Promise<{ doc: PaperDoc; revision: number }> {
    const res = await this.sdk.sharedData.get(id)
    if (!res.ok) throw new Error(res.error)
    if (!res.data) throw new Error('文档不存在')
    return { doc: normalizeDoc(res.data.data), revision: res.data.revision }
  }

  async savePaper(doc: PaperDoc, expectedRevision?: number): Promise<number> {
    doc.updatedAt = new Date().toISOString()
    return this.putDoc(doc.id, doc, expectedRevision)
  }

  async deletePaper(id: string): Promise<void> {
    await this.removeDoc(id)
  }

  async createFolder(name: string, parentId: string | null): Promise<void> {
    const data: FolderData = { kind: 'folder', name, parentId, createdAt: new Date().toISOString() }
    await this.putDoc(`folder-${crypto.randomUUID()}`, data)
  }

  async renameFolder(id: string, name: string): Promise<void> {
    const node = (await this.listNodes()).find((n) => n.id === id)
    if (!node || node.kind !== 'folder') throw new Error('文件夹不存在')
    await this.putDoc(id, { kind: 'folder', name, parentId: node.parentId, createdAt: node.createdAt }, node.revision)
  }

  async deleteFolder(id: string): Promise<void> {
    const nodes = await this.listNodes()
    const folder = nodes.find((n): n is FolderNode => n.id === id && n.kind === 'folder')
    if (!folder) throw new Error('文件夹不存在')
    for (const n of nodes) {
      const parent = n.kind === 'folder' ? n.parentId : n.folderId
      if (parent === id) await this.moveNode(n.id, folder.parentId, n.revision)
    }
    await this.removeDoc(id)
  }

  async moveNode(id: string, parentId: string | null, revision?: number): Promise<void> {
    const nodes = await this.listNodes()
    const node = nodes.find((n) => n.id === id)
    if (!node) throw new Error('节点不存在')
    const rev = revision ?? node.revision
    if (node.kind === 'folder') {
      let cursor = parentId
      while (cursor !== null) {
        if (cursor === id) throw new Error('不能移动到自身或其子文件夹')
        const target = nodes.find((n) => n.kind === 'folder' && n.id === cursor) as FolderNode | undefined
        cursor = target?.parentId ?? null
      }
      await this.putDoc(id, { kind: 'folder', name: node.name, parentId, createdAt: node.createdAt }, rev)
      return
    }
    const { doc } = await this.getPaper(id)
    if (doc.folderId === parentId) return
    doc.folderId = parentId
    await this.savePaper(doc, rev)
  }
}
