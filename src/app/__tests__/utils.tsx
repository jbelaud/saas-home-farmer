import React from 'react'

import {ThemeProvider} from '@/components/theme-provider'

export const WrapperContext = ({children}: {children: React.ReactNode}) => {
  return <ThemeProvider>{children}</ThemeProvider>
}
