import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import type { PageKey } from '../App'

const NAV: { key: PageKey; labelKey: string; icon: string }[] = [
  { key: 'overview', labelKey: 'nav.overview', icon: '📘' },
  { key: 'quickstart', labelKey: 'nav.quickstart', icon: '🚀' },
  { key: 'playground', labelKey: 'nav.playground', icon: '🧪' },
  { key: 'manifest', labelKey: 'nav.manifest', icon: '📋' },
  { key: 'prompt', labelKey: 'nav.prompt', icon: '🤖' }
]

export function Sidebar({
  page,
  onNavigate,
  sdk,
  isMock
}: {
  page: PageKey
  onNavigate: (p: PageKey) => void
  sdk: Sdk | null
  isMock: boolean
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2.5 px-4 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          S
        </div>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold">{t('app.name')}</div>
          <div className="truncate text-[11px] text-zinc-400 dark:text-zinc-500">{t('app.tagline')}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-2">
        {NAV.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors ${
              page === item.key
                ? 'bg-blue-50 font-medium text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            <span className="text-[13px]">{item.icon}</span>
            {t(item.labelKey)}
          </button>
        ))}
      </nav>
      <div className="border-t border-zinc-200 px-4 py-3 text-[11px] leading-4 text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
        <div className="truncate" title={sdk?.appId}>
          {sdk?.appId ?? '—'}
        </div>
        <div>
          SDK v{sdk?.version ?? '—'}
          {isMock && <span className="ml-1 text-amber-500">{t('app.mockBadge')}</span>}
        </div>
      </div>
    </aside>
  )
}
