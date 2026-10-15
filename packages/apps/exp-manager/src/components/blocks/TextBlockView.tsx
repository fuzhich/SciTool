import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import type { TextBlock } from '../../lib/expdoc'

const autoResize = (ta: HTMLTextAreaElement): void => {
  ta.style.height = 'auto'
  ta.style.height = `${Math.max(ta.scrollHeight, 26)}px`
}

// 无缝内联编辑（类 Typora）：无边框透明自动伸缩 textarea，视觉上即在
// 渲染页面上直接打字；失焦渲染 markdown。Enter 新建下方块；
// 空块按退格 → 删除本块并回到上一行末尾。
export function TextBlockView({
  block,
  initialEditing = false,
  focusEndSignal = false,
  onChange,
  onEnterNewBlock,
  onBackspaceEmpty,
  onFocusEndDone
}: {
  block: TextBlock
  initialEditing?: boolean
  focusEndSignal?: boolean
  onChange: (content: string) => void
  onEnterNewBlock?: () => void
  onBackspaceEmpty?: () => void
  onFocusEndDone?: () => void
}): React.JSX.Element {
  const [editing, setEditing] = useState(initialEditing)
  const taRef = useRef<HTMLTextAreaElement>(null)

  // 外部请求（退格合并）：进入编辑并把光标置于末尾
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
      }
      autoResize(ta)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

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
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onEnterNewBlock?.()
          } else if (e.key === 'Backspace' && e.currentTarget.value === '') {
            e.preventDefault()
            onBackspaceEmpty?.()
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
      className="min-h-6 cursor-text rounded px-3 py-0.5 transition-colors hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40"
      onClick={() => setEditing(true)}
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
