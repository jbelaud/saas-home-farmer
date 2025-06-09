import Link from 'next/link'
import {getTranslations, setRequestLocale} from 'next-intl/server'
import {PropsWithChildren} from 'react'

import {ModeToggle} from '@/components/theme-toggle'
import {Button} from '@/components/ui/button'
import {routing} from '@/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params
  setRequestLocale(locale)
  const t = await getTranslations({locale, namespace: 'PublicLayout'})

  return {
    title: t('title'),
    description: t('description'),
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}))
}

export default function PublicLayout({children}: PropsWithChildren) {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-14 items-center justify-center">
            <div className="flex flex-1 items-center justify-start space-x-4">
              <Link className="flex items-center space-x-2 font-bold" href="/">
                <span>Home</span>
              </Link>
              <Link
                className="flex items-center space-x-2 font-bold"
                href="/privacy"
              >
                <span>Privacy</span>
              </Link>

              <Link
                className="flex items-center space-x-2 font-bold"
                href="/terms"
              >
                <span>Terms</span>
              </Link>

              <div className="hidden items-center space-x-2 md:flex"></div>
            </div>

            <div className="flex flex-1 items-center justify-end space-x-2">
              <div className="flex items-center gap-2">
                <Button asChild>
                  <Link href="/login">Connexion</Link>
                </Button>
                <ModeToggle />
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main className="w-full flex-1">{children}</main>

      <footer className="border-t">
        <div className="container mx-auto flex h-14 items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <div className="text-center">
            © {new Date().getFullYear()} Mike Codeur SaaS boilerplate. All
            rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
