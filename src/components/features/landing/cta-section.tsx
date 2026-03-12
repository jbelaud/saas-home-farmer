import Link from 'next/link'
import {useTranslations} from 'next-intl'

import {Button} from '@/components/ui/button'

export function CtaSection() {
  const t = useTranslations('HomePage.cta')

  return (
    <section className="bg-primary py-20 text-center text-white">
      <div className="container mx-auto px-4">
        <h2 className="font-heading mb-6 text-3xl font-bold md:text-5xl">
          {t('title')}
        </h2>
        <p className="mb-10 text-xl opacity-90">{t('description')}</p>
        <Button
          size="lg"
          variant="secondary"
          className="text-primary h-14 px-8 text-lg font-bold"
          asChild
        >
          <Link href="/register">{t('button')}</Link>
        </Button>
      </div>
    </section>
  )
}
