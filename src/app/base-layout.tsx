import {GoogleAnalytics} from '@next/third-parties/google'
import React, {ReactNode} from 'react'

import {AppProviders} from '@/components/context/app-providers'

type Props = {
  children: ReactNode
}

export default async function BaseLayout({children}: Props) {
  const gtag = 'G-NWRT5G95RE'
  return (
    <html lang={'fr'} suppressHydrationWarning>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
      <GoogleAnalytics gaId={gtag} />
    </html>
  )
}
