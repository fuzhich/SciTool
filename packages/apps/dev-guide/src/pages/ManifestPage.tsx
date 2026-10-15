import { useTranslation } from 'react-i18next'
import { Card, PageTitle, SectionTitle } from '../components/ui'

export function ManifestPage(): React.JSX.Element {
  const { t } = useTranslation()
  const fields = t('manifest.fields', { returnObjects: true }) as {
    field: string
    required: string
    rule: string
    example: string
  }[]
  const permissions = t('manifest.permissions', { returnObjects: true }) as { perm: string; ability: string }[]
  const troubles = t('manifest.troubles', { returnObjects: true }) as string[]

  return (
    <div>
      <PageTitle title={t('manifest.title')} desc={t('manifest.desc')} />

      <SectionTitle>{t('manifest.fieldTitle')}</SectionTitle>
      <Card className="p-0">
        <table className="w-full text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-2.5 font-medium">{t('manifest.fieldCol')}</th>
              <th className="px-4 py-2.5 font-medium">{t('manifest.requiredCol')}</th>
              <th className="px-4 py-2.5 font-medium">{t('manifest.ruleCol')}</th>
              <th className="px-4 py-2.5 font-medium">{t('manifest.exampleCol')}</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((f) => (
              <tr key={f.field} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                <td className="px-4 py-2.5 font-mono text-[12px] text-blue-600 dark:text-blue-400">{f.field}</td>
                <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">{f.required}</td>
                <td className="px-4 py-2.5 leading-5 text-zinc-600 dark:text-zinc-300">{f.rule}</td>
                <td className="px-4 py-2.5 font-mono text-[11.5px] leading-5 text-zinc-400 dark:text-zinc-500">{f.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <SectionTitle>{t('manifest.permTitle')}</SectionTitle>
      <Card className="p-0">
        <table className="w-full text-left text-[12.5px]">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
              <th className="px-4 py-2.5 font-medium">{t('manifest.permCol')}</th>
              <th className="px-4 py-2.5 font-medium">{t('manifest.abilityCol')}</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((p) => (
              <tr key={p.perm} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60">
                <td className="px-4 py-2.5 font-mono text-[12px] text-blue-600 dark:text-blue-400">{p.perm}</td>
                <td className="px-4 py-2.5 leading-5 text-zinc-600 dark:text-zinc-300">{p.ability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <SectionTitle>{t('manifest.troubleTitle')}</SectionTitle>
      <Card>
        <ul className="list-disc space-y-1.5 pl-5 text-[12.5px] leading-5 text-zinc-500 dark:text-zinc-400">
          {troubles.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
