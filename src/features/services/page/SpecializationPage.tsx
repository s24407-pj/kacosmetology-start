import type { ServiceSpecializationId } from '@app-types/types'
import {
  Heading,
  Section,
  SectionHeader,
  ServiceCard,
  Text,
} from '@components/ui'
import { getServicesByArea } from '@data/services'
import { getSpecialization } from '@data/specializations'
import BooksyLink from '@widgets/actions/BooksyLink'
import { SpecializationEditorialSection } from '../sections/SpecializationEditorialSection'
import { SpecializationHero } from '../sections/SpecializationHero'

const content = {
  cosmetology: {
    eyebrow: 'Świadoma opieka nad skórą',
    intro:
      'Każda terapia rozpoczyna się od poznania potrzeb skóry. Dobór zabiegu uwzględnia jej aktualny stan, pielęgnację i indywidualne cele.',
    process:
      'Jeżeli nie wiesz, który zabieg wybrać, zacznij od konsultacji kosmetologicznej. Podczas spotkania wspólnie ustalimy bezpieczny kierunek postępowania.',
    heroAction: 'Umów konsultację',
    image: {
      src: '/images/specializations/cosmetology.webp',
      alt: 'Zabieg pielęgnacyjny twarzy z aplikacją maski w gabinecie',
    },
  },
  'eye-styling': {
    eyebrow: 'Naturalnie podkreślone spojrzenie',
    intro:
      'Zabiegi oprawy oka dobieram do rysów twarzy, kondycji brwi i rzęs oraz efektu, który chcesz uzyskać.',
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
    process:
      'Treści na stronie mają charakter informacyjny i nie zastępują diagnozy lekarskiej. Dobór terapii wymaga indywidualnej konsultacji.',
    heroAction: 'Umów konsultację',
    image: {
      src: '/images/specializations/trichology.webp',
      alt: 'Mycie i masaż skóry głowy podczas zabiegu w salonie',
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
      <SpecializationHero
        specializationId={specializationId}
        eyebrow={copy.eyebrow}
        title={
          specializationId === 'trichology'
            ? 'Trycholog w Starogardzie Gdańskim'
            : specialization.name
        }
        description={copy.intro}
        image={copy.image}
        actions={
          <BooksyLink
            placement="specialization-hero"
            area={specialization.area}
          >
            {copy.heroAction}
          </BooksyLink>
        }
      />
      <SpecializationEditorialSection specializationId={specializationId} />
      {featured.length ? (
        <Section background="gray">
          <div className="mx-auto max-w-6xl">
            <SectionHeader
              eyebrow="Dobry pierwszy krok"
              title="Polecane na początek"
            />
            <div className="grid gap-x-10 md:grid-cols-2">
              {featured.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  revealDelay={index % 6}
                />
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
          />
          <div className="grid gap-x-10 md:grid-cols-2">
            {remainingServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                revealDelay={index % 6}
              />
            ))}
          </div>
          {onlineServices.length ? (
            <section className="mt-14 border-t border-border-default pt-10">
              <Heading level={3} variant="content" className="mb-5">
                Konsultacja online
              </Heading>
              <div className="grid gap-x-10 md:grid-cols-2">
                {onlineServices.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    revealDelay={index % 6}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </Section>
      <Section background="gray">
        <div className="mx-auto max-w-3xl text-center">
          <Heading level={2} variant="section">
            Jak zacząć?
          </Heading>
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
