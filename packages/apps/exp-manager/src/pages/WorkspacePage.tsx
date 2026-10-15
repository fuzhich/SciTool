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

  return (
    <div className="flex min-h-0 flex-1">
      <TreePanel
        repo={repo}
        nodes={nodes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRefresh={refresh}
      />
      <main className="relative min-w-0 flex-1 overflow-y-auto">
        {doc ? (
          <>
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
            <DocView blocks={doc.blocks} onChange={updateBlocks} />
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
