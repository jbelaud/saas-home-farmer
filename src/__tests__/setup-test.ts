import '@testing-library/jest-dom/vitest'

import {beforeAll, vi} from 'vitest'

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

import * as React from 'react'
import * as TestUtils from 'react-dom/test-utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof (React as any).act !== 'function') {
  // Vérifie que la propriété n’est pas "read-only"
  const descriptor = Object.getOwnPropertyDescriptor(React, 'act')

  if (!descriptor || descriptor.writable || descriptor.configurable) {
    console.warn(
      '⚠️ React.act is missing, patching with react-dom/test-utils.act'
    )

    // eslint-disable-next-line no-import-assign
    Object.defineProperty(React, 'act', {
      value: TestUtils.act,
      writable: true,
      configurable: true,
    })
  } else {
    console.warn('❌ React.act is missing but not patchable (read-only)')
  }
}
