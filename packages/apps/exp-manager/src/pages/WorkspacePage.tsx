import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExpBlock, ExpDoc, ExpMeta } from '../lib/expdoc'
import type { ExpRepo, RepoNode } from '../lib/repo/exp-repo'
import { Badge, btnPrimary } from '../components/ui'
import { TreePanel } from '../components/TreePanel'
import { DocView } from '../components/DocView'
import { MetaPanel } from '../components/MetaPanel'

export function WorkspacePage({ repo }: { repo: ExpRepo }): React.JSX.Element {
  const { t } = useTranslation()
  const [nodes, setNodes] = useState<RepoNode[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [doc, setDoc] = useState<ExpDoc | null>(null)
  const [revision, setRevision] = useState<number | undefined>(undefined)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const flashTimer = useRef<number | undefined>(undefined)

  const refresh = useCallback(async (): Promise<void> => {
    try {
      setNodes(await repo.listNodes())
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [repo])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!selectedId) {
      setDoc(null)
      setError(null)
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const { doc: loaded, revision: rev } = await repo.getExp(selectedId)
        if (!cancelled) {
          setDoc(loaded)
          setRevision(rev)
          setDirty(false)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setDoc(null)
          setError(err instanceof Error ? err.message : String(err))
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedId, repo])

  const showFlash = (text: string): void => {
    setFlash(text)
    window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlash(null), 2500)
  }

  const updateMeta = (patch: Partial<ExpMeta>): void => {
    setDoc((d) => (d ? { ...d, meta: { ...d.meta, ...patch } } : d))
    setDirty(true)
  }
  const updateBlocks = (blocks: ExpBlock[]): void => {
    setDoc((d) => (d ? { ...d, blocks } : d))
    setDirty(true)
  }

  const onSave = async (): Promise<void> => {
    if (!doc || saving) return
    setSaving(true)
    try {
      const rev = await repo.saveExp(doc, revision)
      setRevision(rev)
      setDirty(false)
      showFlash(t('save.saved'))
      await refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      showFlash(`${t('save.failed')}: ${msg.includes('revision') || msg.includes('冲突') ? t('save.conflict') : msg}`)
    } finally {
      setSaving(false)
    }
  }

  // Ctrl+S / Cmd+S 保存
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault()
        void onSave()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // 缩放：Ctrl+滚轮（±10%，范围 50%–200%）
  const [zoom, setZoom] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e: WheelEvent): void => {
      if (!e.ctrlKey) return
      e.preventDefault()
      setZoom((z) => Math.min(2, Math.max(0.5, z + (e.deltaY < 0 ? 0.1 : -0.1))))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [doc?.id])

  const clampZoom = (z: number): number => Math.min(2, Math.max(0.5, z))

  return (
    <div className="flex min-h-0 flex-1">
      <TreePanel
        repo={repo}
        nodes={nodes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRefresh={refresh}
      />
      {/* 外层不滚动：悬浮面板与保存按钮固定；滚动只发生在文档内容区 */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        {doc ? (
          <>
            <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
              {/* h-full（确定高度）打通高度链：父级仅 min-height 时子级百分比高度不解析，
                  文档可交互区域必须用确定高度才能铺满可视区 */}
              <div className="h-full" style={{ zoom } as React.CSSProperties}>
                <DocView blocks={doc.blocks} onChange={updateBlocks} />
              </div>
            </div>
            <MetaPanel
              meta={doc.meta}
              createdAt={doc.createdAt}
              updatedAt={doc.updatedAt}
              onChange={updateMeta}
            />
            <div className="absolute right-4 top-4 z-20 flex items-center gap-2.5">
              {dirty && <Badge tone="amber">{t('save.unsaved')}</Badge>}
              {flash && <span className="text-[12px] text-zinc-400 dark:text-zinc-500">{flash}</span>}
              <button type="button" className={btnPrimary} disabled={saving || !dirty} onClick={() => void onSave()}>
                {saving ? '…' : t('save.save')}
              </button>
            </div>
            {/* 缩放指示器（底部居中，右下角留给实验信息面板） */}
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-lg border border-zinc-200 bg-white/95 px-1.5 py-1 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
              <button
                type="button"
                className="w-6 rounded text-[13px] text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title={t('save.zoomOut')}
                onClick={() => setZoom((z) => clampZoom(z - 0.1))}
              >
                −
              </button>
              <button
                type="button"
                className="w-12 text-center text-[11.5px] font-medium text-zinc-600 dark:text-zinc-300"
                title={t('save.zoomReset')}
                onClick={() => setZoom(1)}
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                className="w-6 rounded text-[13px] text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                title={t('save.zoomIn')}
                onClick={() => setZoom((z) => clampZoom(z + 0.1))}
              >
                ＋
              </button>
            </div>
          </>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <p className="text-[13px] text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="text-3xl">🧪</div>
            <h2 className="text-[15px] font-semibold">{t('doc.emptyTitle')}</h2>
            <p className="max-w-sm text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('doc.emptyDesc')}</p>
          </div>
        )}
      </main>
    </div>
  )
}
