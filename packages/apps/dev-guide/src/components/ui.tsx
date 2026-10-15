import type { ReactNode } from 'react'

export interface OutputLine {
  text: string
  ok?: boolean
}

export function PageTitle({ title, desc }: { title: string; desc?: string }): React.JSX.Element {
  return (
    <div className="mb-8">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {desc && <p className="mt-2 max-w-2xl text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">{desc}</p>}
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }): React.JSX.Element {
  return <h2 className="mb-3 mt-8 text-[15px] font-semibold first:mt-0">{children}</h2>
}

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

export function Badge({
  children,
  tone = 'blue'
}: {
  children: ReactNode
  tone?: 'blue' | 'zinc' | 'green' | 'amber'
}): React.JSX.Element {
  const tones = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
    zinc: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
  }
  return (
    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Output({ lines }: { lines: OutputLine[] }): React.JSX.Element | null {
  if (lines.length === 0) return null
  return (
    <div className="mt-3 max-h-56 overflow-y-auto rounded-lg bg-zinc-100 p-3 font-mono text-[12px] leading-5 dark:bg-zinc-800/60">
      {lines.map((l, i) => (
        <div
          key={i}
          className={
            l.ok === undefined
              ? 'text-zinc-500 dark:text-zinc-400'
              : l.ok
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-500 dark:text-red-400'
          }
        >
          {l.text}
        </div>
      ))}
    </div>
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

export const btnCls = 'rounded-lg bg-blue-600 px-3 py-1.5 text-[12.5px] font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50'
