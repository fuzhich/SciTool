import { useTranslation } from 'react-i18next'
import type { ExpTable } from '../lib/expdoc'
import { createColumn } from '../lib/expdoc'
import { btnDanger, btnGhost, inputCls } from './ui'

export function TableEditor({
  table,
  onChange
}: {
  table: ExpTable
  onChange: (next: ExpTable) => void
}): React.JSX.Element {
  const { t } = useTranslation()

  const patchColumn = (id: string, field: 'name' | 'unit', value: string): void => {
    onChange({ ...table, columns: table.columns.map((c) => (c.id === id ? { ...c, [field]: value } : c)) })
  }
  const patchCell = (rowIdx: number, colId: string, value: string): void => {
    const rows = table.rows.map((r, i) => (i === rowIdx ? { ...r, [colId]: value } : r))
    onChange({ ...table, rows })
  }
  const addColumn = (): void => {
    onChange({ ...table, columns: [...table.columns, createColumn()] })
  }
  const removeColumn = (id: string): void => {
    const rows = table.rows.map((r) => {
      const next = { ...r }
      delete next[id]
      return next
    })
    onChange({ ...table, columns: table.columns.filter((c) => c.id !== id), rows })
  }
  const addRow = (): void => {
    const row: Record<string, string> = {}
    for (const c of table.columns) row[c.id] = ''
    onChange({ ...table, rows: [...table.rows, row] })
  }
  const removeRow = (idx: number): void => {
    onChange({ ...table, rows: table.rows.filter((_, i) => i !== idx) })
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <input
          className={`${inputCls} w-56 border-transparent bg-transparent font-medium focus:border-blue-400`}
          placeholder={t('editor.tableName')}
          value={table.name}
          onChange={(e) => onChange({ ...table, name: e.target.value })}
        />
        <div className="flex gap-1">
          <button type="button" className={btnGhost} onClick={addColumn}>
            + {t('editor.addColumn')}
          </button>
          <button type="button" className={btnGhost} onClick={addRow}>
            + {t('editor.addRow')}
          </button>
        </div>
      </div>
      {table.columns.length === 0 ? (
        <p className="px-3 py-6 text-center text-[12.5px] text-zinc-400 dark:text-zinc-500">
          {t('editor.emptyTable')}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr>
                {table.columns.map((c) => (
                  <th key={c.id} className="border-b border-zinc-200 px-2 py-1.5 text-left dark:border-zinc-800">
                    <div className="flex items-center gap-1">
                      <input
                        className={`${inputCls} w-28 border-transparent bg-transparent font-medium focus:border-blue-400`}
                        placeholder={t('editor.colName')}
                        value={c.name}
                        onChange={(e) => patchColumn(c.id, 'name', e.target.value)}
                      />
                      <input
                        className={`${inputCls} w-14 border-transparent bg-transparent text-zinc-400 focus:border-blue-400`}
                        placeholder={t('editor.colUnit')}
                        value={c.unit}
                        onChange={(e) => patchColumn(c.id, 'unit', e.target.value)}
                      />
                      <button type="button" className={btnDanger} onClick={() => removeColumn(c.id)}>
                        ×
                      </button>
                    </div>
                  </th>
                ))}
                <th className="w-10 border-b border-zinc-200 dark:border-zinc-800" />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, i) => (
                <tr key={i} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                  {table.columns.map((c) => (
                    <td key={c.id} className="px-2 py-1">
                      <input
                        className={`${inputCls} w-full border-transparent bg-transparent focus:border-blue-400`}
                        value={row[c.id] ?? ''}
                        onChange={(e) => patchCell(i, c.id, e.target.value)}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1 text-right">
                    <button type="button" className={btnDanger} title={t('editor.delRow')} onClick={() => removeRow(i)}>
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
