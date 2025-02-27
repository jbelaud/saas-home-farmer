import {Metadata} from 'next'
import Link from 'next/link'
import {PropsWithChildren} from 'react'

import {ModeToggle} from '@/components/theme-toggle'

export const metadata: Metadata = {
  title: 'App',
  description: "Page d'app",
}

export default function AppLayout({children}: PropsWithChildren) {
  return (
    <div className="flex h-screen flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex h-14 items-center justify-center">
            <div className="flex flex-1 items-center justify-start space-x-4">
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

            <div className="flex flex-1 justify-center">
              {/* Logo ou titre centré pourrait aller ici */}
            </div>

            <div className="flex flex-1 items-center justify-end space-x-2">
              <Link
                className="text-sm font-semibold underline sm:hidden"
                href="/exercises"
              >
                Home
              </Link>
              <Link
                className="text-sm font-semibold underline sm:hidden"
                href="/instructions"
              >
                Instructions
              </Link>

              <ModeToggle />
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
