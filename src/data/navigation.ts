import type { BottomNavItemData, MainNavItemData } from '@app-types/types'

export const MAIN_NAV_ITEMS: MainNavItemData[] = [
  { id: 'start', label: 'Start', to: '/' },
  { id: 'kosmetologia', label: 'Kosmetologia', to: '/kosmetologia' },
  { id: 'trychologia', label: 'Trychologia', to: '/trychologia' },
  { id: 'oprawa-oka', label: 'Oprawa oka', to: '/oprawa-oka' },
  { id: 'o-mnie', label: 'O mnie', to: '/', hash: 'o-mnie' },
  { id: 'galeria', label: 'Galeria', to: '/galeria' },
  { id: 'opinie', label: 'Opinie', to: '/', hash: 'opinie' },
  { id: 'kontakt', label: 'Kontakt', to: '/', hash: 'kontakt' },
]

export const BOTTOM_NAV_ITEMS: BottomNavItemData[] = [
  { id: 'kosmetologia', label: 'Kosmetologia', to: '/kosmetologia' },
  { id: 'trychologia', label: 'Trychologia', to: '/trychologia' },
  { id: 'galeria', label: 'Galeria', to: '/galeria' },
  { id: 'kontakt', label: 'Kontakt', to: '/', hash: 'kontakt' },
]
