import { useTranslation } from 'react-i18next'
import type { ExpBlock } from '../lib/expdoc'
import { createResultBlock } from '../lib/expdoc'
import { btnDanger, btnGhost, inputCls } from './ui'
import { MarkdownField } from './MarkdownField'

export function ResultsEditor({
  results,
  onChange
}: {
  results: ExpBlock[]
  onChange: (next: ExpBlock[]) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const patch = (id: string, field: keyof ExpBlock, value: string): void => {
    onChange(results.map((b) => (b.id === id ? { ...b, [field]: value } : b)))
  }
  return (
    <div className="space-y-3">
      {results.length === 0 && <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500">—</p>}
      {results.map((b) => (
        <div key={b.id} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <div className="mb-2 flex items-center justify-between gap-2">
            <input
              className={`${inputCls} min-w-0 flex-1`}
              placeholder={t('editor.resultTitle')}
              value={b.title}
              onChange={(e) => patch(b.id, 'title', e.target.value)}
            />
            <button type="button" className={btnDanger} onClick={() => onChange(results.filter((x) => x.id !== b.id))}>
              {t('editor.remove')}
            </button>
          </div>
          <MarkdownField value={b.content} onChange={(v) => patch(b.id, 'content', v)} />
        </div>
      ))}
      <button type="button" className={btnGhost} onClick={() => onChange([...results, createResultBlock()])}>
        + {t('editor.addResult')}
      </button>
    </div>
  )
}
