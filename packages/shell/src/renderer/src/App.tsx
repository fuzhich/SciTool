import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AppRecord } from '@scitool/sdk'
import i18n from './i18n'
import { useAppStore } from './stores/app-store'
import { Button } from './components/ui/button'
import { Card } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { SettingsModal } from './components/settings-modal'

function AppIcon({ app }: { app: AppRecord }): React.JSX.Element {
  if (app.icon) {
    return (
      <img
        src={`scitool-app://${app.id}/${app.icon}`}
        alt=""
        className="h-10 w-10 rounded-xl object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }
  const initial = (app.name.zh || app.name.en || '?').slice(0, 1).toUpperCase()
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-base font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
      {initial}
    </div>
  )
}

function AppCard({ app }: { app: AppRecord }): React.JSX.Element {
  const { t, i18n: i18nInst } = useTranslation()
  const [busy, setBusy] = useState(false)

  const name = i18nInst.language === 'en' ? app.name.en : app.name.zh
  const desc = i18nInst.language === 'en' ? app.description.en : app.description.zh

  const onLaunch = async (): Promise<void> => {
    setBusy(true)
    const res = await window.api.apps.launch(app.id)
    setBusy(false)
    if (!res.ok) alert(`${t('errors.launch')}: ${res.error}`)
  }

  const onUninstall = async (): Promise<void> => {
    if (!window.confirm(t('confirmUninstall', { name }))) return
    setBusy(true)
    const res = await window.api.apps.uninstall(app.id)
    setBusy(false)
    if (!res.ok) alert(`${t('errors.uninstall')}: ${res.error}`)
  }

  const onCheckUpdate = async (): Promise<void> => {
    setBusy(true)
    const res = await window.api.updates.checkApp(app.id)
    setBusy(false)
    if (!res.ok) {
      alert(`${t('appUpdateFailed')}: ${res.error}`)
      return
    }
    const result = res.data as { updated: boolean; from: string; to?: string; reason?: string }
    if (result.updated) {
      alert(t('appUpdated', { name, version: result.to }))
    } else if (result.to) {
      alert(t('appUpdateNone', { name }))
    } else {
      alert(`${t('appUpdateNone', { name })}（${result.reason}）`)
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between">
        <AppIcon app={app} />
        <Badge>v{app.version}</Badge>
      </div>
      <div className="min-h-0">
        <h3 className="truncate text-[15px] font-semibold text-zinc-900 dark:text-zinc-100">{name}</h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">{desc}</p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-1">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{app.id}</span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" disabled={busy} onClick={onCheckUpdate}>
            {t('appUpdateCheck')}
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={onUninstall}>
            {t('uninstall')}
          </Button>
          <Button size="sm" disabled={busy} onClick={onLaunch}>
            {t('launch')}
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function App(): React.JSX.Element {
  const { t } = useTranslation()
  const { apps, settings, loading, load, refreshApps, updateSettings } = useAppStore()
  const [installing, setInstalling] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    return window.api.onAppsChanged(() => {
      void refreshApps()
    })
  }, [refreshApps])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
  }, [settings.theme])

  const onInstall = async (): Promise<void> => {
    setInstalling(true)
    try {
      const picked = await window.api.apps.pickZip()
      if (!picked.ok || !picked.data) return
      const res = await window.api.apps.install(picked.data)
      if (!res.ok) {
        alert(`${t('errors.install')}: ${res.error}`)
        return
      }
      const name = settings.language === 'en' && res.data ? res.data.name.en : res.data?.name.zh
      alert(t('installSuccess', { name: name ?? '' }))
    } finally {
      setInstalling(false)
    }
  }

  const toggleLanguage = async (): Promise<void> => {
    const next = settings.language === 'zh' ? 'en' : 'zh'
    await i18n.changeLanguage(next)
    await updateSettings({ language: next })
  }

  const toggleTheme = async (): Promise<void> => {
    await updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="sticky top-0 z-10 border-b border-zinc-200/80 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              S
            </div>
            <div>
              <span className="text-[15px] font-semibold">{t('appName')}</span>
              <span className="ml-2 text-[13px] text-zinc-400 dark:text-zinc-500">{t('slogan')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={toggleLanguage}>
              {settings.language === 'zh' ? 'EN' : '中文'}
            </Button>
            <Button size="sm" variant="ghost" onClick={toggleTheme} title={t('theme')}>
              {settings.theme === 'dark' ? '☀️' : '🌙'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
              {t('settings')}
            </Button>
            <Button size="sm" disabled={installing} onClick={onInstall}>
              {installing ? '…' : t('install')}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            {t('appCount', { count: apps.length })}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-44 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              />
            ))}
          </div>
        ) : apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-28 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-2xl dark:bg-zinc-800">
              📦
            </div>
            <h3 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-200">{t('emptyTitle')}</h3>
            <p className="max-w-sm text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">{t('emptyDesc')}</p>
            <Button className="mt-2" disabled={installing} onClick={onInstall}>
              {t('install')}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-200/80 py-4 text-center text-[11px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
        SciTool Platform · SDK 0.2.0 · M3
      </footer>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
