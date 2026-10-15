import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExpBlock } from '../lib/expdoc'
import { MAX_IMAGE_BYTES, createImageBlock, createTableBlock, createTextBlock } from '../lib/expdoc'
import { parseCsv, parseXlsx } from '../lib/spreadsheet'
import { TextBlockView } from './blocks/TextBlockView'
import { TableBlockView } from './blocks/TableBlockView'
import { ImageBlockView } from './blocks/ImageBlockView'

const SPREADSHEET_EXT = /\.(csv|xlsx|xls)$/i

export function DocView({
  blocks,
  onChange
}: {
  blocks: ExpBlock[]
  onChange: (next: ExpBlock[]) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const blockRefs = useRef<(HTMLDivElement | null)[]>([])
  const [dragging, setDragging] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [autoEditId, setAutoEditId] = useState<string | null>(null)
  const [focusEndId, setFocusEndId] = useState<string | null>(null)

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

  // 依据鼠标 Y 坐标计算插入位置（块中点比较）
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

  // 点击空白处：光标落到最近块的末尾继续输入。
  // - 最近的块是文本块 → 进入其编辑态且光标置末尾
  // - 最近的块是表格/图片 → 在其后新建文本块并聚焦
  // - 空文档 → 从开头新建文本块并聚焦
  // 点击位置距某块 12px 以内视为点击该块本身（由其自身处理），忽略。
  const onDocClick = (e: React.MouseEvent): void => {
    const target = e.target as HTMLElement
    if (target.closest('[data-block]')) return
    const MARGIN = 12
    let nearestIdx = -1
    let nearestDist = Infinity
    blockRefs.current.forEach((el, i) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (e.clientY >= rect.top - MARGIN && e.clientY <= rect.bottom + MARGIN) {
        nearestIdx = i
        nearestDist = -1
        return
      }
      const dist = Math.abs(e.clientY - (rect.top + rect.height / 2))
      if (dist < nearestDist) {
        nearestDist = dist
        nearestIdx = i
      }
    })
    if (nearestDist === -1) return

    if (nearestIdx === -1) {
      // 空文档：从开头开始
      const block = createTextBlock()
      onChange([...blocks, block])
      setAutoEditId(block.id)
      return
    }
    const nearest = blocks[nearestIdx]
    if (nearest.kind === 'text') {
      setFocusEndId(nearest.id)
    } else {
      const block = createTextBlock()
      const next = [...blocks]
      next.splice(nearestIdx + 1, 0, block)
      onChange(next)
      setAutoEditId(block.id)
    }
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
          if (parsed.columns.length === 0) {
            setMessage(t('doc.tableEmpty'))
            continue
          }
          created.push(createTableBlock(f.name.replace(SPREADSHEET_EXT, ''), parsed.columns, parsed.rows))
        } else {
          setMessage(t('doc.imageInvalid'))
        }
      }
      if (created.length > 0) {
        const next = [...blocks]
        next.splice(index, 0, ...created)
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
      className={`min-h-full flex-1 cursor-text px-16 py-8 ${dragging ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragging(false)
      }}
      onDrop={onDrop}
    >
      {blocks.length === 0 ? (
        <div className="mx-auto w-full max-w-[1400px]" onClick={onDocClick}>
          <div className="pointer-events-none flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
            <div className="text-2xl">📄</div>
            <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500">{t('doc.dropHint')}</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1400px]" onClick={onDocClick}>
          {blocks.map((block, i) => (
            <div
              key={block.id}
              data-block
              ref={(el) => {
                blockRefs.current[i] = el
              }}
              className="group relative"
            >
              <div className="absolute -top-2.5 right-2 z-10 hidden gap-0.5 rounded-md border border-zinc-200 bg-white px-0.5 py-0.5 shadow-sm group-hover:flex dark:border-zinc-700 dark:bg-zinc-800">
                <button type="button" className={menuCls} title={t('doc.moveUp')} onClick={() => moveBlock(i, -1)}>
                  ↑
                </button>
                <button type="button" className={menuCls} title={t('doc.moveDown')} onClick={() => moveBlock(i, 1)}>
                  ↓
                </button>
                <button type="button" className={menuCls} title={t('doc.deleteBlock')} onClick={() => removeBlock(i)}>
                  ✕
                </button>
              </div>
              {block.kind === 'text' && (
                <TextBlockView
                  block={block}
                  initialEditing={block.id === autoEditId}
                  focusEndSignal={block.id === focusEndId}
                  onChange={(content) => patchBlock(i, { ...block, content })}
                  onEnterNewBlock={() => {
                    const nb = createTextBlock()
                    const next = [...blocks]
                    next.splice(i + 1, 0, nb)
                    onChange(next)
                    setAutoEditId(nb.id)
                  }}
                  onBackspaceEmpty={() => onBackspaceEmpty(i)}
                  onFocusEndDone={() => setFocusEndId(null)}
                />
              )}
              {block.kind === 'table' && (
                <TableBlockView block={block} tableNo={numbers[i].no} onChange={(next) => patchBlock(i, next)} />
              )}
              {block.kind === 'image' && (
                <ImageBlockView block={block} figureNo={numbers[i].no} onChange={(next) => patchBlock(i, next)} />
              )}
            </div>
          ))}
        </div>
      )}
      {message && <p className="mt-3 text-center text-[12px] text-red-500 dark:text-red-400">{message}</p>}
    </div>
  )
}
