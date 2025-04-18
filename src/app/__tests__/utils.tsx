import {ThemeProvider} from '@/components/theme-provider'
import React from 'react'

export const WrapperContext = ({children}: {children: React.ReactNode}) => {
  return <ThemeProvider>{children}</ThemeProvider>
}
