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

const AI_PRESETS: Record<string, { baseUrl: string; model: string }> = {
  deepseek: { baseUrl: 'https://api.deepseek.com', model: 'deepseek-chat' },
  openai: { baseUrl: 'https://api.openai.com', model: 'gpt-4o-mini' },
  custom: { baseUrl: '', model: '' }
}

type AiSaveState =
  | { phase: 'idle' }
  | { phase: 'checking' }
  | { phase: 'ok' }
  | { phase: 'error'; message: string }

export function SettingsModal({ open, onClose }: Props): React.JSX.Element | null {
  const { t } = useTranslation()
  const { settings, updateSettings } = useAppStore()
  const [dataDir, setDataDir] = useState('')
  const [moving, setMoving] = useState(false)
  const [version, setVersion] = useState('')
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>({ state: 'idle' })
  const [busy, setBusy] = useState(false)
  const [aiProvider, setAiProvider] = useState('deepseek')
  const [aiBaseUrl, setAiBaseUrl] = useState(AI_PRESETS.deepseek.baseUrl)
  const [aiModel, setAiModel] = useState(AI_PRESETS.deepseek.model)
  const [aiHasKey, setAiHasKey] = useState(false)
  const [aiKey, setAiKey] = useState('')
  const [aiState, setAiState] = useState<AiSaveState>({ phase: 'idle' })

  useEffect(() => {
    if (!open) return
    setMoving(false)
    setAiState({ phase: 'idle' })
    setAiKey('')
    void window.api.dataDir.get().then((res) => {
      if (res.ok && res.data) setDataDir(res.data.current)
    })
    void window.api.updates.status().then((res) => {
      if (res.ok && res.data) {
        setVersion(res.data.version)
        setUpdateStatus(res.data.status as UpdateStatus)
      }
    })
    void window.api.ai.get().then((res) => {
      if (res.ok && res.data) {
        setAiProvider(res.data.provider)
        setAiBaseUrl(res.data.baseUrl)
        setAiModel(res.data.model)
        setAiHasKey(res.data.hasKey)
      }
    })
  }, [open])

  const onProviderChange = (provider: string): void => {
    setAiProvider(provider)
    setAiBaseUrl(AI_PRESETS[provider]?.baseUrl ?? '')
    setAiModel(AI_PRESETS[provider]?.model ?? '')
    setAiState({ phase: 'idle' })
  }

  const onSaveAi = async (): Promise<void> => {
    setAiState({ phase: 'checking' })
    const res = await window.api.ai.set({
      provider: aiProvider,
      baseUrl: aiBaseUrl,
      model: aiModel,
      apiKey: aiKey
    })
    if (res.ok) {
      setAiState({ phase: 'ok' })
      setAiKey('')
      setAiHasKey(true)
    } else {
      setAiState({ phase: 'error', message: res.error ?? 'unknown' })
    }
  }

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
          <h3 className="text-[13px] font-medium text-zinc-800 dark:text-zinc-200">{t('aiService')}</h3>
          <p className="mt-1 text-xs leading-4 text-zinc-500 dark:text-zinc-400">{t('aiDesc')}</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <select
                className="h-8 flex-1 rounded-lg border border-zinc-300 bg-white px-2 text-xs text-zinc-700 outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                value={aiProvider}
                onChange={(e) => onProviderChange(e.target.value)}
              >
                <option value="deepseek">DeepSeek</option>
                <option value="openai">OpenAI</option>
                <option value="custom">{t('aiCustom')}</option>
              </select>
              <input
                type="password"
                className="h-8 flex-1 rounded-lg border border-zinc-300 bg-white px-2 text-xs text-zinc-700 outline-none focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
                placeholder={aiHasKey ? t('aiKeyPlaceholder') : t('aiKey')}
                value={aiKey}
                onChange={(e) => {
                  setAiKey(e.target.value)
                  setAiState({ phase: 'idle' })
                }}
              />
            </div>
            <input
              className="h-8 w-full rounded-lg border border-zinc-300 bg-white px-2 text-xs text-zinc-700 outline-none focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
              placeholder={t('aiBaseUrl')}
              value={aiBaseUrl}
              onChange={(e) => {
                setAiBaseUrl(e.target.value)
                setAiState({ phase: 'idle' })
              }}
            />
            <input
              className="h-8 w-full rounded-lg border border-zinc-300 bg-white px-2 text-xs text-zinc-700 outline-none focus:border-blue-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
              placeholder={t('aiModel')}
              value={aiModel}
              onChange={(e) => {
                setAiModel(e.target.value)
                setAiState({ phase: 'idle' })
              }}
            />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={aiState.phase === 'checking'} onClick={() => void onSaveAi()}>
                {aiState.phase === 'checking' ? t('aiChecking') : t('aiSave')}
              </Button>
              {aiState.phase === 'ok' && <span className="text-xs text-emerald-600 dark:text-emerald-400">{t('aiValid')}</span>}
              {aiState.phase === 'error' && (
                <span className="min-w-0 flex-1 truncate text-xs text-red-500 dark:text-red-400" title={aiState.message}>
                  {t('aiInvalid')}: {aiState.message}
                </span>
              )}
            </div>
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
