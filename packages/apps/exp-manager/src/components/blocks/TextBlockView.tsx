import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import type { TextBlock } from '../../lib/expdoc'

const autoResize = (ta: HTMLTextAreaElement): void => {
  ta.style.height = 'auto'
  ta.style.height = `${Math.max(ta.scrollHeight, 28)}px`
}

// 无缝内联编辑（类 Typora）：无边框透明自动伸缩 textarea，视觉上即在
// 渲染页面上直接打字；失焦渲染 markdown。textarea 受控，无
// contentEditable 的换行/光标怪癖；Enter 新建下方文本块。
export function TextBlockView({
  block,
  initialEditing = false,
  onChange,
  onEnterNewBlock
}: {
  block: TextBlock
  initialEditing?: boolean
  onChange: (content: string) => void
  onEnterNewBlock?: () => void
}): React.JSX.Element {
  const [editing, setEditing] = useState(initialEditing)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && taRef.current) {
      const ta = taRef.current
      ta.focus()
      ta.setSelectionRange(ta.value.length, ta.value.length)
      autoResize(ta)
    }
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
          }
        }}
        className="w-full resize-none overflow-hidden border-0 bg-transparent px-3 py-1 text-[13px] leading-6 text-zinc-800 outline-none dark:text-zinc-200"
        style={{ minHeight: 28 }}
      />
    )
  }

  const html = marked.parse(block.content || '')
  return (
    <div
      className="min-h-6 cursor-text rounded px-3 py-1 transition-colors hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40"
      onClick={() => setEditing(true)}
    >
      {block.content && (
        <div
          className="markdown-body text-[13px] leading-6 text-zinc-800 dark:text-zinc-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  )
}
