import { useTranslation } from 'react-i18next'
import type { ImageBlock } from '../../lib/expdoc'
import { inputCls } from '../ui'

export function ImageBlockView({
  block,
  onChange
}: {
  block: ImageBlock
  onChange: (next: ImageBlock) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <img
        src={`data:${block.mimeType};base64,${block.dataBase64}`}
        alt={block.caption || block.name}
        className="max-h-96 w-full rounded-md object-contain"
      />
      <input
        className={`${inputCls} mt-2 w-full`}
        placeholder={t('doc.imageCaption')}
        value={block.caption}
        onChange={(e) => onChange({ ...block, caption: e.target.value })}
      />
    </div>
  )
}
