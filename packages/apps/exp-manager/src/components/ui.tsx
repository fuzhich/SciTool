import type { ReactNode } from 'react'

export function Card({
  children,
  className = ''
}: {
  children: ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      {children}
    </div>
  )
}

export function SectionCard({
  title,
  actions,
  children
}: {
  title: string
  actions?: ReactNode
  children: ReactNode
}): React.JSX.Element {
  return (
    <Card className="mb-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        {actions}
      </div>
      {children}
    </Card>
  )
}

export function Badge({
  children,
  tone = 'blue'
}: {
  children: ReactNode
  tone?: 'blue' | 'zinc' | 'green' | 'red' | 'amber'
}): React.JSX.Element {
  const tones = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    zinc: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
  }
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Field({
  label,
  children
}: {
  label: string
  children: ReactNode
}): React.JSX.Element {
  return (
    <label className="flex flex-col gap-1 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
      {label}
      {children}
    </label>
  )
}

export const inputCls =
  'rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[13px] text-zinc-900 outline-none focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

export const textareaCls = `${inputCls} resize-y leading-5`

export const btnPrimary =
  'rounded-lg bg-blue-600 px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50'

export const btnGhost =
  'rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-300 dark:hover:bg-zinc-800'

export const btnDanger =
  'rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-red-950/40'
