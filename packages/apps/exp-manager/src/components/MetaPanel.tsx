import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExpMeta } from '../lib/expdoc'
import { btnGhost, Field, inputCls } from './ui'
import { MarkdownField } from './MarkdownField'
import { SettingsEditor } from './SettingsEditor'

// 左上角固定悬浮面板：元数据（标题/类型/实验设置/备注），可折叠。
export function MetaPanel({
  meta,
  createdAt,
  updatedAt,
  onChange
}: {
  meta: ExpMeta
  createdAt: string
  updatedAt: string
  onChange: (patch: Partial<ExpMeta>) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  const fmt = (iso: string): string => {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
  }

  if (collapsed) {
    return (
      <div className="absolute left-4 top-4 z-20">
        <button
          type="button"
          className="rounded-lg border border-zinc-200 bg-white/95 px-2.5 py-1.5 text-[12px] font-medium text-zinc-600 shadow-sm backdrop-blur hover:bg-white dark:border-zinc-700 dark:bg-zinc-800/95 dark:text-zinc-300 dark:hover:bg-zinc-800"
          onClick={() => setCollapsed(false)}
        >
          ℹ️ {t('panel.expand')}
        </button>
      </div>
    )
  }

  return (
    <div className="absolute left-4 top-4 z-20 w-80 rounded-xl border border-zinc-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-semibold">{t('panel.expand')}</h3>
        <button type="button" className={btnGhost} onClick={() => setCollapsed(true)}>
          —
        </button>
      </div>
      <div className="max-h-[calc(100vh-16rem)] space-y-3 overflow-y-auto pr-1">
        <div className="space-y-2">
          <Field label={t('panel.fieldTitle')}>
            <input className={inputCls} value={meta.title} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label={t('panel.fieldType')}>
            <input
              className={inputCls}
              placeholder={t('panel.typeHint')}
              value={meta.type}
              onChange={(e) => onChange({ type: e.target.value })}
            />
          </Field>
        </div>
        <div>
          <h4 className="mb-1.5 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">{t('panel.settings')}</h4>
          <SettingsEditor settings={meta.settings} onChange={(settings) => onChange({ settings })} />
        </div>
        <div>
          <h4 className="mb-1.5 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">{t('panel.notes')}</h4>
          <MarkdownField value={meta.notes} placeholder={t('panel.notesPlaceholder')} onChange={(notes) => onChange({ notes })} />
        </div>
        <div className="border-t border-zinc-100 pt-2 text-[11px] leading-4 text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          <div>
            {t('panel.created')}: {fmt(createdAt)}
          </div>
          <div>
            {t('panel.updated')}: {fmt(updatedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}
