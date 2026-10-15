import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import { CodeBlock } from '../../components/CodeBlock'
import { Badge, btnCls, Output, type OutputLine } from '../../components/ui'

export function UiDemo({ sdk }: { sdk: Sdk | null }): React.JSX.Element {
  const { t } = useTranslation()
  const [lines, setLines] = useState<OutputLine[]>([])

  const run = async (label: string, fn: () => Promise<unknown>): Promise<void> => {
    try {
      const res = await fn()
      setLines((prev) => [...prev.slice(-49), { text: `${label} → ${JSON.stringify(res)}`, ok: (res as { ok?: boolean }).ok !== false }])
    } catch (err) {
      setLines((prev) => [...prev.slice(-49), { text: `${label} → ${String(err)}`, ok: false }])
    }
  }

  return (
    <div>
      <p className="text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('playground.hintUi')}</p>
      <div className="mt-2 flex gap-2">
        <Badge>{t('playground.permission')}: ui</Badge>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          className={btnCls}
          disabled={!sdk}
          onClick={() => void run('notify', () => sdk!.ui.notify({ title: 'DevGuide', body: 'Hello from sdk.ui.notify' }))}
        >
          {t('playground.btnNotify')}
        </button>
        <button className={btnCls} disabled={!sdk} onClick={() => void run('minimize', () => sdk!.ui.minimize())}>
          {t('playground.btnMinimize')}
        </button>
        <button className={btnCls} disabled={!sdk} onClick={() => void run('close', () => sdk!.ui.close())}>
          {t('playground.btnClose')}
        </button>
      </div>
      <div className="mt-4">
        <CodeBlock code={t('code.ui')} />
      </div>
      <Output lines={lines} />
    </div>
  )
}
