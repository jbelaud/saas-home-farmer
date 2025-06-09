import {BarChart2, ShieldCheck, Zap} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {getTranslations, setRequestLocale} from 'next-intl/server'

import ButtonConnexionDashboard from '@/components/features/auth/button-connexion-dashboard'
import ImageTheme from '@/components/image-theme'
import {ModeToggle} from '@/components/theme-toggle'
import {Button} from '@/components/ui/button'
import {routing} from '@/i18n/routing'
import {APP_NAME} from '@/lib/constants'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const t = await getTranslations({locale, namespace: 'HomePage'})

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
}

export default async function Home({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const t = await getTranslations('HomePage')
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-border bg-background/80 relative flex w-full items-center border-b px-8 py-6 backdrop-blur">
        <div className="flex items-center gap-2">
          {/* <Image src="/next.svg" alt="Logo" width={32} height={32} /> */}
          <ImageTheme
            className="relative z-10"
            src="/next.svg"
            srcDark="/next-inverted.svg"
            alt="App Logo"
            width={32}
            height={32}
            priority
          />
          <span className="text-xl font-bold tracking-tight">{APP_NAME}</span>
        </div>
        <nav className="absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 gap-8 text-sm font-medium md:flex">
          <Link href="#features" className="hover:text-primary transition">
            {t('navigation.features')}
          </Link>
          <Link href="/pricing" className="hover:text-primary transition">
            {t('navigation.pricing')}
          </Link>
          <Link href="/contact" className="hover:text-primary transition">
            {t('navigation.contact')}
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ButtonConnexionDashboard />
          <ModeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="mx-auto mb-4 max-w-4xl text-4xl font-bold md:text-6xl">
          {t('hero.title')}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xl text-lg">
          {t('hero.description')}
        </p>
        <Button size="lg" className="mb-8">
          <Link href="/register">{t('hero.cta')}</Link>
        </Button>
      </section>

      {/* Image produit */}
      <div className="mb-12 flex justify-center">
        <div className="border-border bg-muted w-full max-w-3xl overflow-hidden rounded-xl border shadow-lg">
          <Image
            src="/images/product.avif" // Mets ici ton image produit
            alt="Aperçu du produit"
            width={1200}
            height={600}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>

      {/* Features */}
      <section
        id="features"
        className="mx-auto mb-16 flex max-w-5xl flex-col items-stretch justify-center gap-8 px-4 md:flex-row"
      >
        <div className="bg-background border-border flex-1 rounded-xl border p-8 text-center shadow-sm">
          <Zap className="text-primary mx-auto mb-4" size={40} />
          <h3 className="mb-2 text-lg font-semibold">
            {t('features.automation.title')}
          </h3>
          <p className="text-muted-foreground">
            {t('features.automation.description')}
          </p>
        </div>
        <div className="bg-background border-border flex-1 rounded-xl border p-8 text-center shadow-sm">
          <BarChart2 className="text-primary mx-auto mb-4" size={40} />
          <h3 className="mb-2 text-lg font-semibold">
            {t('features.analytics.title')}
          </h3>
          <p className="text-muted-foreground">
            {t('features.analytics.description')}
          </p>
        </div>
        <div className="bg-background border-border flex-1 rounded-xl border p-8 text-center shadow-sm">
          <ShieldCheck className="text-primary mx-auto mb-4" size={40} />
          <h3 className="mb-2 text-lg font-semibold">
            {t('features.security.title')}
          </h3>
          <p className="text-muted-foreground">
            {t('features.security.description')}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border bg-background/80 mt-auto w-full border-t px-4 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 text-left md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <ImageTheme
                className="relative z-10"
                src="/next.svg"
                srcDark="/next-inverted.svg"
                alt="App Logo"
                width={28}
                height={28}
                priority
              />
              <span className="text-lg font-bold">{APP_NAME}</span>
            </div>
            <p className="text-muted-foreground mb-2 text-sm">
              {t('footer.byMike')}
            </p>
            <p className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} {APP_NAME}.{' '}
              {t('footer.allRightsReserved')}
            </p>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">{t('footer.product.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="hover:underline">
                  {t('footer.product.features')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.product.pricing')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.product.demo')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.product.updates')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">
              {t('footer.resources.title')}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.resources.documentation')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.resources.blog')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.resources.support')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.resources.api')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold">{t('footer.legal.title')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.legal.terms')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.legal.privacy')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.legal.contact')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline">
                  {t('footer.legal.careers')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
