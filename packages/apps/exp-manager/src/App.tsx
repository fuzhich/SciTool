import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import i18n from './i18n'
import { getSdk } from './lib/sdk'
import { ExpRepo } from './lib/repo/exp-repo'
import { HomePage } from './pages/HomePage'
import { EditorPage } from './pages/EditorPage'

type View = { name: 'home' } | { name: 'editor'; docId: string }

export default function App(): React.JSX.Element {
  const { t } = useTranslation()
  const [sdk, setSdk] = useState<Sdk | null>(null)
  const [booted, setBooted] = useState(false)
  const [view, setView] = useState<View>({ name: 'home' })
  const isMock = import.meta.env.DEV && !window.sdk
  const repo = useMemo(() => (sdk ? new ExpRepo(sdk) : null), [sdk])

  useEffect(() => {
    const sdkInstance = getSdk()
    setSdk(sdkInstance)
    void (async () => {
      try {
        if (sdkInstance) {
          const [langRes, settingsRes] = await Promise.all([
            sdkInstance.settings.getLanguage(),
            sdkInstance.settings.get()
          ])
          if (langRes.ok && langRes.data) await i18n.changeLanguage(langRes.data)
          if (settingsRes.ok && settingsRes.data) {
            document.documentElement.classList.toggle('dark', settingsRes.data.theme === 'dark')
          }
        }
      } finally {
        setBooted(true)
      }
    })()
  }, [])

  return (
    <div className="flex h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {isMock && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-1.5 text-center text-[12px] text-amber-700 dark:border-amber-950 dark:bg-amber-950/40 dark:text-amber-400">
          {t('app.mockBanner')}
        </div>
      )}
      {!isMock && booted && !sdk && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-1.5 text-center text-[12px] text-red-700 dark:border-red-950 dark:bg-red-950/40 dark:text-red-400">
          {t('app.sdkMissing')}
        </div>
      )}
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-[13px] font-bold text-white">
                E
              </div>
              <div>
                <span className="text-[14px] font-semibold">{t('app.name')}</span>
                <span className="ml-2 text-[12px] text-zinc-400 dark:text-zinc-500">{t('app.tagline')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 dark:text-zinc-500">
              {sdk && <span className="max-w-40 truncate">{sdk.appId}</span>}
              {isMock && <span className="text-amber-500">{t('app.mockBadge')}</span>}
            </div>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          {booted && repo ? (
            view.name === 'home' ? (
              <HomePage repo={repo} onOpen={(docId) => setView({ name: 'editor', docId })} />
            ) : (
              <EditorPage repo={repo} docId={view.docId} onBack={() => setView({ name: 'home' })} />
            )
          ) : null}
        </main>
      </div>
    </div>
  )
}
