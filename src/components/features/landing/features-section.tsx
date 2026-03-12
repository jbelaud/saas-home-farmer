import {BarChart2, FileText, Shield, Smartphone} from 'lucide-react'
import {useTranslations} from 'next-intl'

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'

type FeatureCardProps = {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({icon, title, description}: FeatureCardProps) {
  return (
    <Card className="border-none bg-white shadow-md transition-shadow hover:shadow-xl">
      <CardHeader>
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-stone-50">
          {icon}
        </div>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-stone-600">{description}</p>
      </CardContent>
    </Card>
  )
}

export function FeaturesSection() {
  const t = useTranslations('HomePage')

  const features = [
    {
      icon: <Smartphone className="text-primary h-8 w-8" />,
      title: t('features.automation.title'),
      description: t('features.automation.description'),
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-amber-500" />,
      title: t('features.analytics.title'),
      description: t('features.analytics.description'),
    },
    {
      icon: <Shield className="text-primary h-8 w-8" />,
      title: t('features.security.title'),
      description: t('features.security.description'),
    },
    {
      icon: <FileText className="h-8 w-8 text-emerald-600" />,
      title: t('features.intervention.title'),
      description: t('features.intervention.description'),
    },
  ]

  return (
    <section id="features" className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="font-heading mb-4 text-3xl font-bold text-stone-900 md:text-4xl">
            {t('features.title')}
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-stone-600">
            {t('features.subtitle')}
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
