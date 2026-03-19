import {Camera, Home, Leaf} from 'lucide-react'
import Link from 'next/link'
import {setRequestLocale} from 'next-intl/server'
import {PropsWithChildren} from 'react'

import {getClientByAccessTokenService} from '@/services/facades/client-portal-service-facade'

type Params = {locale: string; token: string}

export default async function ClientPortalLayout({
  children,
  params,
}: PropsWithChildren<{params: Promise<Params>}>) {
  const {locale, token} = await params
  setRequestLocale(locale)

  const client = await getClientByAccessTokenService(token)

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="text-center">
          <Leaf className="mx-auto mb-4 h-12 w-12 text-stone-400" />
          <h1 className="mb-2 text-xl font-bold text-stone-900">
            Lien invalide
          </h1>
          <p className="text-stone-500">
            Ce lien d&apos;accès n&apos;est plus valide ou a expiré.
          </p>
          <p className="mt-2 text-sm text-stone-400">
            Contactez votre jardinier pour obtenir un nouveau lien.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {children}

      {/* Client Bottom Nav */}
      <nav className="pb-safe fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between border-t bg-white px-6 py-2">
        <Link
          href={`/${locale}/client-portal/${token}`}
          className="text-primary hover:text-primary hover:bg-primary/5 flex flex-col items-center gap-1 rounded-lg px-3 py-2"
        >
          <Home className="h-6 w-6" />
          <span className="text-[10px] font-medium">Accueil</span>
        </Link>
        <Link
          href={`/${locale}/client-portal/${token}/visits`}
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-stone-400 hover:text-stone-600"
        >
          <Camera className="h-6 w-6" />
          <span className="text-[10px] font-medium">Photos</span>
        </Link>
        <Link
          href={`/${locale}/client-portal/${token}/harvests`}
          className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-stone-400 hover:text-stone-600"
        >
          <Leaf className="h-6 w-6" />
          <span className="text-[10px] font-medium">Récoltes</span>
        </Link>
      </nav>
    </div>
  )
}
