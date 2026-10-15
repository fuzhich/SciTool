import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import type { TextBlock } from '../../lib/expdoc'

// 常驻透明 textarea + 底层渲染 markdown：
// 光标行为完全原生（Word 式点击定位/选择/拖动），文字视觉来自渲染层。
// 两层必须同字体/字号/行高/换行规则 —— 渲染层在 .doc-overlay 上下文内
// 归零段落边距、标题等字号、取消两端对齐，保证行对齐。
export function TextBlockView({
  block,
  focusSignal = false,
  onChange,
  onEnterNewBlock,
  onBackspaceEmpty,
  onBackspaceStart,
  onDeleteEnd,
  onFocusDone
}: {
  block: TextBlock
  focusSignal?: boolean
  onChange: (content: string) => void
  onEnterNewBlock?: () => void
  onBackspaceEmpty?: () => void
  onBackspaceStart?: () => void
  onDeleteEnd?: () => void
  onFocusDone?: () => void
}): React.JSX.Element {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [taHeight, setTaHeight] = useState(26)

  const resize = (): void => {
    const ta = taRef.current
    if (!ta) return
    ta.style.height = 'auto'
    const h = Math.max(ta.scrollHeight, 26)
    ta.style.height = `${h}px`
    setTaHeight(h)
  }

  useEffect(() => {
    resize()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.content])

  useEffect(() => {
    if (focusSignal && taRef.current) {
      const ta = taRef.current
      ta.focus()
      ta.setSelectionRange(ta.value.length, ta.value.length)
      onFocusDone?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusSignal])

  const html = marked.parse(block.content || '')

  return (
    <div className="relative" style={{ minHeight: taHeight }}>
      <div aria-hidden className="doc-overlay pointer-events-none px-3 py-0.5">
        {block.content ? (
          <div
            className="doc-serif markdown-body text-zinc-800 dark:text-zinc-200"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <div className="doc-serif">&nbsp;</div>
        )}
      </div>
      <textarea
        ref={taRef}
        value={block.content}
        onChange={(e) => onChange(e.target.value)}
        onInput={resize}
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
        className="doc-serif absolute inset-0 h-full w-full resize-none overflow-hidden border-0 bg-transparent px-3 py-0.5 text-transparent caret-blue-600 outline-none dark:caret-blue-400"
      />
    </div>
  )
}
