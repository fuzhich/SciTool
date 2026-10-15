import { useTranslation } from 'react-i18next'
import { Card, PageTitle, SectionTitle } from '../components/ui'

function FlowDiagram(): React.JSX.Element {
  const { t } = useTranslation()
  const box = 'flex min-w-0 flex-1 items-center justify-center rounded-lg border px-3 py-2 text-center text-[12px] leading-4'
  const arrow = 'flex shrink-0 items-center px-1 text-zinc-400'
  return (
    <Card>
      <div className="flex items-stretch">
        <div className={`${box} border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300`}>
          {t('overview.flowApps')}
        </div>
        <div className={arrow}>→</div>
        <div className={`${box} border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300`}>
          {t('overview.flowSdk')}
        </div>
        <div className={arrow}>→</div>
        <div className={`${box} border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300`}>
          {t('overview.flowGate')}
        </div>
        <div className={arrow}>→</div>
        <div className={`${box} border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/40 dark:text-zinc-300`}>
          {t('overview.flowServices')}
        </div>
      </div>
    </Card>
  )
}

export function OverviewPage(): React.JSX.Element {
  const { t } = useTranslation()
  const cards = t('overview.runtimeCards', { returnObjects: true }) as { title: string; desc: string }[]
  return (
    <div>
      <PageTitle title={t('overview.title')} desc={t('overview.desc')} />

      <Card>
        <p className="text-[13px] leading-6 text-zinc-600 dark:text-zinc-300">{t('overview.intro1')}</p>
        <p className="mt-2 text-[13px] leading-6 text-zinc-600 dark:text-zinc-300">{t('overview.intro2')}</p>
      </Card>

      <SectionTitle>{t('overview.runtimeTitle')}</SectionTitle>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.title}>
            <h3 className="text-[13px] font-semibold">{c.title}</h3>
            <p className="mt-1.5 text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{c.desc}</p>
          </Card>
        ))}
      </div>

      <SectionTitle>{t('overview.flowTitle')}</SectionTitle>
      <FlowDiagram />

      <SectionTitle>{t('overview.gatesTitle')}</SectionTitle>
      <div className="space-y-3">
        <Card>
          <h3 className="text-[13px] font-semibold">{t('overview.gate1Title')}</h3>
          <p className="mt-1.5 text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('overview.gate1Desc')}</p>
        </Card>
        <Card>
          <h3 className="text-[13px] font-semibold">{t('overview.gate2Title')}</h3>
          <p className="mt-1.5 text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('overview.gate2Desc')}</p>
        </Card>
      </div>

      <SectionTitle>{t('overview.dataTitle')}</SectionTitle>
      <Card>
        <p className="text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('overview.dataDesc')}</p>
      </Card>
    </div>
  )
}
