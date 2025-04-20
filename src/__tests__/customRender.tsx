import {ReactElement} from 'react'
import {cleanup, render} from '@testing-library/react'
import {afterEach} from 'vitest'
import {ThemeProvider} from '@/components/theme-provider'

afterEach(() => {
  cleanup()
})

const customRender = (ui: ReactElement, options = {}) =>
  render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({children}) => (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    ),
    ...options,
  })

export * from '@testing-library/react'
export {default as userEvent} from '@testing-library/user-event'

export {customRender as render}
