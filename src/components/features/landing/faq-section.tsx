import {getTranslations} from 'next-intl/server'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export async function FaqSection({locale}: {locale: string}) {
  const t = await getTranslations({locale, namespace: 'HomePage.faq'})

  const items = [
    {q: t('q1'), a: t('a1')},
    {q: t('q2'), a: t('a2')},
    {q: t('q3'), a: t('a3')},
  ]

  return (
    <section className="bg-stone-50 py-20">
      <div className="container mx-auto max-w-3xl px-4">
        <h2 className="font-heading mb-10 text-center text-3xl font-bold">
          {t('title')}
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
