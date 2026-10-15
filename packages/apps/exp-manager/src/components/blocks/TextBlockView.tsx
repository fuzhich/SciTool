import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import { useTranslation } from 'react-i18next'
import type { TextBlock } from '../../lib/expdoc'

// 无缝内联编辑（类 Typora）：编辑态无边框无底色，直接在渲染页面上打字；
// 失焦后渲染 markdown。contentEditable 非受控（挂载时写入内容一次），
// 避免 React 重渲染重置光标。
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
  const { t } = useTranslation()
  const [editing, setEditing] = useState(initialEditing)
  const editRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.innerText = block.content
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(editRef.current)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
      editRef.current.focus()
    }
    // 仅在进入编辑态时同步一次内容；输入过程由 onInput 单向向上传递
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing])

  if (editing) {
    return (
      <div
        ref={editRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={t('doc.textPlaceholder')}
        className="min-h-[1.7em] w-full cursor-text whitespace-pre-wrap break-words px-3 py-1 text-[13px] leading-6 text-zinc-800 outline-none dark:text-zinc-200"
        onInput={(e) => onChange(e.currentTarget.innerText ?? '')}
        onBlur={() => setEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onEnterNewBlock?.()
          } else if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault()
            document.execCommand('insertLineBreak')
          }
        }}
      />
    )
  }

  const html = marked.parse(block.content || '')
  return (
    <div
      className="min-h-8 cursor-text rounded px-3 py-1 transition-colors hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40"
      onClick={() => setEditing(true)}
    >
      {block.content ? (
        <div
          className="markdown-body text-[13px] leading-6 text-zinc-800 dark:text-zinc-200"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <p className="text-[13px] text-zinc-300 dark:text-zinc-600">{t('doc.textPlaceholder')}</p>
      )}
    </div>
  )
}
