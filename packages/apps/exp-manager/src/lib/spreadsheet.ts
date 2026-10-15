import * as XLSX from 'xlsx'
import type { ExpColumn } from './expdoc'

export interface ParsedTable {
  columns: ExpColumn[]
  rows: Record<string, string>[]
}

// 统一转换：二维字符串数组 → 列（表头）+ 行（按列 id 键值）
function rowsToTable(rows: string[][]): ParsedTable {
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
  return rowsToTable(rows)
}

// xlsx/xls 解析：取第一个工作表，sheet_to_json header:1 得到二维数组
export function parseXlsx(buffer: ArrayBuffer): ParsedTable {
  const wb = XLSX.read(buffer, { type: 'array' })
  const ws = wb.Sheets[wb.SheetNames[0]]
  if (!ws) return { columns: [], rows: [] }
  const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as unknown[][]
  const rows = matrix.map((r) => r.map((cell) => String(cell ?? '')))
  return rowsToTable(rows)
}
