import {Leaf} from 'lucide-react'
import Link from 'next/link'
import {useTranslations} from 'next-intl'

import ButtonConnexionDashboard from '@/components/features/auth/button-connexion-dashboard'
import {Button} from '@/components/ui/button'

export function LandingHeader() {
  const t = useTranslations('HomePage')

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-stone-900">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl">MyHomeFarmer</span>
        </div>

        <nav className="hidden gap-8 md:flex">
          <Link
            href="#features"
            className="hover:text-primary text-sm font-medium text-stone-600"
          >
            {t('navigation.features')}
          </Link>
          <Link
            href="#serenity"
            className="hover:text-primary text-sm font-medium text-stone-600"
          >
            {t('navigation.serenity')}
          </Link>
          <Link
            href="#pricing"
            className="hover:text-primary text-sm font-medium text-stone-600"
          >
            {t('navigation.pricing')}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <ButtonConnexionDashboard />
          <Button asChild size="sm">
            <Link href="/register">{t('hero.cta')}</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
