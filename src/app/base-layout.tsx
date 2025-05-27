import React, {ReactNode} from 'react'

import {ThemeProvider} from '@/components/theme-provider'
import {GoogleAnalytics} from '@next/third-parties/google'
import NextAuthProvider from '@/components/context/auth-provider'
import {Toaster} from 'sonner'

type Props = {
  children: ReactNode
}

export default async function BaseLayout({children}: Props) {
  const gtag = 'G-NWRT5G95RE'
  return (
    <html lang={'fr'} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="theme"
          disableTransitionOnChange
        >
          <NextAuthProvider>{children}</NextAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={gtag} />
    </html>
  )
}
