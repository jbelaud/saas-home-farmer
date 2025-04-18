import {describe, it, expect, beforeEach, vi, afterEach} from 'vitest'
import {useTheme} from 'next-themes'
import {WrapperContext} from '../utils'
import {act, renderHook} from '@testing-library/react'

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
  it("Theme default is 'system'", async () => {
    const {result: themeResult} = renderHook(() => useTheme(), {
      wrapper: WrapperContext,
    })
    expect(themeResult.current.theme).toBe('system')
  })

  it('Theme can be changed to light', async () => {
    const {result: themeResult} = renderHook(() => useTheme(), {
      wrapper: WrapperContext,
    })
    expect(themeResult.current.theme).toBe('system')

    act(() => {
      themeResult.current.setTheme('light')
    })
    expect(themeResult.current.theme).toBe('light')
  })

  it('Theme can be changed to dark', async () => {
    const {result: themeResult} = renderHook(() => useTheme(), {
      wrapper: WrapperContext,
    })
    expect(themeResult.current.theme).toBe('system')

    act(() => {
      themeResult.current.setTheme('dark')
    })
    expect(themeResult.current.theme).toBe('dark')
  })
})
