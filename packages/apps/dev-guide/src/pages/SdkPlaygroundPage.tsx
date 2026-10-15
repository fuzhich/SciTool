import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Sdk } from '@scitool/sdk'
import { Card, PageTitle } from '../components/ui'
import { StorageDemo } from './demos/StorageDemo'
import { SettingsDemo } from './demos/SettingsDemo'
import { LogDemo } from './demos/LogDemo'
import { UiDemo } from './demos/UiDemo'
import { SharedDataDemo } from './demos/SharedDataDemo'
import { EventsDemo } from './demos/EventsDemo'

const TABS = [
  { key: 'storage', labelKey: 'playground.tabStorage' },
  { key: 'settings', labelKey: 'playground.tabSettings' },
  { key: 'log', labelKey: 'playground.tabLog' },
  { key: 'ui', labelKey: 'playground.tabUi' },
  { key: 'sharedData', labelKey: 'playground.tabSharedData' },
  { key: 'events', labelKey: 'playground.tabEvents' }
] as const

type TabKey = (typeof TABS)[number]['key']

export function SdkPlaygroundPage({ sdk }: { sdk: Sdk | null }): React.JSX.Element {
  const { t } = useTranslation()
  const [tab, setTab] = useState<TabKey>('storage')

  return (
    <div>
      <PageTitle title={t('playground.title')} desc={t('playground.desc')} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TABS.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors ${
              tab === item.key
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`}
          >
            {t(item.labelKey)}
          </button>
        ))}
      </div>
      <Card>
        {tab === 'storage' && <StorageDemo sdk={sdk} />}
        {tab === 'settings' && <SettingsDemo sdk={sdk} />}
        {tab === 'log' && <LogDemo sdk={sdk} />}
        {tab === 'ui' && <UiDemo sdk={sdk} />}
        {tab === 'sharedData' && <SharedDataDemo sdk={sdk} />}
        {tab === 'events' && <EventsDemo sdk={sdk} />}
      </Card>
    </div>
  )
}
