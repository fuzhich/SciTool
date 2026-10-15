import { useState } from 'react'
import { marked } from 'marked'
import { useTranslation } from 'react-i18next'
import { btnGhost, textareaCls } from './ui'

export function MarkdownField({
  value,
  onChange,
  placeholder
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}): React.JSX.Element {
  const { t } = useTranslation()
  const [preview, setPreview] = useState(false)
  return (
    <div>
      <div className="mb-1.5 flex justify-end">
        <button type="button" className={btnGhost} onClick={() => setPreview((p) => !p)}>
          {preview ? t('md.edit') : t('md.preview')}
        </button>
      </div>
      {preview ? (
        <div
          className="markdown-body min-h-20 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] leading-5 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
          dangerouslySetInnerHTML={{ __html: marked.parse(value || '*（空）*') }}
        />
      ) : (
        <textarea
          className={`${textareaCls} min-h-20 w-full`}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}
