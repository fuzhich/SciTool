import { useTranslation } from 'react-i18next'
import { CodeBlock } from '../components/CodeBlock'
import { Card, PageTitle, SectionTitle } from '../components/ui'

export function QuickStartPage(): React.JSX.Element {
  const { t } = useTranslation()
  const steps = [
    { title: t('quickstart.step1Title'), desc: t('quickstart.step1Desc') },
    { title: t('quickstart.step2Title'), desc: t('quickstart.step2Desc') },
    { title: t('quickstart.step3Title'), desc: t('quickstart.step3Desc') },
    { title: t('quickstart.step4Title'), desc: t('quickstart.step4Desc') },
    { title: t('quickstart.step5Title'), desc: t('quickstart.step5Desc') }
  ]
  const refItems = t('quickstart.refItems', { returnObjects: true }) as string[]

  return (
    <div>
      <PageTitle title={t('quickstart.title')} desc={t('quickstart.desc')} />

      <div className="space-y-3">
        {steps.map((s, i) => (
          <Card key={i} className="flex items-start gap-4">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[12px] font-semibold text-white">
              {i + 1}
            </div>
            <div>
              <h3 className="text-[13px] font-semibold">{s.title}</h3>
              <p className="mt-1 text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{s.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <SectionTitle>{t('quickstart.manifestTitle')}</SectionTitle>
      <CodeBlock code={t('code.manifestExample')} />

      <SectionTitle>{t('quickstart.treeTitle')}</SectionTitle>
      <CodeBlock code={t('code.zipTree')} />

      <SectionTitle>{t('quickstart.buildTitle')}</SectionTitle>
      <CodeBlock code={t('code.buildScript')} />

      <SectionTitle>{t('quickstart.cycleTitle')}</SectionTitle>
      <Card>
        <p className="text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">{t('quickstart.cycleDesc')}</p>
      </Card>

      <SectionTitle>{t('quickstart.refTitle')}</SectionTitle>
      <Card>
        <ul className="list-disc space-y-1.5 pl-5 text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">
          {refItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
