import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import { CodeBlock } from '../../components/CodeBlock'
import { Badge, btnCls, Field, inputCls, Output, type OutputLine } from '../../components/ui'

const LEVELS = ['debug', 'info', 'warn', 'error'] as const

export function LogDemo({ sdk }: { sdk: Sdk | null }): React.JSX.Element {
  const { t } = useTranslation()
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('info')
  const [message, setMessage] = useState('Hello from DevGuide')
  const [lines, setLines] = useState<OutputLine[]>([])

  const onWrite = async (): Promise<void> => {
    try {
      const res = await sdk!.log(level, message)
      setLines((prev) => [...prev.slice(-49), { text: `log('${level}', '${message}') → ${t('playground.logWritten')}`, ok: res.ok }])
    } catch (err) {
      setLines((prev) => [...prev.slice(-49), { text: String(err), ok: false }])
    }
  }

  return (
    <div>
      <p className="text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('playground.hintLog')}</p>
      <div className="mt-2 flex gap-2">
        <Badge>{t('playground.permission')}: log</Badge>
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="flex gap-2.5">
          <Field label={t('playground.logLevel')}>
            <select className={inputCls} value={level} onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <div className="flex-1">
            <Field label={t('playground.logMessage')}>
              <input className={`${inputCls} w-full`} value={message} onChange={(e) => setMessage(e.target.value)} />
            </Field>
          </div>
        </div>
        <button className={btnCls} disabled={!sdk || !message} onClick={() => void onWrite()}>
          {t('playground.btnWriteLog')}
        </button>
      </div>
      <div className="mt-4">
        <CodeBlock code={t('code.log')} />
      </div>
      <Output lines={lines} />
    </div>
  )
}
