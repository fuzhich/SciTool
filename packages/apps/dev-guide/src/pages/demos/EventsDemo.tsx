import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk, SharedDocEvent } from '@scitool/sdk'
import { CodeBlock } from '../../components/CodeBlock'
import { Badge, btnCls, Output, type OutputLine } from '../../components/ui'

const DOMAIN = 'devguide'

export function EventsDemo({ sdk }: { sdk: Sdk | null }): React.JSX.Element {
  const { t } = useTranslation()
  const [subscribed, setSubscribed] = useState(false)
  const [lines, setLines] = useState<OutputLine[]>([])
  const unsubRef = useRef<(() => void) | null>(null)

  const push = (text: string, ok?: boolean): void => setLines((prev) => [...prev.slice(-49), { text, ok }])

  const eventLine = (e: SharedDocEvent): string =>
    `${e.type}  ${e.doc.id}  rev=${e.doc.revision}  domain=${e.doc.domain}`

  const onSubscribe = (): void => {
    void (async () => {
      try {
        const res = await sdk!.events.subscribe(DOMAIN, (event) => {
          push(`收到事件 → ${eventLine(event)}`, true)
        })
        if (res.ok) {
          unsubRef.current = res.data!
          setSubscribed(true)
          push(`subscribe('${DOMAIN}') → ok`)
        } else {
          push(`subscribe → ${res.error}`, false)
        }
      } catch (err) {
        push(String(err), false)
      }
    })()
  }

  const onUnsubscribe = (): void => {
    unsubRef.current?.()
    unsubRef.current = null
    setSubscribed(false)
    push(`unsubscribe('${DOMAIN}') → ok`)
  }

  const onEmitTest = (): void => {
    void (async () => {
      try {
        const res = await sdk!.sharedData.put(`event-demo-${Date.now()}`, { at: new Date().toISOString() }, { domain: DOMAIN })
        push(`put 测试文档 → ${res.ok ? `rev=${res.data!.revision}` : res.error}`, res.ok)
      } catch (err) {
        push(String(err), false)
      }
    })()
  }

  // 组件卸载（如切换标签页）时自动退订
  useEffect(() => {
    return () => {
      unsubRef.current?.()
      unsubRef.current = null
    }
  }, [])

  return (
    <div>
      <p className="text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('playground.hintEvents')}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge>{t('playground.permission')}: events</Badge>
        <Badge tone="green">
          {t('playground.domain')}: {t('playground.domainDevguide')}
        </Badge>
        <Badge tone={subscribed ? 'green' : 'zinc'}>
          {subscribed ? t('playground.statusSubscribed') : t('playground.statusUnsubscribed')}
        </Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className={btnCls} disabled={!sdk || subscribed} onClick={onSubscribe}>
          {t('playground.btnSubscribe')}
        </button>
        <button className={btnCls} disabled={!sdk || !subscribed} onClick={onUnsubscribe}>
          {t('playground.btnUnsubscribe')}
        </button>
        <button className={btnCls} disabled={!sdk || !subscribed} onClick={onEmitTest}>
          {t('playground.btnEmitTest')}
        </button>
      </div>
      <div className="mt-4">
        <CodeBlock code={t('code.events')} />
      </div>
      <Output lines={lines} />
    </div>
  )
}
