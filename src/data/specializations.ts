import type {
  ServiceArea,
  ServiceCategory,
  ServiceSpecializationId,
} from '@app-types/types'

export interface Specialization {
  id: ServiceSpecializationId
  area: ServiceArea
  category: Exclude<ServiceCategory, 'online'>
  path: '/kosmetologia' | '/oprawa-oka' | '/trychologia'
  name: string
  description: string
  stationaryServiceCount: number
  includesOnlineConsultation: boolean
  consultationServiceId:
    | 'service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem'
    | 'service-pierwsza-konsultacja-trychologiczna'
}

export const specializations: readonly Specialization[] = [
  {
    id: 'cosmetology',
    area: 'cosmetology',
    category: 'cosmetology',
    path: '/kosmetologia',
    name: 'Kosmetologia',
    description:
      'Indywidualne terapie skóry, zabiegi pielęgnacyjne i świadoma opieka kosmetologiczna.',
    consultationServiceId:
      'service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem',
    stationaryServiceCount: 12,
    includesOnlineConsultation: true,
  },
  {
    id: 'eye-styling',
    area: 'cosmetology',
    category: 'eye-styling',
    path: '/oprawa-oka',
    name: 'Oprawa oka',
    description:
      'Stylizacja brwi i rzęs dopasowana do urody, kondycji włosków i oczekiwanego efektu.',
    consultationServiceId:
      'service-pierwsza-konsultacja-kosmetologiczna-z-zabiegiem',
    stationaryServiceCount: 7,
    includesOnlineConsultation: false,
  },
  {
    id: 'trichology',
    area: 'trichology',
    category: 'trichology',
    path: '/trychologia',
    name: 'Trychologia',
    description:
      'Diagnostyka skóry głowy, konsultacje trychologiczne i wsparcie w problemach dotyczących włosów.',
    consultationServiceId: 'service-pierwsza-konsultacja-trychologiczna',
    stationaryServiceCount: 4,
    includesOnlineConsultation: true,
  },
]

export const stationaryServiceCount = specializations.reduce(
  (sum, specialization) => sum + specialization.stationaryServiceCount,
  0,
)

export function getSpecialization(id: ServiceSpecializationId) {
  return specializations.find((specialization) => specialization.id === id)
}
