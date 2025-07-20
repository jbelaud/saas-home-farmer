import {renderHook} from '@testing-library/react'
import {act} from '@testing-library/react'
import {useTheme} from 'next-themes'
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'

import {WrapperContext} from './utils'

describe('Theme', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: undefined,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  afterEach(() => {
    window.localStorage.removeItem('theme')
  })

  it("Theme default is 'system'", () => {
    const {result: themeResult} = renderHook(() => useTheme(), {
      wrapper: WrapperContext,
    })

    act(() => {
      expect(themeResult.current.theme).toBe('system')
    })
  })

  it('Theme hook provides setTheme function', () => {
    const {result: themeResult} = renderHook(() => useTheme(), {
      wrapper: WrapperContext,
    })

    act(() => {
      expect(typeof themeResult.current.setTheme).toBe('function')
    })
  })

  it('Theme hook provides themes array', () => {
    const {result: themeResult} = renderHook(() => useTheme(), {
      wrapper: WrapperContext,
    })

    act(() => {
      expect(Array.isArray(themeResult.current.themes)).toBe(true)
      expect(themeResult.current.themes).toContain('light')
      expect(themeResult.current.themes).toContain('dark')
      expect(themeResult.current.themes).toContain('system')
    })
  })
})
