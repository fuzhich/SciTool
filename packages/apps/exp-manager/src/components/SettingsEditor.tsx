import { useTranslation } from 'react-i18next'
import type { ExpSetting } from '../lib/expdoc'
import { createSetting } from '../lib/expdoc'
import { btnDanger, btnGhost, inputCls } from './ui'

export function SettingsEditor({
  settings,
  onChange
}: {
  settings: ExpSetting[]
  onChange: (next: ExpSetting[]) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const patch = (id: string, field: keyof ExpSetting, value: string): void => {
    onChange(settings.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }
  return (
    <div className="space-y-2">
      {settings.length === 0 && (
        <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500">—</p>
      )}
      {settings.map((s) => (
        <div key={s.id} className="flex items-center gap-2">
          <input
            className={`${inputCls} w-48`}
            placeholder={t('editor.colName')}
            value={s.name}
            onChange={(e) => patch(s.id, 'name', e.target.value)}
          />
          <input
            className={`${inputCls} min-w-0 flex-1`}
            placeholder={t('editor.colValue')}
            value={s.value}
            onChange={(e) => patch(s.id, 'value', e.target.value)}
          />
          <input
            className={`${inputCls} w-20`}
            placeholder={t('editor.colUnit')}
            value={s.unit}
            onChange={(e) => patch(s.id, 'unit', e.target.value)}
          />
          <button type="button" className={btnDanger} onClick={() => onChange(settings.filter((x) => x.id !== s.id))}>
            {t('editor.remove')}
          </button>
        </div>
      ))}
      <button type="button" className={btnGhost} onClick={() => onChange([...settings, createSetting()])}>
        + {t('editor.addSetting')}
      </button>
    </div>
  )
}
