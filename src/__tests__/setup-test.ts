import '@testing-library/jest-dom/vitest'

import * as React from 'react'
import * as TestUtils from 'react-dom/test-utils'
import {beforeAll, vi} from 'vitest'

// Problems github action, will be removed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (React as any).act !== 'function') {
  console.warn('⚠️ React.act is missing, falling back to test-utils.act')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(React as any).act = TestUtils.act
}

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
