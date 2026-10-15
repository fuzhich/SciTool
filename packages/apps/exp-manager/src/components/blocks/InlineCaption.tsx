import { useEffect, useRef } from 'react'

// 无缝内联图注/表注编辑：无输入框，光标落上直接改字（纯文本，无 markdown）。
// 非受控：挂载时写入内容一次，输入单向向上传递，避免 React 重置光标。
export function InlineCaption({
  value,
  onChange,
  className = ''
}: {
  value: string
  onChange: (v: string) => void
  className?: string
}): React.JSX.Element {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.textContent = value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={`min-w-4 cursor-text whitespace-pre-wrap break-words outline-none ${className}`}
      onInput={(e) => onChange(e.currentTarget.textContent ?? '')}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
    />
  )
}
