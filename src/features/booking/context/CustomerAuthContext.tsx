import {
  fetchMyProfile,
  requestAuthCode,
  updateMyProfile as updateProfileApi,
  verifyAuthCode,
} from '@libs/scheduler/api'
import type { CustomerProfile } from '@libs/scheduler/types'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'

export const CUSTOMER_TOKEN_STORAGE_KEY = 'ka_customer_token'

export interface CustomerAuthContextValue {
  token: string | null
  customer: CustomerProfile | null
  isLoading: boolean
  requestCode: (phoneNumber: string) => Promise<{ message: string }>
  verifyCode: (payload: {
    phoneNumber: string
    code: string
    firstName?: string
    lastName?: string
  }) => Promise<void>
  logout: () => void
  updateProfile: (payload: {
    firstName?: string
    lastName?: string
    email?: string
  }) => Promise<void>
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null)

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY)
    } catch {
      return null
    }
  })
  const [customer, setCustomer] = useState<CustomerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return Boolean(localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY))
    } catch {
      return false
    }
  })

  useEffect(() => {
    let isMounted = true
    if (token) {
      fetchMyProfile(token)
        .then((profile) => {
          if (isMounted) {
            setCustomer(profile)
            setIsLoading(false)
          }
        })
        .catch(() => {
          if (isMounted) {
            try {
              localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY)
            } catch {
              // ignore
            }
            setToken(null)
            setCustomer(null)
            setIsLoading(false)
          }
        })
    } else {
      setIsLoading(false)
    }

    return () => {
      isMounted = false
    }
  }, [token])

  const requestCode = useCallback(async (phoneNumber: string) => {
    return requestAuthCode(phoneNumber)
  }, [])

  const verifyCode = useCallback(
    async (payload: {
      phoneNumber: string
      code: string
      firstName?: string
      lastName?: string
    }) => {
      const response = await verifyAuthCode(payload)
      const newToken = response.token
      try {
        localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, newToken)
      } catch {
        // ignore storage errors
      }
      setToken(newToken)
      try {
        const profile = await fetchMyProfile(newToken)
        setCustomer(profile)
      } catch {
        // If profile fetch fails right after verify, customer will populate on demand
      }
    },
    [],
  )

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY)
    } catch {
      // ignore
    }
    setToken(null)
    setCustomer(null)
  }, [])

  const updateProfile = useCallback(
    async (payload: {
      firstName?: string
      lastName?: string
      email?: string
    }) => {
      if (!token) {
        throw new Error('Musisz być zalogowany, aby zaktualizować profil.')
      }
      const updated = await updateProfileApi(token, payload)
      setCustomer(updated)
    },
    [token],
  )

  return (
    <CustomerAuthContext.Provider
      value={{
        token,
        customer,
        isLoading,
        requestCode,
        verifyCode,
        logout,
        updateProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  )
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext)
  if (!ctx) {
    throw new Error(
      'useCustomerAuth must be used within a CustomerAuthProvider',
    )
  }
  return ctx
}
