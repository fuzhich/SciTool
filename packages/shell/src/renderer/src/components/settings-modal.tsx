import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'

interface Props {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: Props): React.JSX.Element | null {
  const { t } = useTranslation()
  const [dataDir, setDataDir] = useState('')
  const [moving, setMoving] = useState(false)

  useEffect(() => {
    if (!open) return
    setMoving(false)
    void window.api.dataDir.get().then((res) => {
      if (res.ok && res.data) setDataDir(res.data.current)
    })
  }, [open])

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
    // 成功时主进程已发起重启，无需处理
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">{t('settings')}</h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            {t('close')}
          </Button>
        </div>

        <section>
          <h3 className="text-[13px] font-medium text-zinc-800">{t('dataDir')}</h3>
          <p className="mt-1 text-xs leading-4 text-zinc-500">{t('dataDirDesc')}</p>
          <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
            <div className="text-[11px] text-zinc-400">{t('dataDirCurrent')}</div>
            <div className="mt-1 break-all font-mono text-xs text-zinc-700">{dataDir || '…'}</div>
          </div>
          <Button className="mt-3" size="sm" variant="outline" disabled={moving} onClick={onChangeDir}>
            {moving ? t('dataDirMoving') : t('changeDataDir')}
          </Button>
        </section>
      </div>
    </div>
  )
}
