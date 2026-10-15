import { useTranslation } from 'react-i18next'
import type { TableBlock } from '../../lib/expdoc'
import { btnGhost, inputCls } from '../ui'

export function TableBlockView({
  block,
  onChange
}: {
  block: TableBlock
  onChange: (next: TableBlock) => void
}): React.JSX.Element {
  const { t } = useTranslation()

  const patchCell = (rowIdx: number, colId: string, value: string): void => {
    const rows = block.rows.map((r, i) => (i === rowIdx ? { ...r, [colId]: value } : r))
    onChange({ ...block, rows })
  }
  const addRow = (): void => {
    const row: Record<string, string> = {}
    for (const c of block.columns) row[c.id] = ''
    onChange({ ...block, rows: [...block.rows, row] })
  }
  const removeRow = (idx: number): void => {
    onChange({ ...block, rows: block.rows.filter((_, i) => i !== idx) })
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-1.5 dark:border-zinc-800">
        <input
          className={`${inputCls} w-56 border-transparent bg-transparent text-[13px] font-medium focus:border-blue-400`}
          placeholder={t('doc.tableUntitled')}
          value={block.name}
          onChange={(e) => onChange({ ...block, name: e.target.value })}
        />
        <button type="button" className={btnGhost} onClick={addRow}>
          + {t('doc.addRow')}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr>
              {block.columns.map((c) => (
                <th
                  key={c.id}
                  className="border-b border-zinc-200 bg-zinc-50 px-3 py-1.5 text-left font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-300"
                >
                  {c.name}
                  {c.unit && <span className="ml-1 text-[11px] font-normal text-zinc-400">({c.unit})</span>}
                </th>
              ))}
              <th className="w-10 border-b border-zinc-200 dark:border-zinc-800" />
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, i) => (
              <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                {block.columns.map((c) => (
                  <td key={c.id} className="px-1.5 py-0.5">
                    <input
                      className={`${inputCls} w-full border-transparent bg-transparent focus:border-blue-400`}
                      value={row[c.id] ?? ''}
                      onChange={(e) => patchCell(i, c.id, e.target.value)}
                    />
                  </td>
                ))}
                <td className="px-1.5 py-0.5 text-right">
                  <button
                    type="button"
                    className="rounded px-1.5 text-[12px] text-zinc-300 hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-950/40"
                    title={t('doc.delRow')}
                    onClick={() => removeRow(i)}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
