import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import type { PaperDoc, PaperMeta } from '../lib/paperdoc'
import { createPaperDoc } from '../lib/paperdoc'
import type { PaperRepo, RepoNode } from '../lib/repo/paper-repo'
import { autoExtractMeta } from '../lib/meta-extract'
import { Badge, btnGhost, btnPrimary, Field, inputCls, textareaCls } from '../components/ui'
import { TreePanel } from '../components/TreePanel'

const AI_ENABLED_KEY = 'aiEnabled'
const MAX_PDF_BYTES = 50 * 1024 * 1024

interface ExtractState {
  phase: 'idle' | 'running' | 'done'
  sources: string[]
  failed: string[]
}

export function WorkspacePage({ sdk, repo }: { sdk: Sdk; repo: PaperRepo }): React.JSX.Element {
  const { t } = useTranslation()
  const [nodes, setNodes] = useState<RepoNode[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [doc, setDoc] = useState<PaperDoc | null>(null)
  const [revision, setRevision] = useState<number | undefined>(undefined)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [extract, setExtract] = useState<ExtractState>({ phase: 'idle', sources: [], failed: [] })
  const [aiOn, setAiOn] = useState<boolean>(true)
  const [aiAvail, setAiAvail] = useState(false)
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
    void (async () => {
      const stored = await sdk.storage.get<string>(AI_ENABLED_KEY)
      setAiOn(stored.ok && stored.data !== null ? stored.data !== '0' : true)
      const avail = await sdk.ai.available()
      setAiAvail(avail.ok && avail.data === true)
    })()
  }, [refresh, sdk])

  useEffect(() => {
    if (!selectedId) {
      setDoc(null)
      setError(null)
      setExtract({ phase: 'idle', sources: [], failed: [] })
      return
    }
    let cancelled = false
    void (async () => {
      try {
        const { doc: loaded, revision: rev } = await repo.getPaper(selectedId)
        if (!cancelled) {
          setDoc(loaded)
          setRevision(rev)
          setDirty(false)
          setError(null)
          setExtract({ phase: 'idle', sources: [], failed: [] })
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

  const updateMeta = (patch: Partial<PaperMeta>): void => {
    setDoc((d) => (d ? { ...d, meta: { ...d.meta, ...patch } } : d))
    setDirty(true)
  }

  const onSave = async (): Promise<void> => {
    if (!doc || saving) return
    setSaving(true)
    try {
      const rev = await repo.savePaper(doc, revision)
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

  const toggleAi = async (): Promise<void> => {
    const next = !aiOn
    setAiOn(next)
    const res = await sdk.storage.set(AI_ENABLED_KEY, next ? '1' : '0')
    if (!res.ok) setAiOn(!next)
  }

  const runExtract = async (target: PaperDoc, rev: number | undefined, useAi: boolean, confirmOverwrite: boolean): Promise<void> => {
    if (!target.pdfRef) return
    setExtract({ phase: 'running', sources: [], failed: [] })
    try {
      const file = await sdk.fileStore.get(target.pdfRef)
      if (!file.ok || !file.data) throw new Error(file.error ?? 'PDF 文件不存在')
      const result = await autoExtractMeta(sdk, file.data.data, useAi)
      const meta: PaperMeta = { ...target.meta }
      for (const [k, v] of Object.entries(result.meta)) {
        const key = k as keyof PaperMeta
        if (typeof v === 'string' && v && (confirmOverwrite || !meta[key])) meta[key] = v
      }
      target.meta = meta
      const newRev = await repo.savePaper(target, rev)
      setDoc(target)
      setRevision(newRev)
      setDirty(false)
      setExtract({ phase: 'done', sources: result.sources, failed: result.failed })
    } catch (err) {
      setExtract({
        phase: 'done',
        sources: [],
        failed: [err instanceof Error ? err.message : String(err)]
      })
    }
  }

  const importPdf = async (name: string, data: Uint8Array, folderId: string | null): Promise<void> => {
    try {
      if (data.byteLength > MAX_PDF_BYTES) {
        showFlash(t('detail.importTooBig'))
        return
      }
      const put = await sdk.fileStore.put(name, data)
      if (!put.ok || !put.data) throw new Error(put.error ?? '存储失败')
      const paper = createPaperDoc(name.replace(/\.pdf$/i, ''), folderId, put.data, name)
      await repo.savePaper(paper)
      await refresh()
      setSelectedId(paper.id)
      // 导入后自动识别（AI 开关生效时走增强路径）
      void runExtract(paper, 1, aiOn && aiAvail, false)
    } catch (err) {
      showFlash(`${t('detail.importFailed')}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const onPickPdf = async (folderId: string | null): Promise<void> => {
    const res = await sdk.ui.pickFile([{ name: 'PDF', extensions: ['pdf'] }])
    if (!res.ok || !res.data) return
    await importPdf(res.data.name, res.data.data, folderId)
  }

  const onImportFile = (file: File, folderId: string | null): void => {
    void (async () => {
      await importPdf(file.name, new Uint8Array(await file.arrayBuffer()), folderId)
    })()
  }

  const useAi = aiOn && aiAvail

  const metaFields: { key: keyof PaperMeta; label: string; textarea?: boolean }[] = [
    { key: 'title', label: t('detail.fieldTitle') },
    { key: 'authors', label: t('detail.fieldAuthors') },
    { key: 'affiliations', label: t('detail.fieldAffiliations') },
    { key: 'year', label: t('detail.fieldYear') },
    { key: 'venue', label: t('detail.fieldVenue') },
    { key: 'doi', label: t('detail.fieldDoi') },
    { key: 'abstract', label: t('detail.fieldAbstract'), textarea: true },
    { key: 'keywords', label: t('detail.fieldKeywords') }
  ]

  return (
    <div className="flex min-h-0 flex-1">
      <TreePanel
        repo={repo}
        nodes={nodes}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onRefresh={refresh}
        onImportPdf={(folderId) => void onPickPdf(folderId)}
        onImportFile={onImportFile}
      />
      <main className="relative flex min-w-0 flex-1 flex-col">
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2.5">
          {dirty && <Badge tone="amber">{t('save.unsaved')}</Badge>}
          {flash && <span className="text-[12px] text-zinc-400 dark:text-zinc-500">{flash}</span>}
          <button type="button" className={btnPrimary} disabled={saving || !dirty} onClick={() => void onSave()}>
            {saving ? '…' : t('save.save')}
          </button>
        </div>

        {doc ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl px-8 py-8">
              {/* AI 开关 */}
              <div className="mb-6 flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
                <div>
                  <div className="text-[13px] font-medium">{t('detail.aiToggleTitle')}</div>
                  {!aiAvail && <div className="mt-0.5 text-[11.5px] text-amber-600 dark:text-amber-400">{t('detail.aiUnavailable')}</div>}
                </div>
                <button
                  type="button"
                  className={`relative h-5 w-9 rounded-full transition-colors ${aiOn ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                  title={t('detail.aiToggleTitle')}
                  onClick={() => void toggleAi()}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${aiOn ? 'left-[18px]' : 'left-0.5'}`}
                  />
                </button>
              </div>

              {/* PDF 信息 */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg dark:bg-red-950/40">
                  📄
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-medium">{doc.pdfName || t('detail.pdfMissing')}</div>
                  <div className="text-[11.5px] text-zinc-400 dark:text-zinc-500">{t('detail.pdfLabel')}</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  {extract.phase === 'running' && (
                    <span className="text-[12px] text-zinc-400 dark:text-zinc-500">{t('detail.extracting')}</span>
                  )}
                  {extract.phase === 'done' && (
                    <span className="text-[12px] text-emerald-600 dark:text-emerald-400">{t('detail.extractDone')}</span>
                  )}
                  <button
                    type="button"
                    className={btnGhost}
                    disabled={extract.phase === 'running' || !doc.pdfRef}
                    onClick={() => {
                      if (window.confirm(t('detail.reExtractConfirm'))) {
                        void runExtract(doc, revision, useAi, true)
                      }
                    }}
                  >
                    {t('detail.reExtract')}
                  </button>
                </div>
              </div>

              {(extract.sources.length > 0 || extract.failed.length > 0) && (
                <div className="mb-5 space-y-1 text-[11.5px] leading-4">
                  {extract.sources.length > 0 && (
                    <div className="text-zinc-400 dark:text-zinc-500">
                      {t('detail.sources')}: <span className="text-emerald-600 dark:text-emerald-400">{extract.sources.join(' → ')}</span>
                    </div>
                  )}
                  {extract.failed.length > 0 && (
                    <div className="text-zinc-400 dark:text-zinc-500">
                      {t('detail.failed')}: <span className="text-red-500 dark:text-red-400">{extract.failed.join('；')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 元数据表单 */}
              <div className="space-y-2.5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
                {metaFields.map((f) => (
                  <Field key={f.key} label={f.label}>
                    {f.textarea ? (
                      <textarea
                        className={`${textareaCls} min-h-24`}
                        value={doc.meta[f.key]}
                        onChange={(e) => updateMeta({ [f.key]: e.target.value } as Partial<PaperMeta>)}
                      />
                    ) : (
                      <input
                        className={inputCls}
                        value={doc.meta[f.key]}
                        onChange={(e) => updateMeta({ [f.key]: e.target.value } as Partial<PaperMeta>)}
                      />
                    )}
                  </Field>
                ))}
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <p className="text-[13px] text-red-500 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <div className="text-3xl">📚</div>
            <h2 className="text-[15px] font-semibold">{t('detail.emptyTitle')}</h2>
            <p className="max-w-sm text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('detail.emptyDesc')}</p>
          </div>
        )}
      </main>
    </div>
  )
}
