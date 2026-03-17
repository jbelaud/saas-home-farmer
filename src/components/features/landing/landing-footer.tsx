import {Leaf} from 'lucide-react'
import Link from 'next/link'
import {getTranslations} from 'next-intl/server'

export async function LandingFooter({locale}: {locale: string}) {
  const t = await getTranslations({locale, namespace: 'HomePage.footer'})

  return (
    <footer className="border-t bg-stone-50 py-12 text-stone-600">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl">MyHomeFarmer</span>
            </div>
            <p className="text-sm text-stone-500">
              La plateforme des entrepreneurs jardiniers.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-900">
              {t('product.title')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  {t('product.features')}
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-primary transition-colors"
                >
                  {t('product.pricing')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  {t('product.demo')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-900">
              {t('resources.title')}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-primary transition-colors"
                >
                  {t('resources.blog')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  {t('resources.support')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="font-semibold text-stone-900">{t('legal.title')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  {t('legal.terms')}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  {t('legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  {t('legal.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-stone-500">
          {t('copyright')}
        </div>
      </div>
    </footer>
  )
}
