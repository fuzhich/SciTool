import type { Sdk, SharedDoc } from '@scitool/sdk'
import { EXPDOC_FORMAT, migrateDoc, type ExpDoc } from '../expdoc'

export const EXPS_DOMAIN = 'exps'

export interface FolderNode {
  kind: 'folder'
  id: string
  name: string
  parentId: string | null
  createdAt: string
  revision: number
}

export interface ExpSummary {
  kind: 'exp'
  id: string
  title: string
  type: string
  folderId: string | null
  updatedAt: string
  revision: number
}

export type RepoNode = FolderNode | ExpSummary

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

// exps 域仓库：文件夹与实验文档均为 sharedData 文档（kind 区分）。
// 所有写操作走 expectedRevision 乐观锁，冲突抛出由 UI 提示刷新。
export class ExpRepo {
  constructor(private readonly sdk: Sdk) {}

  private async putDoc(id: string, data: unknown, expectedRevision?: number): Promise<number> {
    const res = await this.sdk.sharedData.put(id, data, { domain: EXPS_DOMAIN, expectedRevision })
    if (!res.ok) throw new Error(res.error)
    return res.data!.revision
  }

  private async removeDoc(id: string): Promise<void> {
    const res = await this.sdk.sharedData.remove(id)
    if (!res.ok) throw new Error(res.error)
  }

  async listNodes(): Promise<RepoNode[]> {
    const res = await this.sdk.sharedData.list({ domain: EXPS_DOMAIN })
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
    if (data.format === EXPDOC_FORMAT) {
      const doc = migrateDoc(data)
      return {
        kind: 'exp',
        id: d.id,
        title: doc.meta.title,
        type: doc.meta.type,
        folderId: doc.folderId ?? null,
        updatedAt: doc.updatedAt,
        revision: d.revision
      }
    }
    return null
  }

  async listExpSummaries(): Promise<ExpSummary[]> {
    return (await this.listNodes()).filter((n): n is ExpSummary => n.kind === 'exp')
  }

  async getExp(id: string): Promise<{ doc: ExpDoc; revision: number }> {
    const res = await this.sdk.sharedData.get(id)
    if (!res.ok) throw new Error(res.error)
    if (!res.data) throw new Error('文档不存在')
    const doc = migrateDoc(res.data.data)
    return { doc, revision: res.data.revision }
  }

  async saveExp(doc: ExpDoc, expectedRevision?: number): Promise<number> {
    doc.updatedAt = new Date().toISOString()
    return this.putDoc(doc.id, doc, expectedRevision)
  }

  async deleteExp(id: string): Promise<void> {
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

  // 删除文件夹：子项（子文件夹与实验文档）上移一级到本文件夹的父级，再删除
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
    const node = (await this.listNodes()).find((n) => n.id === id)
    if (!node) throw new Error('节点不存在')
    const rev = revision ?? node.revision
    if (node.kind === 'folder') {
      await this.putDoc(
        id,
        { kind: 'folder', name: node.name, parentId, createdAt: node.createdAt },
        rev
      )
      return
    }
    const { doc } = await this.getExp(id)
    if (doc.folderId === parentId) return
    doc.folderId = parentId
    await this.saveExp(doc, rev)
  }
}
