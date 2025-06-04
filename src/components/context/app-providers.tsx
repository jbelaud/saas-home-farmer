'use client'

import {PropsWithChildren} from 'react'

import {Toaster} from '@/components/ui/sonner'
import {User} from '@/services/types/domain/user-types'

import NextAuthProvider from './auth-provider'
import {ThemeProvider} from './theme-provider'

interface AppProvidersProps extends PropsWithChildren {
  initialUser?: User | null
}

export function AppProviders({children}: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      disableTransitionOnChange
    >
      <NextAuthProvider>
        {children}
        <Toaster />
      </NextAuthProvider>
    </ThemeProvider>
  )
}
