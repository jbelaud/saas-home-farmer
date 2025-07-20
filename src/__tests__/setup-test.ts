import '@testing-library/jest-dom/vitest'

import React from 'react'
import {beforeAll, vi} from 'vitest'

console.log('React version:', React.version)
console.log('typeof React.act:', typeof React.act)

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
})
