'use client'

import {PropsWithChildren} from 'react'

import {Toaster} from '@/components/ui/sonner'
import {User} from '@/services/types/domain/user-types'

import AuthProvider from './auth-provider'
import {QueryProvider} from './query-provider'
import {ThemeProvider} from './theme-provider'

interface AppProvidersProps extends PropsWithChildren {
  initialUser?: User | null
}

export function AppProviders({children}: AppProvidersProps) {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        storageKey="theme"
        disableTransitionOnChange
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  )
}
