import '@testing-library/jest-dom/vitest'
import { CustomerAuthProvider } from '@features/booking/hooks/useCustomerAuth'
import * as api from '@libs/scheduler/api'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AuthStep from './AuthStep'

describe('AuthStep', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <CustomerAuthProvider>{children}</CustomerAuthProvider>
  )

  it('renders phone input and submits phone number to request OTP code', async () => {
    vi.spyOn(api, 'requestAuthCode').mockResolvedValue({
      message: 'Kod wysłany',
    })

    render(<AuthStep onSuccess={vi.fn()} onBack={vi.fn()} />, { wrapper })

    const phoneInput = screen.getByLabelText('Numer telefonu')
    fireEvent.change(phoneInput, { target: { value: '726 154 460' } })

    const submitBtn = screen.getByRole('button', { name: /Wyślij kod SMS/i })
    fireEvent.click(submitBtn)

    await vi.waitFor(() => {
      expect(api.requestAuthCode).toHaveBeenCalledWith('+48726154460')
      expect(screen.getByLabelText(/Kod z wiadomości SMS/i)).toBeInTheDocument()
    })
  })

  it('validates OTP code and calls onSuccess', async () => {
    vi.spyOn(api, 'requestAuthCode').mockResolvedValue({
      message: 'Kod wysłany',
    })
    vi.spyOn(api, 'verifyAuthCode').mockResolvedValue({ token: 'test-jwt' })
    vi.spyOn(api, 'fetchMyProfile').mockResolvedValue({
      id: 1,
      phoneNumber: '+48726154460',
      firstName: 'Katarzyna',
      lastName: 'Suwalska',
    })

    const handleSuccess = vi.fn()
    render(<AuthStep onSuccess={handleSuccess} onBack={vi.fn()} />, { wrapper })

    // Step 1: Phone
    const phoneInput = screen.getByLabelText('Numer telefonu')
    fireEvent.change(phoneInput, { target: { value: '726 154 460' } })
    fireEvent.click(screen.getByRole('button', { name: /Wyślij kod SMS/i }))

    // Step 2: Code
    await vi.waitFor(() => {
      expect(screen.getByLabelText(/Kod z wiadomości SMS/i)).toBeInTheDocument()
    })

    const codeInput = screen.getByLabelText(/Kod z wiadomości SMS/i)
    fireEvent.change(codeInput, { target: { value: '1234' } })

    const verifyBtn = screen.getByRole('button', {
      name: /Zatwierdź kod i kontynuuj/i,
    })
    fireEvent.click(verifyBtn)

    await vi.waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledTimes(1)
    })
  })
})
