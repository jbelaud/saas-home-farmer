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

// Ce hack ne tente PAS de redéfinir React.act, juste de patcher Testing Library si nécessaire
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (!(React as any).act && TestUtils.act) {
  console.warn(
    '⚠️ React.act is missing, patching Testing Library fallback to TestUtils.act'
  )
  // Patch global utilisé par @testing-library/react pour choisir act()
  // @ts-expect-error pour la CI
  globalThis['__REACT_TEST_LIB_ACT__'] = TestUtils.act
}
