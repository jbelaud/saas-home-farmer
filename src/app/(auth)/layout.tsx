import {Metadata} from 'next'
import Link from 'next/link'
import {PropsWithChildren} from 'react'

import {ModeToggle} from '@/components/theme-toggle'
import {APP_DESCRIPTION} from '@/lib/constants'

export const metadata: Metadata = {
  title: APP_DESCRIPTION,
  description: 'Authentication',
}

export default function AuthLayout({children}: PropsWithChildren) {
  return (
    <div className="bg-muted/10 dark:bg-background flex min-h-screen flex-col">
      {/* En-tête avec navigation */}

      {/* Contenu principal centré */}
      <main className="bg-muted flex flex-1 items-center justify-center">
        <div className="w-full max-w-md px-4 py-8">{children}</div>
      </main>

      {/* Pied de page simple */}
      <footer className="bg-background text-muted-foreground border-t py-4 text-center text-sm">
        <div className="container mx-auto">
          © {new Date().getFullYear()} - {APP_DESCRIPTION}
        </div>
      </footer>
    </div>
  )
}
