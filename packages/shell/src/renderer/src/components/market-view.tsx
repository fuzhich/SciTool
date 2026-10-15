import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { AppRecord } from '@scitool/sdk'
import { useAppStore } from '../stores/app-store'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface MarketApp {
  id: string
  name: { zh: string; en: string }
  description: { zh: string; en: string }
  version: string
  minSdkVersion: string
  zipUrl: string
  size: number
}

interface MarketManifest {
  version: number
  apps: MarketApp[]
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    if ((pa[i] ?? 0) > (pb[i] ?? 0)) return 1
    if ((pa[i] ?? 0) < (pb[i] ?? 0)) return -1
  }
  return 0
}

function fmtSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export function MarketView({ onLaunch }: { onLaunch: (app: AppRecord) => void }): React.JSX.Element {
  const { t, i18n: i18nInst } = useTranslation()
  const { apps } = useAppStore()
  const [manifest, setManifest] = useState<MarketManifest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async (): Promise<void> => {
    setError(null)
    setManifest(null)
    const res = await window.api.market.fetch()
    if (!res.ok || !res.data) {
      setError(res.error ?? t('marketError'))
      return
    }
    setManifest(res.data)
  }, [t])

  useEffect(() => {
    void load()
  }, [load])

  const onInstall = async (app: MarketApp): Promise<void> => {
    setBusyId(app.id)
    try {
      const res = await window.api.market.install(app)
      if (!res.ok) alert(`${t('errors.install')}: ${res.error}`)
    } finally {
      setBusyId(null)
    }
  }

  const lang = i18nInst.language === 'en' ? 'en' : 'zh'

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {t('marketDesc')}
        </h2>
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <p className="text-[13px] text-red-500 dark:text-red-400">{t('marketError')}: {error}</p>
          <Button size="sm" variant="outline" onClick={() => void load()}>
            {t('marketRetry')}
          </Button>
        </div>
      ) : manifest === null ? (
        <p className="py-20 text-center text-[13px] text-zinc-400">{t('marketLoading')}</p>
      ) : manifest.apps.length === 0 ? (
        <p className="py-20 text-center text-[13px] text-zinc-400">{t('marketEmpty')}</p>
      ) : (
        <div className="space-y-3">
          {manifest.apps.map((app) => {
            const installed = apps.find((a) => a.id === app.id)
            const installedVer = installed?.version ?? ''
            const status: 'install' | 'update' | 'open' = !installed
              ? 'install'
              : compareVersions(app.version, installedVer) > 0
                ? 'update'
                : 'open'
            const name = lang === 'en' ? app.name.en : app.name.zh
            const desc = lang === 'en' ? app.description.en : app.description.zh
            const initial = (app.name.zh || '?').slice(0, 1).toUpperCase()
            const busy = busyId === app.id
            return (
              <div
                key={app.id}
                className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[14px] font-medium">{name}</span>
                    <Badge>v{app.version}</Badge>
                    {installed && (
                      <Badge className="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                        {t('marketInstalled')} v{installedVer}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-[12.5px] text-zinc-500 dark:text-zinc-400">{desc}</p>
                </div>
                <span className="shrink-0 text-[11.5px] text-zinc-400 dark:text-zinc-500">
                  {t('marketSize')}: {fmtSize(app.size)}
                </span>
                {status === 'open' ? (
                  <Button size="sm" variant="outline" onClick={() => onLaunch(installed!)}>
                    {t('marketOpen')}
                  </Button>
                ) : (
                  <Button size="sm" disabled={busy} onClick={() => void onInstall(app)}>
                    {busy ? t('marketInstalling') : status === 'update' ? t('marketUpdate') : t('marketInstall')}
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
