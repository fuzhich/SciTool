import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk, SharedDoc } from '@scitool/sdk'
import { CodeBlock } from '../../components/CodeBlock'
import { Badge, btnCls, Field, inputCls, Output, type OutputLine } from '../../components/ui'

const DOMAIN = 'devguide'

export function SharedDataDemo({ sdk }: { sdk: Sdk | null }): React.JSX.Element {
  const { t } = useTranslation()
  const [docId, setDocId] = useState('note-1')
  const [data, setData] = useState('{"title": "Hello"}')
  const [expectedRevision, setExpectedRevision] = useState('')
  const [lines, setLines] = useState<OutputLine[]>([])

  const push = (text: string, ok?: boolean): void => setLines((prev) => [...prev.slice(-49), { text, ok }])
  const run = async (fn: () => Promise<void>): Promise<void> => {
    try {
      await fn()
    } catch (err) {
      push(String(err), false)
    }
  }

  const options = (): { domain: string; expectedRevision?: number } => {
    const opts: { domain: string; expectedRevision?: number } = { domain: DOMAIN }
    if (expectedRevision.trim() !== '') opts.expectedRevision = Number(expectedRevision)
    return opts
  }
  const parseData = (): unknown => {
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  }
  const docLine = (d: SharedDoc): string => `${d.id}  rev=${d.revision}  domain=${d.domain}`

  const onPut = (): void => {
    void run(async () => {
      const res = await sdk!.sharedData.put(docId, parseData(), options())
      push(`put('${docId}') → ${res.ok ? docLine(res.data!) : res.error}`, res.ok)
    })
  }
  const onGet = (): void => {
    void run(async () => {
      const res = await sdk!.sharedData.get(docId)
      push(`get('${docId}') → ${JSON.stringify(res)}`, res.ok)
    })
  }
  const onList = (): void => {
    void run(async () => {
      const res = await sdk!.sharedData.list({ domain: DOMAIN })
      push(`list('${DOMAIN}') → ${res.ok ? `${res.data!.length} 篇文档` : res.error}`, res.ok)
      if (res.ok) {
        for (const d of res.data!) push(`  ${docLine(d)}`)
      }
    })
  }
  const onRemove = (): void => {
    void run(async () => {
      const res = await sdk!.sharedData.remove(docId, expectedRevision.trim() !== '' ? Number(expectedRevision) : undefined)
      push(`remove('${docId}') → ${JSON.stringify(res)}`, res.ok)
    })
  }

  return (
    <div>
      <p className="text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('playground.hintSharedData')}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge>{t('playground.permission')}: sharedData</Badge>
        <Badge tone="green">
          {t('playground.domain')}: {t('playground.domainDevguide')}
        </Badge>
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Field label={t('playground.fieldId')}>
            <input className={inputCls} value={docId} onChange={(e) => setDocId(e.target.value)} />
          </Field>
          <Field label={t('playground.fieldExpectedRevision')}>
            <input className={inputCls} value={expectedRevision} onChange={(e) => setExpectedRevision(e.target.value)} />
          </Field>
        </div>
        <Field label={t('playground.fieldData')}>
          <input className={inputCls} value={data} onChange={(e) => setData(e.target.value)} />
        </Field>
        <div className="flex flex-wrap gap-2">
          <button className={btnCls} disabled={!sdk || !docId} onClick={onPut}>
            {t('playground.btnPut')}
          </button>
          <button className={btnCls} disabled={!sdk || !docId} onClick={onGet}>
            {t('playground.btnGet')}
          </button>
          <button className={btnCls} disabled={!sdk} onClick={onList}>
            {t('playground.btnList')}
          </button>
          <button className={btnCls} disabled={!sdk || !docId} onClick={onRemove}>
            {t('playground.btnRemove')}
          </button>
        </div>
      </div>
      <div className="mt-4">
        <CodeBlock code={t('code.sharedData')} />
      </div>
      <Output lines={lines} />
    </div>
  )
}
