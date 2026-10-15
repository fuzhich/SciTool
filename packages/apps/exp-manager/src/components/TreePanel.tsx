import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExpRepo, FolderNode, RepoNode } from '../lib/repo/exp-repo'
import { createExpDoc } from '../lib/expdoc'
import { Modal } from './Modal'
import { btnGhost, btnPrimary, inputCls } from './ui'

type DialogState =
  | { type: 'createFolder'; parentId: string | null }
  | { type: 'createExp'; parentId: string | null }
  | { type: 'rename'; id: string; name: string }
  | { type: 'move'; id: string; name: string }

const iconBtn =
  'rounded px-1 py-0.5 text-[11.5px] text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'

export function TreePanel({
  repo,
  nodes,
  selectedId,
  onSelect,
  onRefresh
}: {
  repo: ExpRepo
  nodes: RepoNode[]
  selectedId: string | null
  onSelect: (id: string | null) => void
  onRefresh: () => Promise<void>
}): React.JSX.Element {
  const { t } = useTranslation()
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [input, setInput] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const folders = nodes.filter((n): n is FolderNode => n.kind === 'folder')
  const exps = nodes.filter((n) => n.kind === 'exp')

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
    } else if (dialog.type === 'createExp') {
      const doc = createExpDoc(name, '', dialog.parentId)
      await run(async () => {
        await repo.saveExp(doc)
      })
      onSelect(doc.id)
    } else if (dialog.type === 'rename') {
      if (!name) return
      await run(async () => repo.renameFolder(dialog.id, name))
    }
    closeDialog()
  }

  const onDeleteFolder = async (f: FolderNode): Promise<void> => {
    if (!window.confirm(t('tree.deleteFolderConfirm', { name: f.name || '?' }))) return
    await run(async () => repo.deleteFolder(f.id))
  }
  const onDeleteExp = async (id: string, name: string): Promise<void> => {
    if (!window.confirm(t('tree.deleteExpConfirm', { name: name || t('tree.untitled') }))) return
    if (selectedId === id) onSelect(null)
    await run(async () => repo.deleteExp(id))
  }

  // 移动目标：排除自身与后代（文件夹移动时）
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

  const renderChildren = (parentId: string | null, depth: number): React.JSX.Element[] => {
    const items: React.JSX.Element[] = []
    for (const f of folders.filter((x) => x.parentId === parentId)) {
      const isCollapsed = collapsed.has(f.id)
      items.push(
        <div key={f.id}>
          <div className="group flex items-center gap-0.5 rounded-md px-2 py-1 hover:bg-zinc-100 dark:hover:bg-zinc-800/60" style={{ paddingLeft: 8 + depth * 14 }}>
            <button
              type="button"
              className="w-4 text-[10px] text-zinc-400"
              onClick={() => {
                const next = new Set(collapsed)
                if (isCollapsed) next.delete(f.id)
                else next.add(f.id)
                setCollapsed(next)
              }}
            >
              {isCollapsed ? '▸' : '▾'}
            </button>
            <span className="min-w-0 flex-1 truncate text-[12.5px] text-zinc-700 dark:text-zinc-300">📁 {f.name || '?'}</span>
            <span className="hidden gap-0.5 group-hover:flex">
              <button type="button" className={iconBtn} title={t('tree.newSubfolder')} onClick={() => openDialog({ type: 'createFolder', parentId: f.id })}>
                ＋
              </button>
              <button type="button" className={iconBtn} title={t('tree.rename')} onClick={() => openDialog({ type: 'rename', id: f.id, name: f.name }, f.name)}>
                ✎
              </button>
              <button type="button" className={iconBtn} title={t('tree.move')} onClick={() => openDialog({ type: 'move', id: f.id, name: f.name })}>
                ⤴
              </button>
              <button type="button" className={iconBtn} title={t('tree.delete')} onClick={() => void onDeleteFolder(f)}>
                🗑
              </button>
            </span>
          </div>
          {!isCollapsed && renderChildren(f.id, depth + 1)}
        </div>
      )
    }
    for (const e of exps.filter((x) => x.folderId === parentId)) {
      const name = e.title || t('tree.untitled')
      items.push(
        <div
          key={e.id}
          className={`group flex cursor-pointer items-center gap-0.5 rounded-md px-2 py-1 ${
            selectedId === e.id ? 'bg-blue-50 dark:bg-blue-950/50' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
          }`}
          style={{ paddingLeft: 8 + depth * 14 }}
          onClick={() => onSelect(e.id)}
        >
          <span className="w-4" />
          <span className="min-w-0 flex-1 truncate text-[12.5px] text-zinc-700 dark:text-zinc-300">🧪 {name}</span>
          <span className="hidden gap-0.5 group-hover:flex">
            <button type="button" className={iconBtn} title={t('tree.move')} onClick={(ev) => { ev.stopPropagation(); openDialog({ type: 'move', id: e.id, name }) }}>
              ⤴
            </button>
            <button type="button" className={iconBtn} title={t('tree.delete')} onClick={(ev) => { ev.stopPropagation(); void onDeleteExp(e.id, name) }}>
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
        <div className="flex gap-1.5">
          <button type="button" className={`${btnGhost} flex-1`} onClick={() => openDialog({ type: 'createFolder', parentId: null })}>
            ＋ {t('tree.newFolder')}
          </button>
          <button type="button" className={`${btnPrimary} flex-1`} onClick={() => openDialog({ type: 'createExp', parentId: null })}>
            ＋ {t('tree.newExp')}
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-1.5">
        {folders.length === 0 && exps.length === 0 ? (
          <p className="px-3 py-6 text-center text-[12px] text-zinc-400 dark:text-zinc-500">{t('doc.emptyDesc')}</p>
        ) : (
          renderChildren(null, 0)
        )}
      </div>
      {error && <p className="border-t border-zinc-200 px-3 py-2 text-[11px] leading-4 text-red-500 dark:border-zinc-800 dark:text-red-400">{error}</p>}

      {dialog && (
        <Modal title={dialog.type === 'move' ? t('tree.moveTitle', { name: dialog.name }) : dialog.type === 'rename' ? t('tree.renameTitle') : dialog.type === 'createExp' ? t('tree.newExp') : t('tree.newFolder')} onClose={closeDialog}>
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
                placeholder={dialog.type === 'createExp' ? t('tree.expTitlePlaceholder') : t('tree.folderPlaceholder')}
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
