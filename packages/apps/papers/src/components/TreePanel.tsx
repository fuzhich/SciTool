import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { FolderNode, PaperRepo, RepoNode } from '../lib/repo/paper-repo'
import { Modal } from './Modal'
import { btnGhost, btnPrimary, inputCls } from './ui'

type DialogState =
  | { type: 'createFolder'; parentId: string | null }
  | { type: 'renameFolder'; id: string; name: string }
  | { type: 'renamePaper'; id: string; name: string }
  | { type: 'move'; id: string; name: string }

const iconBtn =
  'rounded px-1 py-0.5 text-[11.5px] text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'

export function TreePanel({
  repo,
  nodes,
  selectedId,
  onSelect,
  onRefresh,
  onImportPdf,
  onImportFile
}: {
  repo: PaperRepo
  nodes: RepoNode[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onRefresh: () => Promise<void>
  onImportPdf: (targetFolderId: string | null) => void
  onImportFile: (file: File, targetFolderId: string | null) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [input, setInput] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const folders = nodes.filter((n): n is FolderNode => n.kind === 'folder')
  const papers = nodes.filter((n) => n.kind === 'paper')

  const run = async (fn: () => Promise<void>): Promise<void> => {
    try {
      setError(null)
      await fn()
      await onRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const openDialog = (state: DialogState, initialInput = ''): void => {
    setInput(initialInput)
    setDialog(state)
  }
  const closeDialog = (): void => setDialog(null)

  const submitDialog = async (): Promise<void> => {
    if (!dialog) return
    const name = input.trim()
    if (dialog.type === 'createFolder') {
      if (!name) return
      await run(async () => repo.createFolder(name, dialog.parentId))
    } else if (dialog.type === 'renameFolder') {
      if (!name) return
      await run(async () => repo.renameFolder(dialog.id, name))
    } else if (dialog.type === 'renamePaper') {
      if (!name) return
      await run(async () => {
        const { doc, revision } = await repo.getPaper(dialog.id)
        doc.meta.title = name
        await repo.savePaper(doc, revision)
      })
    }
    closeDialog()
  }

  const onDeleteFolder = async (f: FolderNode): Promise<void> => {
    if (!window.confirm(t('tree.deleteFolderConfirm', { name: f.name || '?' }))) return
    await run(async () => repo.deleteFolder(f.id))
  }
  const onDeletePaper = async (id: string, name: string): Promise<void> => {
    if (!window.confirm(t('tree.deletePaperConfirm', { name: name || t('tree.untitled') }))) return
    if (selectedId === id) onSelect(null)
    await run(async () => repo.deletePaper(id))
  }

  const toggleFolder = (id: string): void => {
    const next = new Set(collapsed)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setCollapsed(next)
  }

  const moveTargets = (): { id: string | null; name: string; depth: number }[] => {
    if (!dialog || dialog.type !== 'move') return []
    const exclude = new Set<string>([dialog.id])
    if (dialog.id.startsWith('folder-')) {
      let changed = true
      while (changed) {
        changed = false
        for (const f of folders) {
          if (exclude.has(f.parentId ?? '') && !exclude.has(f.id)) {
            exclude.add(f.id)
            changed = true
          }
        }
      }
    }
    const depthOf = (id: string | null, depth = 0): number => {
      const f = folders.find((x) => x.id === id)
      if (!f || f.parentId === null) return depth
      return depthOf(f.parentId, depth + 1)
    }
    const targets: { id: string | null; name: string; depth: number }[] = [{ id: null, name: t('tree.moveRoot'), depth: 0 }]
    for (const f of folders) {
      if (exclude.has(f.id)) continue
      targets.push({ id: f.id, name: f.name, depth: depthOf(f.parentId) + 1 })
    }
    return targets
  }

  const handleFolderDrop = (f: FolderNode, e: React.DragEvent): void => {
    e.preventDefault()
    setDragOverId(null)
    const files = Array.from(e.dataTransfer.files ?? [])
    if (files.length > 0) {
      for (const file of files) {
        if (file.name.toLowerCase().endsWith('.pdf')) onImportFile(file, f.id)
      }
      return
    }
    const dragged = e.dataTransfer.getData('text/plain')
    if (dragged && dragged !== f.id) {
      void run(async () => repo.moveNode(dragged, f.id))
    }
  }

  const handleTreeDrop = (e: React.DragEvent): void => {
    const files = Array.from(e.dataTransfer.files ?? [])
    if (files.length > 0) {
      if (e.dataTransfer.types.includes('Files')) {
        e.preventDefault()
        for (const file of files) {
          if (file.name.toLowerCase().endsWith('.pdf')) onImportFile(file, null)
        }
      }
      return
    }
    const dragged = e.dataTransfer.getData('text/plain')
    if (dragged && dragOverId === null) {
      e.preventDefault()
      void run(async () => repo.moveNode(dragged, null))
    }
  }

  const renderChildren = (parentId: string | null, depth: number): React.JSX.Element[] => {
    const items: React.JSX.Element[] = []
    for (const f of folders.filter((x) => x.parentId === parentId)) {
      const isCollapsed = collapsed.has(f.id)
      items.push(
        <div key={f.id}>
          <div
            className={`group flex cursor-pointer items-center gap-0.5 rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 ${
              dragOverId === f.id ? 'bg-blue-100 ring-1 ring-blue-400 dark:bg-blue-950/50' : ''
            }`}
            style={{ paddingLeft: 8 + depth * 14 }}
            onClick={() => toggleFolder(f.id)}
            onDragOver={(e) => {
              e.preventDefault()
              if (dragOverId !== f.id) setDragOverId(f.id)
            }}
            onDragLeave={(e) => {
              if (dragOverId === f.id && !e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverId(null)
              }
            }}
            onDrop={(e) => handleFolderDrop(f, e)}
          >
            <span className="w-4 text-[10px] text-zinc-400">{isCollapsed ? '▸' : '▾'}</span>
            <span className="min-w-0 flex-1 truncate text-[12.5px] text-zinc-700 dark:text-zinc-300">📁 {f.name || '?'}</span>
            <span className="hidden gap-0.5 group-hover:flex">
              <button type="button" className={iconBtn} title={t('tree.newSubfolder')} onClick={(ev) => { ev.stopPropagation(); openDialog({ type: 'createFolder', parentId: f.id }) }}>
                ＋
              </button>
              <button type="button" className={iconBtn} title={t('tree.rename')} onClick={(ev) => { ev.stopPropagation(); openDialog({ type: 'renameFolder', id: f.id, name: f.name }, f.name) }}>
                ✎
              </button>
              <button type="button" className={iconBtn} title={t('tree.move')} onClick={(ev) => { ev.stopPropagation(); openDialog({ type: 'move', id: f.id, name: f.name }) }}>
                ⤴
              </button>
              <button type="button" className={iconBtn} title={t('tree.delete')} onClick={(ev) => { ev.stopPropagation(); void onDeleteFolder(f) }}>
                🗑
              </button>
            </span>
          </div>
          {!isCollapsed && renderChildren(f.id, depth + 1)}
        </div>
      )
    }
    for (const p of papers.filter((x) => x.folderId === parentId)) {
      const name = p.title || p.pdfName || t('tree.untitled')
      items.push(
        <div
          key={p.id}
          draggable
          className={`group flex cursor-pointer items-center gap-0.5 rounded-md px-2 py-1 ${
            selectedId === p.id ? 'bg-blue-50 dark:bg-blue-950/50' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
          style={{ paddingLeft: 8 + depth * 14 }}
          onClick={() => onSelect(p.id)}
          onDragStart={(ev) => {
            ev.dataTransfer.setData('text/plain', p.id)
            ev.dataTransfer.effectAllowed = 'move'
          }}
          onDrop={(e) => e.stopPropagation()}
        >
          <span className="w-4" />
          <span className="min-w-0 flex-1 truncate text-[12.5px] text-zinc-700 dark:text-zinc-300">📄 {name}</span>
          <span className="hidden gap-0.5 group-hover:flex">
            <button type="button" className={iconBtn} title={t('tree.rename')} onClick={(ev) => { ev.stopPropagation(); openDialog({ type: 'renamePaper', id: p.id, name }) }}>
              ✎
            </button>
            <button type="button" className={iconBtn} title={t('tree.move')} onClick={(ev) => { ev.stopPropagation(); openDialog({ type: 'move', id: p.id, name }) }}>
              ⤴
            </button>
            <button type="button" className={iconBtn} title={t('tree.delete')} onClick={(ev) => { ev.stopPropagation(); void onDeletePaper(p.id, name) }}>
              🗑
            </button>
          </span>
        </div>
      )
    }
    return items
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-[11px] font-bold text-white">
            P
          </div>
          <span className="text-[13px] font-semibold">{t('app.name')}</span>
        </div>
        <div className="flex gap-1.5">
          <button type="button" className={`${btnGhost} flex-1`} onClick={() => openDialog({ type: 'createFolder', parentId: null })}>
            ＋ {t('tree.newFolder')}
          </button>
          <button type="button" className={`${btnPrimary} flex-1`} onClick={() => onImportPdf(null)}>
            ＋ {t('tree.importPdf')}
          </button>
        </div>
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto py-1.5"
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes('Files') || e.dataTransfer.types.includes('text/plain')) {
            e.preventDefault()
          }
        }}
        onDrop={handleTreeDrop}
      >
        {folders.length === 0 && papers.length === 0 ? (
          <p className="px-3 py-6 text-center text-[12px] text-zinc-400 dark:text-zinc-500">{t('detail.emptyDesc')}</p>
        ) : (
          renderChildren(null, 0)
        )}
      </div>
      {error && <p className="border-t border-zinc-200 px-3 py-2 text-[11px] leading-4 text-red-500 dark:border-zinc-800 dark:text-red-400">{error}</p>}

      {dialog && (
        <Modal
          title={dialog.type === 'move' ? t('tree.moveTitle', { name: dialog.name }) : t('tree.renameTitle')}
          onClose={closeDialog}
        >
          {dialog.type === 'move' ? (
            <div className="max-h-72 space-y-0.5 overflow-y-auto">
              {moveTargets().length === 0 ? (
                <p className="py-4 text-center text-[12.5px] text-zinc-400">{t('tree.moveEmpty')}</p>
              ) : (
                moveTargets().map((target) => (
                  <button
                    key={target.id ?? 'root'}
                    type="button"
                    className="block w-full rounded-md px-2 py-1.5 text-left text-[12.5px] text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    style={{ paddingLeft: 8 + target.depth * 14 }}
                    onClick={() => {
                      void run(async () => repo.moveNode(dialog.id, target.id)).then(closeDialog)
                    }}
                  >
                    {target.id === null ? target.name : `📁 ${target.name || '?'}`}
                  </button>
                ))
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                autoFocus
                className={`${inputCls} min-w-0 flex-1`}
                placeholder={dialog.type === 'renamePaper' ? t('tree.paperNamePlaceholder') : t('tree.folderPlaceholder')}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void submitDialog()
                }}
              />
              <button type="button" className={btnPrimary} disabled={!input.trim()} onClick={() => void submitDialog()}>
                {t('tree.create')}
              </button>
            </div>
          )}
        </Modal>
      )}
    </aside>
  )
}
