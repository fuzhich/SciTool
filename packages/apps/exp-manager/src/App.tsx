import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import i18n from './i18n'
import { getSdk } from './lib/sdk'
import { ExpRepo } from './lib/repo/exp-repo'
import { WorkspacePage } from './pages/WorkspacePage'

export default function App(): React.JSX.Element {
  const { t } = useTranslation()
  const [sdk, setSdk] = useState<Sdk | null>(null)
  const [booted, setBooted] = useState(false)
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
          // 默认全屏（SDK 0.4.0；旧平台无此能力则跳过）
          if (sdkInstance.ui.maximize) {
            void sdkInstance.ui.maximize()
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
      {booted && sdk && repo ? <WorkspacePage sdk={sdk} repo={repo} /> : null}
    </div>
  )
}
