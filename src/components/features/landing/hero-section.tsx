import {ArrowRight, Check, Play, Smartphone, Sprout} from 'lucide-react'
import Link from 'next/link'
import {getTranslations} from 'next-intl/server'

import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'

export async function HeroSection({locale}: {locale: string}) {
  const t = await getTranslations({locale, namespace: 'HomePage'})

  return (
    <section className="relative overflow-hidden bg-stone-50 pt-16 pb-20 lg:pt-24 lg:pb-32">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700"
            >
              <Sprout className="mr-2 h-4 w-4" />
              {t('hero.badge')}
            </Badge>
            <h1 className="font-heading text-4xl leading-tight font-extrabold text-stone-900 sm:text-5xl lg:text-6xl">
              {t('hero.title')
                .split('Home Farmer')
                .map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <span className="text-primary">Home Farmer</span>
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
            </h1>
            <p className="text-lg text-stone-600">{t('hero.description')}</p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="h-14 gap-2 px-8 text-lg" asChild>
                <Link href="/register">
                  {t('hero.cta')}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 gap-2 px-8 text-lg"
              >
                <Play className="h-5 w-5" />
                {t('hero.ctaSecondary')}
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-stone-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-stone-200"
                  />
                ))}
              </div>
              <p>{t('hero.socialProof')}</p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-white shadow-2xl">
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 text-stone-400">
                <Smartphone className="h-24 w-24 opacity-20" />
                <span className="mt-4 font-medium">
                  Capture d&apos;écran App Mobile
                </span>
              </div>
              <div className="absolute bottom-12 -left-6 animate-bounce rounded-xl border bg-white p-4 shadow-lg duration-1000">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-500">
                      Tournée terminée
                    </p>
                    <p className="text-sm font-bold text-stone-900">
                      Mme. Dupont ✅
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
