import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import i18n from './i18n'
import { getSdk } from './lib/sdk'
import { Sidebar } from './components/Sidebar'
import { OverviewPage } from './pages/OverviewPage'
import { QuickStartPage } from './pages/QuickStartPage'
import { SdkPlaygroundPage } from './pages/SdkPlaygroundPage'
import { ManifestPage } from './pages/ManifestPage'
import { ExportPromptPage } from './pages/ExportPromptPage'

export type PageKey = 'overview' | 'quickstart' | 'playground' | 'manifest' | 'prompt'

export default function App(): React.JSX.Element {
  const { t } = useTranslation()
  const [page, setPage] = useState<PageKey>('overview')
  const [sdk, setSdk] = useState<Sdk | null>(null)
  const [booted, setBooted] = useState(false)
  const isMock = import.meta.env.DEV && !window.sdk

  // 启动：读取平台语言与主题，适配 UI（语言切换 + 暗色 class）
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
      <div className="flex min-h-0 flex-1">
        <Sidebar page={page} onNavigate={setPage} sdk={sdk} isMock={isMock} />
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-8 py-8">
            {page === 'overview' && <OverviewPage />}
            {page === 'quickstart' && <QuickStartPage />}
            {page === 'playground' && <SdkPlaygroundPage sdk={sdk} />}
            {page === 'manifest' && <ManifestPage />}
            {page === 'prompt' && <ExportPromptPage sdk={sdk} />}
          </div>
        </main>
      </div>
    </div>
  )
}
