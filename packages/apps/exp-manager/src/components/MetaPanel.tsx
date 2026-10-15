import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ExpMeta } from '../lib/expdoc'
import { Field, inputCls } from './ui'
import { MarkdownField } from './MarkdownField'
import { SettingsEditor } from './SettingsEditor'

const POS_KEY = 'scitool-metapanel-pos'

// 实验信息悬浮面板：默认顶部居中，可拖拽（拖到哪停在哪，位置持久化），可折叠。
export function MetaPanel({
  meta,
  createdAt,
  updatedAt,
  onChange
}: {
  meta: ExpMeta
  createdAt: string
  updatedAt: string
  onChange: (patch: Partial<ExpMeta>) => void
}): React.JSX.Element | null {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    const parent = panelRef.current?.parentElement
    const clamp = (p: { x: number; y: number }): { x: number; y: number } => {
      if (!parent) return p
      const pr = parent.getBoundingClientRect()
      return {
        x: Math.min(Math.max(8, p.x), Math.max(8, pr.width - 320 - 8)),
        y: Math.min(Math.max(8, p.y), Math.max(8, pr.height - 400 - 8))
      }
    }
    const saved = localStorage.getItem(POS_KEY)
    if (saved) {
      try {
        setPos(clamp(JSON.parse(saved) as { x: number; y: number }))
        return
      } catch {
        // 忽略损坏数据，走默认居中
      }
    }
    if (parent) {
      setPos({ x: Math.max(8, Math.round((parent.clientWidth - 320) / 2)), y: 16 })
    }
  }, [])

  useEffect(() => {
    const onMove = (e: PointerEvent): void => {
      const d = dragState.current
      const parent = panelRef.current?.parentElement
      if (!d || !parent) return
      const pr = parent.getBoundingClientRect()
      const w = panelRef.current?.offsetWidth ?? 320
      const h = panelRef.current?.offsetHeight ?? 400
      const x = Math.min(Math.max(8, d.ox + e.clientX - d.sx), Math.max(8, pr.width - w - 8))
      const y = Math.min(Math.max(8, d.oy + e.clientY - d.sy), Math.max(8, pr.height - h - 8))
      setPos({ x, y })
    }
    const onUp = (): void => {
      if (dragState.current) {
        dragState.current = null
        if (panelRef.current) {
          localStorage.setItem(
            POS_KEY,
            JSON.stringify({ x: panelRef.current.offsetLeft, y: panelRef.current.offsetTop })
          )
        }
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  const onDragStart = (e: React.PointerEvent): void => {
    if (!pos) return
    e.preventDefault()
    dragState.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y }
  }

  const fmt = (iso: string): string => {
    const d = new Date(iso)
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleString()
  }

  if (!pos) {
    // 屏外占位：让 ref 挂载以测量父容器（首次渲染直接 return null 会导致 ref 为 null、位置永远算不出来）
    return <div ref={panelRef} className="fixed" style={{ left: -9999, top: -9999, width: 320 }} />
  }
  const style = { left: pos.x, top: pos.y }

  if (collapsed) {
    return (
      <div ref={panelRef} className="absolute z-20" style={style}>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white/95 px-3 py-2 text-[12.5px] font-medium text-zinc-700 shadow-md backdrop-blur hover:bg-white dark:border-zinc-600 dark:bg-zinc-800/95 dark:text-zinc-200 dark:hover:bg-zinc-800"
          title={t('panel.expand')}
          onClick={() => setCollapsed(false)}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded bg-blue-600 text-[10px] font-bold text-white">
            i
          </span>
          {t('panel.expand')}
          <span className="text-[10px] text-zinc-400">▸</span>
        </button>
      </div>
    )
  }

  return (
    <div
      ref={panelRef}
      className="absolute z-20 w-80 rounded-xl border border-zinc-200 bg-white/95 shadow-lg backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95"
      style={style}
    >
      <div
        className="flex cursor-move select-none items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800"
        onPointerDown={onDragStart}
      >
        <h3 className="text-[13px] font-semibold">ℹ️ {t('panel.expand')}</h3>
        <button
          type="button"
          className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-300 text-[13px] font-bold leading-none text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          title={t('panel.collapse')}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setCollapsed(true)}
        >
          —
        </button>
      </div>
      <div className="max-h-[calc(100vh-16rem)] space-y-3 overflow-y-auto p-4">
        <div className="space-y-2">
          <Field label={t('panel.fieldTitle')}>
            <input className={inputCls} value={meta.title} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label={t('panel.fieldType')}>
            <input
              className={inputCls}
              placeholder={t('panel.typeHint')}
              value={meta.type}
              onChange={(e) => onChange({ type: e.target.value })}
            />
          </Field>
        </div>
        <div>
          <h4 className="mb-1.5 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">{t('panel.settings')}</h4>
          <SettingsEditor settings={meta.settings} onChange={(settings) => onChange({ settings })} />
        </div>
        <div>
          <h4 className="mb-1.5 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">{t('panel.notes')}</h4>
          <MarkdownField value={meta.notes} placeholder={t('panel.notesPlaceholder')} onChange={(notes) => onChange({ notes })} />
        </div>
        <div className="border-t border-zinc-100 pt-2 text-[11px] leading-4 text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          <div>
            {t('panel.created')}: {fmt(createdAt)}
          </div>
          <div>
            {t('panel.updated')}: {fmt(updatedAt)}
          </div>
        </div>
      </div>
    </div>
  )
}
