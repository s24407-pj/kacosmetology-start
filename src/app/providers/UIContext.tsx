import type { UIContextType } from '@app-types/types'
import { createContext, use } from 'react'

export const UIContext = createContext<UIContextType | undefined>(undefined)

export const useUI = () => {
  const context = use(UIContext)
  if (!context) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}
