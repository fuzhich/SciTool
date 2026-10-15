import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import type { TextBlock } from '../../lib/expdoc'

const autoResize = (ta: HTMLTextAreaElement): void => {
  ta.style.height = 'auto'
  ta.style.height = `${Math.max(ta.scrollHeight, 26)}px`
}

// 无缝内联编辑（类 Typora/Word）：
// - 点击进入编辑：用 caretRangeFromPoint 把点击位置映射为字符偏移（纯文本精确）
// - Enter 新建下方块；空块退格删除并回上一行末尾；行首退格并入上一行（跨行删除）；行尾 Delete 并入下一行
export function TextBlockView({
  block,
  initialEditing = false,
  focusEndSignal = false,
  onChange,
  onEnterNewBlock,
  onBackspaceEmpty,
  onBackspaceStart,
  onDeleteEnd,
  onFocusEndDone
}: {
  block: TextBlock
  initialEditing?: boolean
  focusEndSignal?: boolean
  onChange: (content: string) => void
  onEnterNewBlock?: () => void
  onBackspaceEmpty?: () => void
  onBackspaceStart?: () => void
  onDeleteEnd?: () => void
  onFocusEndDone?: () => void
}): React.JSX.Element {
  const [editing, setEditing] = useState(initialEditing)
  const [caretAt, setCaretAt] = useState<number | null>(null)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const renderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (focusEndSignal) setEditing(true)
  }, [focusEndSignal])

  useEffect(() => {
    if (editing && taRef.current) {
      const ta = taRef.current
      ta.focus()
      if (focusEndSignal) {
        ta.setSelectionRange(ta.value.length, ta.value.length)
        onFocusEndDone?.()
      } else if (caretAt !== null) {
        const pos = Math.min(caretAt, ta.value.length)
        ta.setSelectionRange(pos, pos)
        setCaretAt(null)
      }
      autoResize(ta)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  // Word 式点击定位：把点击坐标映射为渲染文本偏移，再按比例映射回原文
  const startEditingAtClick = (e: React.MouseEvent): void => {
    let offset = block.content.length
    const doc = document as unknown as { caretRangeFromPoint?: (x: number, y: number) => Range | null }
    const range = doc.caretRangeFromPoint?.(e.clientX, e.clientY)
    if (range && renderRef.current && renderRef.current.contains(range.startContainer)) {
      const pre = document.createRange()
      pre.selectNodeContents(renderRef.current)
      pre.setEnd(range.startContainer, range.startOffset)
      const total = renderRef.current.innerText?.length ?? 1
      offset = Math.round((pre.toString().length / Math.max(1, total)) * block.content.length)
    }
    setCaretAt(offset)
    setEditing(true)
  }

  if (editing) {
    return (
      <textarea
        ref={taRef}
        value={block.content}
        onChange={(e) => {
          onChange(e.target.value)
          autoResize(e.target)
        }}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          const ta = e.currentTarget
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onEnterNewBlock?.()
          } else if (e.key === 'Backspace' && ta.value === '') {
            e.preventDefault()
            onBackspaceEmpty?.()
          } else if (e.key === 'Backspace' && ta.selectionStart === 0 && ta.selectionEnd === 0) {
            e.preventDefault()
            onBackspaceStart?.()
          } else if (
            e.key === 'Delete' &&
            ta.selectionStart === ta.selectionEnd &&
            ta.selectionStart === ta.value.length
          ) {
            e.preventDefault()
            onDeleteEnd?.()
          }
        }}
        className="doc-serif w-full resize-none overflow-hidden border-0 bg-transparent px-3 py-0.5 text-zinc-800 outline-none dark:text-zinc-200"
        style={{ minHeight: 26 }}
      />
    )
  }

  const html = marked.parse(block.content || '')
  return (
    <div
      ref={renderRef}
      className="min-h-6 cursor-text rounded px-3 py-0.5 transition-colors hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40"
      onClick={startEditingAtClick}
    >
      {block.content && (
        <div
          className="doc-serif markdown-body text-zinc-800 dark:text-zinc-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  )
}
