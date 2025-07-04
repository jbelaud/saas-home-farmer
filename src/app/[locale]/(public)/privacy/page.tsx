import {Metadata} from 'next'
import {getTranslations} from 'next-intl/server'
import React from 'react'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Page de politique de confidentialité',
}

const Page = async () => {
  const t = await getTranslations('PrivacyPage')

  const privacySections = [
    {
      key: 'privacyPolicy',
      hasContents: false,
    },
    {
      key: 'collectedInformation',
      hasContents: true,
    },
    {
      key: 'informationUsage',
      hasContents: true,
    },
    {
      key: 'informationProtection',
      hasContents: false,
    },
    {
      key: 'dataRetention',
      hasContents: false,
    },
    {
      key: 'policyChanges',
      hasContents: false,
    },
  ]

  return (
    <div className="mx-auto max-w-3xl p-6 text-lg">
      {privacySections.map((section) => (
        <Privacy
          key={section.key}
          title={t(`sections.${section.key}.title`)}
          description={t(`sections.${section.key}.description`)}
          hasContents={section.hasContents}
          sectionKey={section.key}
        />
      ))}
    </div>
  )
}

type PrivacyProps = {
  title: string
  description: string
  hasContents: boolean
  sectionKey: string
}

const Privacy = async (props: PrivacyProps) => {
  const {hasContents, description, title, sectionKey} = props
  const t = await getTranslations('PrivacyPage')

  let privacyContents: React.ReactNode[] = []

  if (hasContents) {
    // Récupérer les contenus pour les sections qui en ont
    const contents = t.raw(`sections.${sectionKey}.contents`) as string[]
    if (Array.isArray(contents)) {
      privacyContents = contents.map((content, cIndex) => (
        <li className="list-disc p-1" key={cIndex}>
          {content}
        </li>
      ))
    }
  }

  return (
    <div className="py-2">
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>
      {privacyContents.length > 0 && (
        <ul className="text-muted-foreground pl-8">{privacyContents}</ul>
      )}
    </div>
  )
}

export default Page
