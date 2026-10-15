import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createExpDoc } from '../lib/expdoc'
import type { ExpRepo, ExpSummary } from '../lib/repo/exp-repo'
import { Badge, btnDanger, btnPrimary, Card } from '../components/ui'

export function HomePage({
  repo,
  onOpen
}: {
  repo: ExpRepo
  onOpen: (id: string) => void
}): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const [items, setItems] = useState<ExpSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      const list = await repo.listExpSummaries()
      list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      setItems(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }, [repo])

  useEffect(() => {
    void load()
  }, [load])

  const onCreate = async (): Promise<void> => {
    try {
      const doc = createExpDoc('', '', null)
      await repo.saveExp(doc)
      onOpen(doc.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const onDelete = async (item: ExpSummary): Promise<void> => {
    const name = item.title || t('home.untitled')
    if (!window.confirm(t('home.deleteConfirm', { name }))) return
    try {
      await repo.deleteExp(item.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const fmtDate = (iso: string): string => {
    const d = new Date(iso)
    return Number.isNaN(d.getTime())
      ? iso
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{t('home.title')}</h1>
        <button type="button" className={btnPrimary} onClick={() => void onCreate()}>
          + {t('home.newExp')}
        </button>
      </div>

      {error && <p className="mb-4 text-[12.5px] text-red-500 dark:text-red-400">{error}</p>}

      {items === null ? (
        <p className="text-center text-[12.5px] text-zinc-400">…</p>
      ) : items.length === 0 ? (
        <div className="py-20 text-center">
          <div className="mb-3 text-3xl">🧪</div>
          <h2 className="text-[15px] font-semibold">{t('home.emptyTitle')}</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">
            {t('home.emptyDesc')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const name = item.title || t('home.untitled')
            return (
              <Card key={item.id} className="flex items-center justify-between !p-4">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => onOpen(item.id)}
                >
                  <div className="truncate text-[13.5px] font-medium">{name}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11.5px] text-zinc-400 dark:text-zinc-500">
                    {item.type ? (
                      <Badge tone="zinc">{item.type}</Badge>
                    ) : null}
                    <span>
                      {t('home.colUpdated')}: {fmtDate(item.updatedAt)}
                    </span>
                  </div>
                </button>
                <button type="button" className={btnDanger} onClick={() => void onDelete(item)}>
                  {t('home.delete')}
                </button>
              </Card>
            )
          })}
        </div>
      )}
      <p className="mt-6 text-center text-[11px] text-zinc-300 dark:text-zinc-600">
        {i18n.language === 'en' ? 'Experiments · v1.0.0' : '实验管理 · v1.0.0'}
      </p>
    </div>
  )
}
