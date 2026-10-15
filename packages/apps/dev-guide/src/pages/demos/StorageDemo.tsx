import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import { CodeBlock } from '../../components/CodeBlock'
import { Badge, btnCls, Field, inputCls, Output, type OutputLine } from '../../components/ui'

export function StorageDemo({ sdk }: { sdk: Sdk | null }): React.JSX.Element {
  const { t } = useTranslation()
  const [key, setKey] = useState('lastProject')
  const [value, setValue] = useState('{"id": 3}')
  const [lines, setLines] = useState<OutputLine[]>([])

  const push = (text: string, ok?: boolean): void => setLines((prev) => [...prev.slice(-49), { text, ok }])
  const run = async (fn: () => Promise<void>): Promise<void> => {
    try {
      await fn()
    } catch (err) {
      push(String(err), false)
    }
  }

  const parseValue = (): unknown => {
    try {
      return JSON.parse(value)
    } catch {
      return value
    }
  }

  const onSet = (): void => {
    void run(async () => {
      const res = await sdk!.storage.set(key, parseValue())
      push(`set('${key}') → ${JSON.stringify(res)}`, res.ok)
    })
  }
  const onGet = (): void => {
    void run(async () => {
      const res = await sdk!.storage.get(key)
      push(`get('${key}') → ${JSON.stringify(res)}`, res.ok)
    })
  }
  const onRemove = (): void => {
    void run(async () => {
      const res = await sdk!.storage.remove(key)
      push(`remove('${key}') → ${JSON.stringify(res)}`, res.ok)
    })
  }

  return (
    <div>
      <p className="text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('playground.hintStorage')}</p>
      <div className="mt-2 flex gap-2">
        <Badge>{t('playground.permission')}: storage</Badge>
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Field label={t('playground.fieldKey')}>
            <input className={inputCls} value={key} onChange={(e) => setKey(e.target.value)} />
          </Field>
          <Field label={t('playground.fieldValue')}>
            <input className={inputCls} value={value} onChange={(e) => setValue(e.target.value)} />
          </Field>
        </div>
        <div className="flex gap-2">
          <button className={btnCls} disabled={!sdk || !key} onClick={onSet}>
            {t('playground.btnSet')}
          </button>
          <button className={btnCls} disabled={!sdk || !key} onClick={onGet}>
            {t('playground.btnGet')}
          </button>
          <button className={btnCls} disabled={!sdk || !key} onClick={onRemove}>
            {t('playground.btnRemove')}
          </button>
        </div>
      </div>
      <div className="mt-4">
        <CodeBlock code={t('code.storage')} />
      </div>
      <Output lines={lines} />
    </div>
  )
}
