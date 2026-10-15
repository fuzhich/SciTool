import { useEffect, useRef, useState } from 'react'
import { marked } from 'marked'
import { useTranslation } from 'react-i18next'
import type { TextBlock } from '../../lib/expdoc'

export function TextBlockView({
  block,
  onChange
}: {
  block: TextBlock
  onChange: (content: string) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) taRef.current?.focus()
  }, [editing])

  if (editing) {
    return (
      <textarea
        ref={taRef}
        className="min-h-24 w-full resize-y rounded-lg border border-blue-400 bg-white px-3 py-2 text-[13px] leading-5 text-zinc-900 outline-none dark:bg-zinc-950 dark:text-zinc-100"
        value={block.content}
        placeholder={t('doc.textPlaceholder')}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setEditing(false)}
      />
    )
  }

  const html = marked.parse(block.content || '')
  return (
    <div
      className="min-h-8 cursor-text rounded-lg px-3 py-2 transition-colors hover:bg-zinc-100/70 dark:hover:bg-zinc-800/40"
      onClick={() => setEditing(true)}
    >
      {block.content ? (
        <div className="markdown-body text-[13px] leading-6 text-zinc-800 dark:text-zinc-200" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <p className="text-[13px] text-zinc-300 dark:text-zinc-600">{t('doc.textPlaceholder')}</p>
      )}
    </div>
  )
}
