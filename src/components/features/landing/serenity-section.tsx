import {Check, Users} from 'lucide-react'
import {useTranslations} from 'next-intl'

import {Badge} from '@/components/ui/badge'

export function SerenitySection() {
  const t = useTranslations('HomePage.serenity')

  return (
    <section id="serenity" className="bg-stone-900 py-20 text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          {/* Mock card */}
          <div className="order-2 md:order-1">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-700">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{t('mockCard.title')}</p>
                    <p className="text-sm text-stone-400">
                      {t('mockCard.subtitle')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 rounded-lg bg-white/5 p-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-sm text-stone-300">
                      {t('mockCard.lastVisit')}
                    </span>
                    <span className="text-sm font-medium">
                      {t('mockCard.lastVisitValue')}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-stone-500 uppercase">
                      {t('mockCard.actionsLabel')}
                    </p>
                    <div className="flex gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      >
                        Taille
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      >
                        Semis
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-300 italic">
                      &quot;{t('mockCard.note')}&quot;
                    </p>
                  </div>
                  <div className="relative h-32 w-full overflow-hidden rounded bg-stone-800">
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-600">
                      {t('mockCard.photoPlaceholder')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 space-y-6 md:order-2">
            <Badge className="bg-amber-500 text-stone-900 hover:bg-amber-400">
              {t('badge')}
            </Badge>
            <h2 className="font-heading text-3xl font-bold md:text-4xl">
              {t('title')
                .split('\n')
                .map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
            </h2>
            <p className="text-lg text-stone-300">{t('description')}</p>
            <ul className="space-y-3">
              {(t.raw('features') as string[]).map((feature: string) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-emerald-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
