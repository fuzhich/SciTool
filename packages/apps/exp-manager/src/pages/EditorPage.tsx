import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExpDoc } from '../lib/expdoc'
import { createTable } from '../lib/expdoc'
import type { ExpRepo } from '../lib/repo/exp-repo'
import { Badge, btnGhost, btnPrimary, Field, inputCls, SectionCard } from '../components/ui'
import { MarkdownField } from '../components/MarkdownField'
import { SettingsEditor } from '../components/SettingsEditor'
import { TableEditor } from '../components/TableEditor'
import { ImageSection } from '../components/ImageSection'
import { ResultsEditor } from '../components/ResultsEditor'

export function EditorPage({
  repo,
  docId,
  onBack
}: {
  repo: ExpRepo
  docId: string
  onBack: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const [doc, setDoc] = useState<ExpDoc | null>(null)
  const [revision, setRevision] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const flashTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    void (async () => {
      try {
        const { doc: loaded, revision: rev } = await repo.getExp(docId)
        setDoc(loaded)
        setRevision(rev)
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err))
      }
    })()
  }, [repo, docId])

  const showFlash = (text: string): void => {
    setFlash(text)
    window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlash(null), 2500)
  }

  const update = useCallback((patch: Partial<ExpDoc> | ((d: ExpDoc) => Partial<ExpDoc>)): void => {
    setDoc((d) => {
      if (!d) return d
      return { ...d, ...(typeof patch === 'function' ? patch(d) : patch) }
    })
    setDirty(true)
  }, [])

  const onSave = async (): Promise<void> => {
    if (!doc || saving) return
    setSaving(true)
    try {
      const rev = await repo.saveExp(doc, revision)
      setRevision(rev)
      setDirty(false)
      showFlash(t('editor.saved'))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      showFlash(`${t('editor.saveFailed')}: ${msg.includes('revision') || msg.includes('冲突') ? t('editor.conflict') : msg}`)
    } finally {
      setSaving(false)
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-8 py-16 text-center">
        <p className="text-[13px] text-red-500 dark:text-red-400">
          {error.includes('不存在') ? t('editor.notFound') : `${t('editor.loadFailed')}: ${error}`}
        </p>
        <button type="button" className={`${btnPrimary} mt-4`} onClick={onBack}>
          {t('editor.back')}
        </button>
      </div>
    )
  }
  if (!doc) {
    return <p className="px-8 py-16 text-center text-[12.5px] text-zinc-400">…</p>
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button type="button" className={btnGhost} onClick={onBack}>
            ← {t('editor.back')}
          </button>
          {dirty && <Badge tone="amber">{t('editor.unsaved')}</Badge>}
        </div>
        <div className="flex items-center gap-3">
          {flash && <span className="text-[12px] text-zinc-400 dark:text-zinc-500">{flash}</span>}
          <button type="button" className={btnPrimary} disabled={saving || !dirty} onClick={() => void onSave()}>
            {saving ? '…' : t('editor.save')}
          </button>
        </div>
      </div>

      <SectionCard title={t('editor.sectionBasic')}>
        <div className="space-y-2.5">
          <Field label={t('editor.fieldTitle')}>
            <input className={inputCls} value={doc.title} onChange={(e) => update({ title: e.target.value })} />
          </Field>
          <Field label={t('editor.fieldType')}>
            <input
              className={inputCls}
              placeholder={t('editor.typeHint')}
              value={doc.type}
              onChange={(e) => update({ type: e.target.value })}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard title={t('editor.sectionSettings')}>
        <SettingsEditor settings={doc.settings} onChange={(settings) => update({ settings })} />
      </SectionCard>

      <SectionCard
        title={t('editor.sectionTables')}
        actions={
          <button type="button" className={btnGhost} onClick={() => update((d) => ({ tables: [...d.tables, createTable()] }))}>
            + {t('editor.addTable')}
          </button>
        }
      >
        {doc.tables.length === 0 ? (
          <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500">—</p>
        ) : (
          <div className="space-y-3">
            {doc.tables.map((table) => (
              <TableEditor
                key={table.id}
                table={table}
                onChange={(next) =>
                  update((d) => ({ tables: d.tables.map((x) => (x.id === next.id ? next : x)) }))
                }
              />
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title={t('editor.sectionImages')}>
        <ImageSection images={doc.images} onChange={(images) => update({ images })} />
      </SectionCard>

      <SectionCard title={t('editor.sectionResults')}>
        <ResultsEditor results={doc.results} onChange={(results) => update({ results })} />
      </SectionCard>

      <SectionCard title={t('editor.sectionNotes')}>
        <MarkdownField value={doc.notes} placeholder={t('editor.notesPlaceholder')} onChange={(notes) => update({ notes })} />
      </SectionCard>
    </div>
  )
}
