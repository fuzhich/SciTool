import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import { CodeBlock } from '../../components/CodeBlock'
import { Badge, Output, type OutputLine } from '../../components/ui'

export function SettingsDemo({ sdk }: { sdk: Sdk | null }): React.JSX.Element {
  const { t } = useTranslation()
  const [lines, setLines] = useState<OutputLine[]>([])

  useEffect(() => {
    if (!sdk) return
    void (async () => {
      const langRes = await sdk.settings.getLanguage()
      const settingsRes = await sdk.settings.get()
      setLines([
        { text: `language → ${JSON.stringify(langRes)}`, ok: langRes.ok },
        { text: `settings → ${JSON.stringify(settingsRes)}`, ok: settingsRes.ok }
      ])
    })()
  }, [sdk])

  return (
    <div>
      <p className="text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('playground.hintSettings')}</p>
      <div className="mt-2 flex gap-2">
        <Badge>{t('playground.permission')}: settings</Badge>
      </div>
      <div className="mt-4">
        <CodeBlock code={t('code.settings')} />
      </div>
      <Output lines={lines} />
    </div>
  )
}
