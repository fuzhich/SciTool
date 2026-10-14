import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '../stores/app-store'
import { Button } from './ui/button'
import { cn } from '../lib/cn'

interface Props {
  open: boolean
  onClose: () => void
}

interface UpdateStatus {
  state:
    | 'idle'
    | 'checking'
    | 'available'
    | 'not-available'
    | 'downloading'
    | 'downloaded'
    | 'error'
  version?: string
  percent?: number
  message?: string
}

export function SettingsModal({ open, onClose }: Props): React.JSX.Element | null {
  const { t } = useTranslation()
  const { settings, updateSettings } = useAppStore()
  const [dataDir, setDataDir] = useState('')
  const [moving, setMoving] = useState(false)
  const [version, setVersion] = useState('')
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ state: 'idle' })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setMoving(false)
    void window.api.dataDir.get().then((res) => {
      if (res.ok && res.data) setDataDir(res.data.current)
    })
    void window.api.updates.status().then((res) => {
      if (res.ok && res.data) {
        setVersion(res.data.version)
        setUpdateStatus(res.data.status as UpdateStatus)
      }
    })
  }, [open])

  useEffect(() => {
    return window.api.updates.onStatusChanged((status) => {
      setUpdateStatus(status as UpdateStatus)
    })
  }, [])

  if (!open) return null

  const onChangeDir = async (): Promise<void> => {
    const picked = await window.api.dataDir.pick()
    if (!picked.ok || !picked.data) return
    const target = picked.data
    if (!window.confirm(t('dataDirMoveConfirm', { path: target }))) return
    setMoving(true)
    const res = await window.api.dataDir.move(target)
    if (!res.ok) {
      setMoving(false)
      alert(res.error)
    }
  }

  const onCheckUpdate = async (): Promise<void> => {
    setBusy(true)
    await window.api.updates.check()
    setBusy(false)
  }

  const onDownload = async (): Promise<void> => {
    setBusy(true)
    await window.api.updates.download()
    setBusy(false)
  }

  const onInstall = async (): Promise<void> => {
    await window.api.updates.install()
  }

  const statusText = (): string => {
    switch (updateStatus.state) {
      case 'checking':
        return t('updateChecking')
      case 'available':
        return t('updateAvailable', { version: updateStatus.version ?? '' })
      case 'not-available':
        return t('updateNotAvailable')
      case 'downloading':
        return t('updateDownloading', { percent: updateStatus.percent ?? 0 })
      case 'downloaded':
        return t('updateDownloaded')
      case 'error':
        return `${t('updateError')}: ${updateStatus.message ?? ''}`
      default:
        return ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">{t('settings')}</h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            {t('close')}
          </Button>
        </div>

        <section className="mb-6">
          <h3 className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{t('theme')}</h3>
          <div className="mt-2 flex gap-2">
            {(['light', 'dark'] as const).map((th) => (
              <Button
                key={th}
                size="sm"
                variant={settings.theme === th ? 'primary' : 'outline'}
                className={cn(settings.theme !== th && 'min-w-16')}
                onClick={() => void updateSettings({ theme: th })}
              >
                {t(th)}
              </Button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{t('about')}</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {t('versionLabel')}: v{version}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant="outline" disabled={busy} onClick={onCheckUpdate}>
              {t('checkUpdate')}
            </Button>
            {updateStatus.state === 'available' && (
              <Button size="sm" disabled={busy} onClick={onDownload}>
                {t('updateDownloadBtn')}
              </Button>
            )}
            {updateStatus.state === 'downloaded' && (
              <Button size="sm" onClick={onInstall}>
                {t('updateInstallNow')}
              </Button>
            )}
          </div>
          {statusText() && <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{statusText()}</p>}
        </section>

        <section>
          <h3 className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{t('dataDir')}</h3>
          <p className="mt-1 text-xs leading-4 text-zinc-500 dark:text-zinc-400">{t('dataDirDesc')}</p>
          <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-[11px] text-zinc-400 dark:text-zinc-500">{t('dataDirCurrent')}</div>
            <div className="mt-1 break-all font-mono text-xs text-zinc-700 dark:text-zinc-300">
              {dataDir || '…'}
            </div>
          </div>
          <Button className="mt-3" size="sm" variant="outline" disabled={moving} onClick={onChangeDir}>
            {moving ? t('dataDirMoving') : t('changeDataDir')}
          </Button>
        </section>
      </div>
    </div>
  )
}
