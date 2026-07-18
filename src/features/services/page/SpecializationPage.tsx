import type { ServiceSpecializationId } from '@app-types/types'
import {
  Heading,
  PageHero,
  Section,
  SectionHeader,
  ServiceCard,
  Text,
} from '@components/ui'
import { getServicesByArea } from '@data/services'
import { getSpecialization } from '@data/specializations'
import {
  IMAGE_SIZES,
  MOBILE_WIDTHS,
  webpFallbackSrc,
  webpSrcSet,
} from '@libs/responsiveImage'
import BooksyLink from '@widgets/actions/BooksyLink'
import { Check } from 'lucide-react'

const content = {
  cosmetology: {
    eyebrow: 'Świadoma opieka nad skórą',
    intro:
      'Każda terapia rozpoczyna się od poznania potrzeb skóry. Dobór zabiegu uwzględnia jej aktualny stan, pielęgnację i indywidualne cele.',
    concerns: [
      'trądzik i niedoskonałości',
      'przebarwienia',
      'suchość i wrażliwość',
      'oznaki starzenia',
    ],
    process:
      'Jeżeli nie wiesz, który zabieg wybrać, zacznij od konsultacji kosmetologicznej. Podczas spotkania wspólnie ustalimy bezpieczny kierunek postępowania.',
    heroAction: 'Umów konsultację',
    image: {
      src: '/images/specializations/cosmetology.webp',
      alt: 'Aplikacja preparatu pielęgnacyjnego podczas zabiegu kosmetologicznego',
    },
  },
  'eye-styling': {
    eyebrow: 'Naturalnie podkreślone spojrzenie',
    intro:
      'Zabiegi oprawy oka dobieram do rysów twarzy, kondycji brwi i rzęs oraz efektu, który chcesz uzyskać.',
    concerns: [
      'niesforne lub nieregularne brwi',
      'potrzeba subtelnego podkreślenia koloru',
      'rzęsy wymagające uniesienia',
      'naturalny efekt bez codziennego makijażu',
    ],
    process:
      'Jeżeli nie wiesz, który wariant wybrać, opowiedz mi o oczekiwanym efekcie przed wizytą. Dobierzemy usługę odpowiednią do brwi, rzęs i wrażliwości skóry.',
    heroAction: 'Umów wizytę',
    image: {
      src: '/images/specializations/eye-styling.webp',
      alt: 'Naturalna oprawa oka z widoczną brwią i rzęsami',
    },
  },
  trichology: {
    eyebrow: 'Indywidualna opieka nad skórą głowy',
    intro:
      'Konsultacja trychologiczna obejmuje szczegółowy wywiad i badanie skóry głowy. Na tej podstawie powstaje indywidualny plan dalszego postępowania.',
    concerns: [
      'wypadanie i przerzedzenie włosów',
      'łupież i łojotok',
      'świąd skóry głowy',
      'osłabiona kondycja włosów',
    ],
    process:
      'Treści na stronie mają charakter informacyjny i nie zastępują diagnozy lekarskiej. Dobór terapii wymaga indywidualnej konsultacji.',
    heroAction: 'Umów konsultację',
    image: {
      src: '/images/specializations/trichology.webp',
      alt: 'Delikatna praca przy skórze głowy podczas zabiegu',
    },
  },
} as const

export function SpecializationPage({
  specializationId,
}: {
  specializationId: ServiceSpecializationId
}) {
  const specialization = getSpecialization(specializationId)
  if (!specialization) return null
  const copy = content[specializationId]
  const areaServices = getServicesByArea(specialization.area).filter(
    (service) => service.isPublished,
  )
  const services = areaServices.filter(
    (service) => service.category === specialization.category,
  )
  const onlineServices = specialization.includesOnlineConsultation
    ? areaServices.filter((service) => service.category === 'online')
    : []
  const featured = services.filter((service) => service.featured)
  const remainingServices = services.filter((service) => !service.featured)

  return (
    <>
      <PageHero
        eyebrow={copy.eyebrow}
        title={specialization.name}
        description={copy.intro}
        actions={
          <BooksyLink
            placement="specialization-hero"
            area={specialization.area}
          >
            {copy.heroAction}
          </BooksyLink>
        }
        media={
          <img
            src={webpFallbackSrc(copy.image.src)}
            srcSet={webpSrcSet(copy.image.src, MOBILE_WIDTHS)}
            sizes={IMAGE_SIZES.specializationHero}
            alt={copy.image.alt}
            width={1080}
            height={810}
            loading="eager"
            className="aspect-[4/3] w-full rounded-lg border border-border-default object-cover object-center shadow-subtle"
          />
        }
      />
      <Section background="white">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Kiedy warto się zgłosić"
            title="Najczęstsze potrzeby"
            gradient
          />
          <ul className="grid border-y border-border-default sm:grid-cols-2">
            {copy.concerns.map((concern) => (
              <li
                key={concern}
                className="flex items-center gap-4 border-b border-border-default px-1 py-4 font-body text-lg last:border-b-0 sm:[&:nth-last-child(-n+2)]:border-b-0"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center text-action">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </span>
                {concern}
              </li>
            ))}
          </ul>
        </div>
      </Section>
      {featured.length ? (
        <Section background="gray">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Dobry pierwszy krok"
              title="Polecane na początek"
              gradient
            />
            <div className="grid gap-x-10 md:grid-cols-2">
              {featured.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          </div>
        </Section>
      ) : null}
      <Section background="white">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow={specialization.name}
            title="Pełna oferta"
            subtitle="Po polecanych pierwszych krokach poznaj pozostałe zabiegi dostępne w tym obszarze."
            gradient
          />
          <div className="grid gap-x-10 md:grid-cols-2">
            {remainingServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          {onlineServices.length ? (
            <section className="mt-14 border-t border-border-default pt-10">
              <Heading level={3} className="mb-5 text-2xl md:text-3xl">
                Konsultacja online
              </Heading>
              <div className="grid gap-x-10 md:grid-cols-2">
                {onlineServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </Section>
      <Section background="gray">
        <div className="mx-auto max-w-3xl text-center">
          <Heading level={2}>Jak zacząć?</Heading>
          <Text
            font="crimson"
            className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed"
          >
            {copy.process}
          </Text>
          <BooksyLink
            placement="specialization-closing"
            area={specialization.area}
            className="mt-7"
          >
            Przejdź do Booksy
          </BooksyLink>
        </div>
      </Section>
    </>
  )
}
