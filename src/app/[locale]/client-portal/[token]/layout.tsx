import {Leaf} from 'lucide-react'
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
            Ce lien d&apos;acc&egrave;s n&apos;est plus valide ou a
            expir&eacute;.
          </p>
          <p className="mt-2 text-sm text-stone-400">
            Contactez votre jardinier pour obtenir un nouveau lien.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-stone-50">
      {/* Header */}
      <header className="border-b border-emerald-100 bg-emerald-700 text-white">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <Link
            href={`/${locale}/client-portal/${token}`}
            className="flex items-center gap-2"
          >
            <Leaf className="h-5 w-5" />
            <span className="font-semibold">Mon Potager</span>
          </Link>
          <span className="text-sm text-emerald-100">
            {client.firstName} {client.lastName}
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-lg items-center justify-around py-2">
          <Link
            href={`/${locale}/client-portal/${token}`}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-stone-600 hover:text-emerald-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"
              />
            </svg>
            Accueil
          </Link>
          <Link
            href={`/${locale}/client-portal/${token}/harvests`}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-stone-600 hover:text-emerald-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            R&eacute;coltes
          </Link>
          <Link
            href={`/${locale}/client-portal/${token}/visits`}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-xs text-stone-600 hover:text-emerald-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            Visites
          </Link>
        </div>
      </nav>
    </div>
  )
}
