import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AppRecord } from '@scitool/sdk'
import i18n from './i18n'
import { useAppStore } from './stores/app-store'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { SettingsModal } from './components/settings-modal'

function AppIcon({ app, size = 'md' }: { app: AppRecord; size?: 'md' | 'lg' }): React.JSX.Element {
  const cls = size === 'lg' ? 'h-16 w-16 rounded-2xl text-2xl' : 'h-12 w-12 rounded-xl text-lg'
  if (app.icon) {
    return (
      <img
        src={`scitool-app://${app.id}/${app.icon}`}
        alt=""
        className={`${cls} object-cover`}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />
    )
  }
  const initial = (app.name.zh || app.name.en || '?').slice(0, 1).toUpperCase()
  return (
    <div
      className={`flex items-center justify-center bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 ${cls}`}
    >
      {initial}
    </div>
  )
}

function fmtDate(iso: string): string {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? iso
    : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 极简磁贴：仅图标 + 名称；单击选中（右侧出详情栏），双击启动
function AppTile({
  app,
  selected,
  onSelect,
  onLaunch
}: {
  app: AppRecord
  selected: boolean
  onSelect: (id: string) => void
  onLaunch: (app: AppRecord) => void
}): React.JSX.Element {
  const { i18n: i18nInst } = useTranslation()
  const name = i18nInst.language === 'en' ? app.name.en : app.name.zh
  return (
    <button
      type="button"
      className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors ${
        selected
          ? 'border-blue-400 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40'
          : 'border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
      }`}
      onClick={() => onSelect(app.id)}
      onDoubleClick={() => onLaunch(app)}
    >
      <AppIcon app={app} />
      <span className="w-full truncate text-center text-[12.5px] font-medium">{name}</span>
    </button>
  )
}

// 右侧详情侧栏：单击磁贴后出现
function DetailPanel({
  app,
  onClose,
  onLaunch,
  onUninstall,
  onCheckUpdate
}: {
  app: AppRecord
  onClose: () => void
  onLaunch: (app: AppRecord) => Promise<void>
  onUninstall: (app: AppRecord) => Promise<void>
  onCheckUpdate: (app: AppRecord) => Promise<void>
}): React.JSX.Element {
  const { t, i18n: i18nInst } = useTranslation()
  const [busy, setBusy] = useState(false)

  const name = i18nInst.language === 'en' ? app.name.en : app.name.zh
  const desc = i18nInst.language === 'en' ? app.description.en : app.description.zh

  const withBusy = (fn: (app: AppRecord) => Promise<void>): (() => void) => {
    return () => {
      setBusy(true)
      void fn(app).finally(() => setBusy(false))
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-[13px] font-semibold">{t('details')}</h2>
        <button
          type="button"
          className="rounded-md px-1.5 py-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          title={t('close')}
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex flex-col items-center gap-2.5 py-2 text-center">
          <AppIcon app={app} size="lg" />
          <div>
            <div className="text-[15px] font-semibold">{name}</div>
            <div className="mt-1.5">
              <Badge>v{app.version}</Badge>
            </div>
          </div>
        </div>
        {desc && <p className="text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{desc}</p>}
        {app.permissions.length > 0 && (
          <div>
            <div className="mb-1.5 text-[11.5px] font-medium text-zinc-400 dark:text-zinc-500">{t('permissions')}</div>
            <div className="flex flex-wrap gap-1">
              {app.permissions.map((p) => (
                <Badge key={p}>{p}</Badge>
              ))}
            </div>
          </div>
        )}
        <div className="text-[11.5px] leading-4 text-zinc-400 dark:text-zinc-500">
          <div className="truncate" title={app.id}>
            {app.id}
          </div>
          <div className="mt-0.5">
            {t('installedAt')}: {fmtDate(app.installedAt)}
          </div>
        </div>
      </div>
      <div className="space-y-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
        <Button className="w-full" disabled={busy} onClick={withBusy(onLaunch)}>
          {t('launch')}
        </Button>
        <Button className="w-full" variant="outline" disabled={busy} onClick={withBusy(onCheckUpdate)}>
          {t('appUpdateCheck')}
        </Button>
        <Button className="w-full" variant="danger" disabled={busy} onClick={withBusy(onUninstall)}>
          {t('uninstall')}
        </Button>
      </div>
    </div>
  )
}

export default function App(): React.JSX.Element {
  const { t } = useTranslation()
  const { apps, settings, loading, load, refreshApps, updateSettings } = useAppStore()
  const [installing, setInstalling] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = apps.find((a) => a.id === selectedId) ?? null

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

  const launchApp = async (app: AppRecord): Promise<void> => {
    const res = await window.api.apps.launch(app.id)
    if (!res.ok) alert(`${t('errors.launch')}: ${res.error}`)
  }

  const uninstallApp = async (app: AppRecord): Promise<void> => {
    const name = settings.language === 'en' ? app.name.en : app.name.zh
    if (!window.confirm(t('confirmUninstall', { name }))) return
    const res = await window.api.apps.uninstall(app.id)
    if (!res.ok) {
      alert(`${t('errors.uninstall')}: ${res.error}`)
      return
    }
    if (selectedId === app.id) setSelectedId(null)
    await refreshApps()
  }

  const checkAppUpdate = async (app: AppRecord): Promise<void> => {
    const name = settings.language === 'en' ? app.name.en : app.name.zh
    const res = await window.api.updates.checkApp(app.id)
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

      <div className="relative flex min-h-0 flex-1">
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                {t('appCount', { count: apps.length })}
              </h2>
            </div>

            {loading ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800/60" />
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
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
                {apps.map((app) => (
                  <AppTile
                    key={app.id}
                    app={app}
                    selected={app.id === selectedId}
                    onSelect={setSelectedId}
                    onLaunch={launchApp}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        {selected && (
          <aside className="absolute right-0 top-0 z-20 h-full w-80 border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <DetailPanel
              app={selected}
              onClose={() => setSelectedId(null)}
              onLaunch={launchApp}
              onUninstall={uninstallApp}
              onCheckUpdate={checkAppUpdate}
            />
          </aside>
        )}
      </div>

      <footer className="border-t border-zinc-200/80 py-4 text-center text-[11px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-600">
        SciTool Platform · SDK 0.4.0 · M4
      </footer>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
