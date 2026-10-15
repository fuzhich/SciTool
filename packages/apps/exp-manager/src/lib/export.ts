import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import type { Sdk } from '@scitool/sdk'
import type { ExpDoc, ImageBlock, TableSheet } from './expdoc'
import { serializeDoc } from './expdoc'

// 导出引擎：表格/图片数据内嵌于 expdoc，与原文件完全独立。
// - 元素导出：表格 → CSV（UTF-8 BOM，Excel 兼容）；图片 → 原图二进制
// - 整体导出：zip（tables/*.csv + figures/* 原图 + experiment.md 对应关系 + expdoc.json）

const sanitize = (s: string): string => s.replace(/[\\/:*?"<>|]/g, '_').slice(0, 80) || 'untitled'

function sheetToCsv(sheet: TableSheet): string {
  const esc = (v: string): string => {
    if (/[",\r\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`
    return v
  }
  const lines: string[] = []
  lines.push(sheet.columns.map((c) => esc(c.name)).join(','))
  for (const r of sheet.rows) {
    lines.push(sheet.columns.map((c) => esc(r[c.id] ?? '')).join(','))
  }
  // BOM + CRLF：Excel 中文兼容
  return '﻿' + lines.join('\r\n')
}

function imageExt(img: ImageBlock): string {
  const sub = img.mimeType.split('/')[1]?.toLowerCase() ?? ''
  return sub === 'png' ? 'png' : sub === 'gif' ? 'gif' : sub === 'webp' ? 'webp' : 'jpg'
}

export async function exportCsv(sdk: Sdk, sheet: TableSheet, baseName: string): Promise<{ path: string } | null> {
  const res = await sdk.ui.saveFile({
    defaultFileName: `${sanitize(baseName)}.csv`,
    dataBase64: Buffer.from(sheetToCsv(sheet), 'utf-8').toString('base64'),
    filters: [{ name: 'CSV', extensions: ['csv'] }]
  })
  return res.ok ? (res.data ?? null) : null
}

function sheetToAoa(sheet: TableSheet): unknown[][] {
  return [sheet.columns.map((c) => c.name), ...sheet.rows.map((r) => sheet.columns.map((c) => r[c.id] ?? ''))]
}

export async function exportXlsx(sdk: Sdk, sheet: TableSheet, baseName: string): Promise<{ path: string } | null> {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(sheetToAoa(sheet))
  XLSX.utils.book_append_sheet(wb, ws, sheet.name || 'Sheet1')
  const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' })
  const res = await sdk.ui.saveFile({
    defaultFileName: `${sanitize(baseName)}.xlsx`,
    dataBase64: base64,
    filters: [{ name: 'Excel', extensions: ['xlsx'] }]
  })
  return res.ok ? (res.data ?? null) : null
}

export async function exportImage(sdk: Sdk, img: ImageBlock, baseName: string): Promise<{ path: string } | null> {
  const ext = imageExt(img)
  const res = await sdk.ui.saveFile({
    defaultFileName: `${sanitize(baseName)}.${ext}`,
    dataBase64: img.dataBase64,
    filters: [{ name: '图片', extensions: [ext] }]
  })
  return res.ok ? (res.data ?? null) : null
}

export async function exportDocZip(sdk: Sdk, doc: ExpDoc): Promise<{ path: string } | null> {
  const zip = new JSZip()
  const tables = zip.folder('tables')!
  const figures = zip.folder('figures')!

  const md: string[] = []
  md.push(`# ${doc.meta.title || '实验记录'}`)
  if (doc.meta.type) md.push(`类型：${doc.meta.type}`)
  if (doc.meta.settings.length > 0) {
    md.push('', '## 实验设置')
    for (const s of doc.meta.settings) {
      md.push(`- ${s.name}：${s.value}${s.unit ? ` ${s.unit}` : ''}`)
    }
  }
  if (doc.meta.notes) md.push('', '## 备注', doc.meta.notes)
  md.push('', '## 文件对应关系')

  let tableNo = 0
  let figureNo = 0
  for (const b of doc.blocks) {
    if (b.kind === 'table') {
      tableNo++
      const wb = XLSX.utils.book_new()
      b.sheets.forEach((sheet, i) => {
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(sheetToAoa(sheet)), (sheet.name || `Sheet${i + 1}`).slice(0, 31))
      })
      const xlsxName = `Table${tableNo}-${sanitize(b.name || `表${tableNo}`)}.xlsx`
      tables.file(xlsxName, XLSX.write(wb, { type: 'base64', bookType: 'xlsx' }), { base64: true })
      b.sheets.forEach((sheet, i) => {
        const label = b.sheets.length > 1 ? `表${i + 1}（${sheet.name || '未命名'}）` : ''
        const name = `Table${tableNo}-${sanitize(sheet.name || `表${i + 1}`)}.csv`
        tables.file(name, sheetToCsv(sheet))
        md.push(`- Table ${tableNo}${label ? ` ${label}` : ''}${b.name ? `（${b.name}）` : ''} → tables/${name}（整表 Excel 见 ${xlsxName}）`)
      })
    } else if (b.kind === 'image') {
      figureNo++
      const ext = imageExt(b)
      const name = `Figure${figureNo}-${sanitize(b.name || `图${figureNo}`)}.${ext}`
      figures.file(name, b.dataBase64, { base64: true })
      md.push(`- Figure ${figureNo}${b.caption ? `（${b.caption}）` : ''} → figures/${name}`)
    } else if (b.content.trim()) {
      md.push('', b.content)
    }
  }

  zip.file('experiment.md', md.join('\n\n'))
  zip.file('experiment.expdoc.json', serializeDoc(doc))
  const base64 = await zip.generateAsync({ type: 'base64' })
  const res = await sdk.ui.saveFile({
    defaultFileName: `${sanitize(doc.meta.title || 'experiment')}-export.zip`,
    dataBase64: base64,
    filters: [{ name: 'ZIP', extensions: ['zip'] }]
  })
  return res.ok ? (res.data ?? null) : null
}
