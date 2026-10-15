import * as XLSX from 'xlsx'
import type { ExpColumn, TableSheet } from './expdoc'

export interface ParsedTable {
  sheets: TableSheet[]
}

// 统一转换：二维字符串数组 → 列（表头）+ 行（按列 id 键值）
function rowsToColumns(rows: string[][]): { columns: ExpColumn[]; rows: Record<string, string>[] } {
  const nonEmpty = rows.filter((r) => !(r.length === 1 && r[0] === ''))
  if (nonEmpty.length === 0) return { columns: [], rows: [] }
  const header = nonEmpty[0]
  const columns: ExpColumn[] = header.map((h, i) => ({
    id: `col-${i}`,
    name: h || `列${i + 1}`,
    unit: ''
  }))
  const dataRows = nonEmpty.slice(1).map((r) => {
    const obj: Record<string, string> = {}
    columns.forEach((c, i) => {
      obj[c.id] = r[i] ?? ''
    })
    return obj
  })
  return { columns, rows: dataRows }
}

// 小型 CSV 状态机解析器：支持双引号包裹字段（含逗号/换行）、"" 转义、\r\n 与 \n。
// CSV 无多表概念，产出单 sheet。
export function parseCsv(text: string): ParsedTable {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  const pushField = (): void => {
    row.push(field)
    field = ''
  }
  const pushRow = (): void => {
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      pushField()
    } else if (ch === '\n') {
      pushField()
      pushRow()
    } else if (ch === '\r') {
      // \r\n 由 \n 处理，独立 \r 忽略
    } else {
      field += ch
    }
  }
  if (field !== '' || row.length > 0) {
    pushField()
    pushRow()
  }
  const { columns, rows: dataRows } = rowsToColumns(rows)
  return { sheets: [{ name: '', columns, rows: dataRows }] }
}

// xlsx/xls 解析：全部工作表（跳过空表），默认展示第一个
export function parseXlsx(buffer: ArrayBuffer): ParsedTable {
  const wb = XLSX.read(buffer, { type: 'array' })
  const sheets: TableSheet[] = []
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]
    if (!ws) continue
    const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][]
    const rows = matrix.map((r) => r.map((cell) => String(cell ?? '')))
    const { columns, rows: dataRows } = rowsToColumns(rows)
    if (columns.length === 0) continue
    sheets.push({ name, columns, rows: dataRows })
  }
  return { sheets }
}
