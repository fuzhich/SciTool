import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import { buildDevPrompt } from '../lib/dev-prompt'
import { Badge, btnCls, Card, Output, PageTitle, SectionTitle, type OutputLine } from '../components/ui'

export function ExportPromptPage({ sdk }: { sdk: Sdk | null }): React.JSX.Element {
  const { t } = useTranslation()
  const [lines, setLines] = useState<OutputLine[]>([])
  const content = useMemo(() => buildDevPrompt(sdk?.version ?? '0.3.0'), [sdk])
  const usageItems = t('prompt.usageItems', { returnObjects: true }) as string[]

  const onExport = async (): Promise<void> => {
    try {
      if (sdk?.ui.saveTextFile) {
        const res = await sdk.ui.saveTextFile({
          defaultFileName: 'scitool-app-dev-prompt.md',
          content
        })
        if (!res.ok) {
          setLines((prev) => [...prev, { text: res.error ?? 'unknown error', ok: false }])
        } else if (res.data) {
          const path = res.data.path
          setLines((prev) => [...prev, { text: `${t('prompt.exported')}: ${path}`, ok: true }])
        } else {
          setLines((prev) => [...prev, { text: t('prompt.canceled') }])
        }
        return
      }
      // 回退：无保存对话框能力时（浏览器 dev / 旧平台）改用浏览器下载
      const blob = new Blob([content], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'scitool-app-dev-prompt.md'
      a.click()
      URL.revokeObjectURL(url)
      setLines((prev) => [...prev, { text: t('prompt.fallbackSaved'), ok: true }])
    } catch (err) {
      setLines((prev) => [...prev, { text: String(err), ok: false }])
    }
  }

  return (
    <div>
      <PageTitle title={t('prompt.title')} desc={t('prompt.desc')} />
      <Card>
        <h3 className="text-[13px] font-semibold">{t('prompt.usageTitle')}</h3>
        <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">
          {usageItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{t('playground.permission')}: ui</Badge>
          <Badge tone="green">SDK 0.3.0</Badge>
        </div>
      </Card>
      <SectionTitle>{t('prompt.previewTitle')}</SectionTitle>
      <pre className="max-h-[480px] overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-5 text-[12px] leading-5 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
        {content}
      </pre>
      <div className="mt-4">
        <button className={btnCls} onClick={() => void onExport()}>
          {t('prompt.btnExport')}
        </button>
      </div>
      <Output lines={lines} />
    </div>
  )
}
