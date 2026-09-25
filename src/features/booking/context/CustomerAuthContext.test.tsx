import * as api from '@libs/scheduler/api'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CUSTOMER_TOKEN_STORAGE_KEY,
  CustomerAuthProvider,
  useCustomerAuth,
} from './CustomerAuthContext'

describe('CustomerAuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CustomerAuthProvider>{children}</CustomerAuthProvider>
  )

  it('initializes with no token and not loading when storage empty', async () => {
    const { result } = renderHook(() => useCustomerAuth(), { wrapper })
    expect(result.current.token).toBeNull()
    expect(result.current.customer).toBeNull()
  })

  it('restores stored token and loads profile on mount', async () => {
    localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, 'saved-token')
    vi.spyOn(api, 'fetchMyProfile').mockResolvedValue({
      id: 1,
      phoneNumber: '+48726154460',
      firstName: 'Katarzyna',
      lastName: 'Suwalska',
    })

    const { result } = renderHook(() => useCustomerAuth(), { wrapper })

    await vi.waitFor(() => {
      expect(result.current.customer).toEqual({
        id: 1,
        phoneNumber: '+48726154460',
        firstName: 'Katarzyna',
        lastName: 'Suwalska',
      })
    })
    expect(result.current.token).toBe('saved-token')
  })

  it('clears token if stored token fails profile fetch (expired)', async () => {
    localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, 'expired-token')
    vi.spyOn(api, 'fetchMyProfile').mockRejectedValue(new Error('Unauthorized'))

    const { result } = renderHook(() => useCustomerAuth(), { wrapper })

    await vi.waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.token).toBeNull()
    expect(localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('verifyCode updates token, saves to storage, and fetches profile', async () => {
    vi.spyOn(api, 'verifyAuthCode').mockResolvedValue({
      token: 'new-valid-token',
    })
    vi.spyOn(api, 'fetchMyProfile').mockResolvedValue({
      id: 2,
      phoneNumber: '+48500100200',
      firstName: 'Jan',
      lastName: 'Nowak',
    })

    const { result } = renderHook(() => useCustomerAuth(), { wrapper })

    await act(async () => {
      await result.current.verifyCode({
        phoneNumber: '+48500100200',
        code: '123456',
        firstName: 'Jan',
        lastName: 'Nowak',
      })
    })

    expect(result.current.token).toBe('new-valid-token')
    expect(localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY)).toBe(
      'new-valid-token',
    )
    expect(result.current.customer?.firstName).toBe('Jan')
  })

  it('logout removes token and clears customer state', async () => {
    localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, 'some-token')
    const { result } = renderHook(() => useCustomerAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(result.current.token).toBeNull()
    expect(result.current.customer).toBeNull()
    expect(localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY)).toBeNull()
  })

  it('throws error when used outside CustomerAuthProvider', () => {
    expect(() => renderHook(() => useCustomerAuth())).toThrow(
      'useCustomerAuth must be used within a CustomerAuthProvider',
    )
  })
})
