import type { BottomNavItemData, MainNavItemData } from '@app-types/types'

export const MAIN_NAV_ITEMS: MainNavItemData[] = [
  { id: 'hero', label: 'Start' },
  { id: 'o-mnie', label: 'O mnie' },
  { id: 'zabiegi', label: 'Zabiegi' },
  { id: 'efekty', label: 'Efekty' },
  { id: 'galeria', label: 'Galeria' },
  { id: 'opinie', label: 'Opinie' },
  { id: 'kontakt', label: 'Kontakt' },
]

export const BOTTOM_NAV_ITEMS: BottomNavItemData[] = [
  { id: 'zabiegi', label: 'Zabiegi' },
  { id: 'efekty', label: 'Efekty' },
  { id: 'opinie', label: 'Opinie' },
  { id: 'kontakt', label: 'Kontakt' },
]
