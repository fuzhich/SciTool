import type { ImageBlock } from '../../lib/expdoc'
import { InlineCaption } from './InlineCaption'

// 图片模块（顶会排版）：图片居中 + 图注在下方居中（小号灰字），自动编号 Figure n.
export function ImageBlockView({
  block,
  figureNo,
  onChange
}: {
  block: ImageBlock
  figureNo: number
  onChange: (next: ImageBlock) => void
}): React.JSX.Element {
  return (
    <div className="my-2.5 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <img
        src={`data:${block.mimeType};base64,${block.dataBase64}`}
        alt={block.caption}
        className="mx-auto max-h-96 rounded-md object-contain"
      />
      <div className="mt-2.5 flex items-baseline justify-center gap-1 px-2">
        <span className="shrink-0 text-[12px] font-semibold text-zinc-700 dark:text-zinc-200">
          Figure {figureNo}.
        </span>
        <InlineCaption
          value={block.caption}
          onChange={(caption) => onChange({ ...block, caption })}
          className="text-center text-[12px] leading-5 text-zinc-500 dark:text-zinc-400"
        />
      </div>
    </div>
  )
}
