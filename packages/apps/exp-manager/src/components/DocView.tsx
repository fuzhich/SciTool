import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExpBlock } from '../lib/expdoc'
import { MAX_IMAGE_BYTES, createImageBlock, createTableBlock, createTextBlock } from '../lib/expdoc'
import { parseCsv } from '../lib/csv'
import { btnGhost } from './ui'
import { TextBlockView } from './blocks/TextBlockView'
import { TableBlockView } from './blocks/TableBlockView'
import { ImageBlockView } from './blocks/ImageBlockView'

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
  const insertTextAfter = (index: number): void => {
    const next = [...blocks]
    next.splice(index + 1, 0, createTextBlock())
    onChange(next)
  }

  const onDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files ?? [])
    if (files.length === 0) return
    let index = blocks.length
    for (let i = 0; i < blockRefs.current.length; i++) {
      const el = blockRefs.current[i]
      if (el) {
        const rect = el.getBoundingClientRect()
        if (e.clientY < rect.top + rect.height / 2) {
          index = i
          break
        }
      }
    }
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
        } else if (f.name.toLowerCase().endsWith('.csv')) {
          const text = await f.text()
          const parsed = parseCsv(text)
          if (parsed.columns.length === 0) {
            setMessage(t('doc.imageInvalid'))
            continue
          }
          created.push(createTableBlock(f.name.replace(/\.csv$/i, ''), parsed.columns, parsed.rows))
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

  return (
    <div
      className={`min-h-full flex-1 px-16 py-8 ${dragging ? 'bg-blue-50/60 dark:bg-blue-950/20' : ''}`}
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
        <div className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 py-16 text-center dark:border-zinc-800">
          <div className="text-2xl">📄</div>
          <p className="text-[12.5px] text-zinc-400 dark:text-zinc-500">{t('doc.dropHint')}</p>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-2">
          {blocks.map((block, i) => (
            <div
              key={block.id}
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
                <button type="button" className={menuCls} title={t('doc.insertTextAfter')} onClick={() => insertTextAfter(i)}>
                  ＋
                </button>
                <button type="button" className={menuCls} title={t('doc.deleteBlock')} onClick={() => removeBlock(i)}>
                  ✕
                </button>
              </div>
              {block.kind === 'text' && <TextBlockView block={block} onChange={(content) => patchBlock(i, { ...block, content })} />}
              {block.kind === 'table' && (
                <TableBlockView block={block} onChange={(next) => patchBlock(i, next)} />
              )}
              {block.kind === 'image' && (
                <ImageBlockView block={block} onChange={(next) => patchBlock(i, next)} />
              )}
            </div>
          ))}
          <button type="button" className={`${btnGhost} w-full`} onClick={() => onChange([...blocks, createTextBlock()])}>
            {t('doc.addTextEnd')}
          </button>
        </div>
      )}
      {message && <p className="mt-3 text-center text-[12px] text-red-500 dark:text-red-400">{message}</p>}
    </div>
  )
}
