import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExpBlock, ImageBlock, TableSheet } from '../lib/expdoc'
import { MAX_IMAGE_BYTES, createImageBlock, createTableBlock, createTextBlock } from '../lib/expdoc'
import { parseCsv, parseXlsx } from '../lib/spreadsheet'
import { TextBlockView } from './blocks/TextBlockView'
import { TableBlockView } from './blocks/TableBlockView'
import { ImageBlockView } from './blocks/ImageBlockView'

const SPREADSHEET_EXT = /\.(csv|xlsx|xls)$/i

export function DocView({
  blocks,
  onChange,
  onExportTable,
  onExportImage
}: {
  blocks: ExpBlock[]
  onChange: (next: ExpBlock[]) => void
  onExportTable?: (sheet: TableSheet, tableNo: number, blockName: string, sheetIndex: number, sheetName: string, format: 'csv' | 'xlsx') => void
  onExportImage?: (img: ImageBlock, figureNo: number) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])
  const [dragging, setDragging] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [autoEditId, setAutoEditId] = useState<string | null>(null)
  const [focusEndId, setFocusEndId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const patchBlock = (index: number, next: ExpBlock): void => {
    onChange(blocks.map((b, i) => (i === index ? next : b)))
  }
  const moveBlock = (index: number, dir: -1 | 1): void => {
    const target = index + dir
    if (target < 0 || target >= blocks.length) return
    const next = [...blocks]
    const [b] = next.splice(index, 1)
    next.splice(target, 0, b)
    onChange(next)
  }
  const removeBlock = (index: number): void => {
    onChange(blocks.filter((_, i) => i !== index))
  }

  // 空行退格：删除本块，光标回到上一个文本块末尾（否则聚焦下一个文本块）
  const onBackspaceEmpty = (index: number): void => {
    const prev = blocks[index - 1]
    const next = blocks[index + 1]
    onChange(blocks.filter((_, i) => i !== index))
    if (prev?.kind === 'text') setFocusEndId(prev.id)
    else if (next?.kind === 'text') setFocusEndId(next.id)
  }

  // 跨行删除：行首退格 → 本块内容并入上一文本块末尾
  const mergeWithPrev = (index: number): void => {
    const prev = blocks[index - 1]
    const cur = blocks[index]
    if (!prev || prev.kind !== 'text' || cur.kind !== 'text') return
    const next = [...blocks]
    next[index - 1] = { ...prev, content: prev.content + cur.content }
    next.splice(index, 1)
    onChange(next)
    setFocusEndId(prev.id)
  }

  // 跨行删除：行尾 Delete → 下一文本块内容并入本块末尾
  const mergeWithNext = (index: number): void => {
    const cur = blocks[index]
    const nxt = blocks[index + 1]
    if (!nxt || nxt.kind !== 'text' || cur.kind !== 'text') return
    const next = [...blocks]
    next[index] = { ...cur, content: cur.content + nxt.content }
    next.splice(index + 1, 1)
    onChange(next)
    setFocusEndId(cur.id)
  }

  // 选中表格/图片块后按 Backspace/Delete 删除（焦点不在输入控件时）
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (!selectedId) return
      const t = e.target as HTMLElement | null
      if (t && t.closest('textarea, input, [contenteditable]')) return
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault()
        const idx = blocks.findIndex((b) => b.id === selectedId)
        if (idx >= 0) {
          onChange(blocks.filter((_, i) => i !== idx))
          setSelectedId(null)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedId, blocks, onChange])

  // Word 式点击空白：光标落到「上方最近块」之后继续输入（空白区域归属其上方内容，与 Word 一致）
  // - 上方是文本块 → 进入其编辑态且光标置末尾
  // - 上方是表格/图片 → 在其后新建文本块并聚焦；若其后已是空文本块则复用聚焦（不产生重复空行）
  // - 点击在第一块上方 / 空文档 → 从开头新建文本块并聚焦
  const onDocClick = (e: React.MouseEvent): void => {
    const target = e.target as HTMLElement
    if (target.closest('[data-block]')) return
    setSelectedId(null)
    let aboveIdx = -1
    let aboveBottom = -Infinity
    blockRefs.current.forEach((el, i) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.bottom <= e.clientY && rect.bottom > aboveBottom) {
        aboveBottom = rect.bottom
        aboveIdx = i
      }
    })

    if (aboveIdx === -1) {
      const block = createTextBlock()
      onChange([block, ...blocks])
      setAutoEditId(block.id)
      return
    }
    const above = blocks[aboveIdx]
    if (above.kind === 'text') {
      setFocusEndId(above.id)
      return
    }
    const nextBlock = blocks[aboveIdx + 1]
    if (nextBlock?.kind === 'text' && nextBlock.content === '') {
      setAutoEditId(nextBlock.id)
      return
    }
    const block = createTextBlock()
    const next = [...blocks]
    next.splice(aboveIdx + 1, 0, block)
    onChange(next)
    setAutoEditId(block.id)
  }

  // 依据鼠标 Y 坐标计算插入位置（块中点比较，拖拽用）
  const indexAt = (clientY: number): number => {
    for (let i = 0; i < blockRefs.current.length; i++) {
      const el = blockRefs.current[i]
      if (el) {
        const rect = el.getBoundingClientRect()
        if (clientY < rect.top + rect.height / 2) return i
      }
    }
    return blocks.length
  }

  const onDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files ?? [])
    if (files.length === 0) return
    const index = indexAt(e.clientY)
    void (async () => {
      const created: ExpBlock[] = []
      for (const f of files) {
        if (f.type.startsWith('image/')) {
          if (f.size > MAX_IMAGE_BYTES) {
            setMessage(t('doc.imageTooBig'))
            continue
          }
          const dataBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve((reader.result as string).split(',')[1] ?? '')
            reader.onerror = () => reject(reader.error)
            reader.readAsDataURL(f)
          })
          created.push(createImageBlock(f.name.replace(/\.[^.]+$/, ''), f.type || 'image/png', dataBase64))
        } else if (SPREADSHEET_EXT.test(f.name)) {
          const parsed = f.name.toLowerCase().endsWith('.csv')
            ? parseCsv(await f.text())
            : parseXlsx(await f.arrayBuffer())
          if (parsed.sheets.length === 0) {
            setMessage(t('doc.tableEmpty'))
            continue
          }
          created.push(createTableBlock(f.name.replace(SPREADSHEET_EXT, ''), parsed.sheets))
        } else {
          setMessage(t('doc.imageInvalid'))
        }
      }
      if (created.length > 0) {
        const next = [...blocks]
        next.splice(index, 0, ...created)
        // 图片/表格落为最后一块时自动补空文本块：其后始终有输入位（Typora 式）
        const last = next[next.length - 1]
        if (last && last.kind !== 'text') {
          next.push(createTextBlock())
        }
        onChange(next)
        setMessage(null)
      }
    })()
  }

  const menuCls =
    'rounded px-1.5 py-0.5 text-[11.5px] text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200'

  // 按文档顺序自动编号 Figure/Table
  const numbers: { kind: 'figure' | 'table'; no: number }[] = []
  let tableNo = 0
  let figureNo = 0
  for (const b of blocks) {
    if (b.kind === 'table') {
      tableNo++
      numbers.push({ kind: 'table', no: tableNo })
    } else if (b.kind === 'image') {
      figureNo++
      numbers.push({ kind: 'figure', no: figureNo })
    } else {
      numbers.push({ kind: 'figure', no: 0 })
    }
  }

  return (
    <div
      className={`min-h-full flex-1 cursor-text bg-zinc-200/70 px-16 py-8 dark:bg-zinc-950 ${
        dragging ? 'bg-blue-100/70 dark:bg-blue-950/40' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
      onDrop={onDrop}
      onClick={onDocClick}
    >
      {blocks.length === 0 ? (
        <div className="mx-auto flex min-h-[65vh] w-full max-w-[1400px] items-center justify-center rounded-lg border border-zinc-200 bg-white px-10 py-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="pointer-events-none flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
            <div className="text-2xl">📄</div>
            <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500">{t('doc.dropHint')}</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto min-h-[65vh] w-full max-w-[1400px] rounded-lg border border-zinc-200 bg-white px-10 py-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {blocks.map((block, i) => {
            const selected = block.id === selectedId
            return (
              <div
                key={block.id}
                data-block
                ref={(el) => {
                  blockRefs.current[i] = el
                }}
                className={`group relative ${selected ? 'rounded-lg ring-2 ring-blue-400/70' : ''}`}
                onClick={(ev) => {
                  if (block.kind === 'text') return
                  ev.stopPropagation()
                  setSelectedId(selected ? null : block.id)
                }}
              >
                <div className="absolute -top-2.5 right-2 z-10 hidden gap-0.5 rounded-md border border-zinc-200 bg-white px-0.5 py-0.5 shadow-sm group-hover:flex dark:border-zinc-700 dark:bg-zinc-800">
                  <button type="button" className={menuCls} title={t('doc.moveUp')} onClick={() => moveBlock(i, -1)}>
                    ↑
                  </button>
                  <button type="button" className={menuCls} title={t('doc.moveDown')} onClick={() => moveBlock(i, 1)}>
                    ↓
                  </button>
                  <button
                    type="button"
                    className={menuCls}
                    title={t('doc.deleteBlock')}
                    onClick={() => {
                      removeBlock(i)
                      setSelectedId(null)
                    }}
                  >
                    ✕
                  </button>
                </div>
                {block.kind === 'text' && (
                  <TextBlockView
                    block={block}
                    focusSignal={block.id === autoEditId || block.id === focusEndId}
                    onChange={(content) => patchBlock(i, { ...block, content })}
                    onEnterNewBlock={() => {
                      const nb = createTextBlock()
                      const next = [...blocks]
                      next.splice(i + 1, 0, nb)
                      onChange(next)
                      setAutoEditId(nb.id)
                    }}
                    onBackspaceEmpty={() => onBackspaceEmpty(i)}
                    onBackspaceStart={() => mergeWithPrev(i)}
                    onDeleteEnd={() => mergeWithNext(i)}
                    onFocusDone={() => {
                      setAutoEditId(null)
                      setFocusEndId(null)
                    }}
                  />
                )}
                {block.kind === 'table' && (
                  <TableBlockView
                    block={block}
                    tableNo={numbers[i].no}
                    onChange={(next) => patchBlock(i, next)}
                    onExportCsv={(sheet, sheetIndex) =>
                      onExportTable?.(sheet, numbers[i].no, block.name, sheetIndex, sheet.name, 'csv')
                    }
                    onExportXlsx={(sheet, sheetIndex) =>
                      onExportTable?.(sheet, numbers[i].no, block.name, sheetIndex, sheet.name, 'xlsx')
                    }
                  />
                )}
                {block.kind === 'image' && (
                  <ImageBlockView
                    block={block}
                    figureNo={numbers[i].no}
                    onChange={(next) => patchBlock(i, next)}
                    onExportImage={() => onExportImage?.(block, numbers[i].no)}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
      {message && <p className="mt-3 text-center text-[12px] text-red-500 dark:text-red-400">{message}</p>}
    </div>
  )
}
