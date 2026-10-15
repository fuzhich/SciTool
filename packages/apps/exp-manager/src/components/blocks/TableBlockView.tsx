import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TableBlock, TableSheet } from '../../lib/expdoc'
import { btnGhost } from '../ui'
import { InlineCaption } from './InlineCaption'

const ROW_LIMIT = 20
const NUMERIC = /^-?\d+(\.\d+)?$/

// 表格模块（顶会排版）：表注在上方（Table n. 自动编号 + 无缝内联编辑），
// 多表文件显示表标签页（默认第一个，可切换）；格子统一、数值右对齐、
// 表头 sticky、大表折叠。
export function TableBlockView({
  block,
  tableNo,
  onChange
}: {
  block: TableBlock
  tableNo: number
  onChange: (next: TableBlock) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const sheetIndex = Math.min(Math.max(0, block.activeSheet), block.sheets.length - 1)
  const sheet: TableSheet = block.sheets[sheetIndex] ?? { name: '', columns: [], rows: [] }
  const truncated = sheet.rows.length > ROW_LIMIT
  const rows = expanded ? sheet.rows : sheet.rows.slice(0, ROW_LIMIT)

  const patchSheet = (next: TableSheet): void => {
    onChange({ ...block, sheets: block.sheets.map((s, i) => (i === sheetIndex ? next : s)) })
  }
  const patchCell = (rowIdx: number, colId: string, value: string): void => {
    patchSheet({ ...sheet, rows: sheet.rows.map((r, i) => (i === rowIdx ? { ...r, [colId]: value } : r)) })
  }
  const patchColumnName = (colId: string, name: string): void => {
    patchSheet({ ...sheet, columns: sheet.columns.map((c) => (c.id === colId ? { ...c, name } : c)) })
  }
  const addRow = (): void => {
    const row: Record<string, string> = {}
    for (const c of sheet.columns) row[c.id] = ''
    patchSheet({ ...sheet, rows: [...sheet.rows, row] })
  }
  const removeRow = (idx: number): void => {
    patchSheet({ ...sheet, rows: sheet.rows.filter((_, i) => i !== idx) })
  }
  const isNumeric = (v: string): boolean => NUMERIC.test(v.trim())

  return (
    <div className="my-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
        <div className="flex min-w-0 flex-1 items-baseline gap-1">
          <span className="shrink-0 text-[12.5px] font-semibold text-zinc-700 dark:text-zinc-200">
            Table {tableNo}.
          </span>
          <InlineCaption
            value={block.name}
            onChange={(name) => onChange({ ...block, name })}
            className="min-w-0 flex-1 text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400"
          />
          <span className="shrink-0 text-[11px] text-zinc-400 dark:text-zinc-500">
            {t('table.rowCount', { count: sheet.rows.length })}
          </span>
        </div>
        <div className="flex shrink-0 gap-1">
          {truncated && (
            <button type="button" className={btnGhost} onClick={() => setExpanded((v) => !v)}>
              {expanded ? t('table.collapse') : t('table.expand')}
            </button>
          )}
          <button type="button" className={btnGhost} onClick={addRow}>
            + {t('doc.addRow')}
          </button>
        </div>
      </div>

      {block.sheets.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-zinc-200 px-2 py-1 dark:border-zinc-800">
          {block.sheets.map((s, i) => (
            <button
              key={i}
              type="button"
              className={`shrink-0 rounded-md px-2.5 py-1 text-[12px] transition-colors ${
                i === sheetIndex
                  ? 'bg-blue-50 font-medium text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
              title={s.name}
              onClick={() => onChange({ ...block, activeSheet: i })}
            >
              {s.name || `${t('doc.sheet')} ${i + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="max-h-96 overflow-auto">
        <table className="min-w-full text-[12.5px]">
          <thead className="sticky top-0 z-10">
            <tr>
              {sheet.columns.map((c) => (
                <th
                  key={c.id}
                  className="whitespace-nowrap border-b border-zinc-200 bg-zinc-100 px-3 py-2 text-left font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                >
                  <InlineCaption value={c.name} onChange={(name) => patchColumnName(c.id, name)} className="min-w-8" />
                  {c.unit && <span className="ml-1 text-[11px] font-normal text-zinc-400 dark:text-zinc-500">({c.unit})</span>}
                </th>
              ))}
              <th className="w-10 border-b border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-b border-zinc-100 last:border-0 hover:bg-blue-50/40 dark:border-zinc-800/60 dark:hover:bg-blue-950/20"
              >
                {sheet.columns.map((c) => (
                  <td key={c.id} className="p-0">
                    <input
                      className={`h-8 w-full min-w-28 border-0 bg-transparent px-3 text-[12.5px] tabular-nums outline-none focus:bg-blue-50/60 dark:focus:bg-blue-950/30 ${
                        isNumeric(row[c.id] ?? '') ? 'text-right' : 'text-left'
                      }`}
                      value={row[c.id] ?? ''}
                      onChange={(e) => patchCell(i, c.id, e.target.value)}
                    />
                  </td>
                ))}
                <td className="p-0 text-right">
                  <button
                    type="button"
                    className="rounded px-1.5 py-0.5 text-[12px] text-zinc-300 hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-950/40"
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
