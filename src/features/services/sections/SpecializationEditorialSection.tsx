import type {
  PublicService,
  ServiceId,
  ServiceSpecializationId,
} from '@app-types/types'
import {
  actionLinkStyles,
  Heading,
  Section,
  SectionHeader,
  Text,
} from '@components/ui'
import { getPublicServicePath, getServiceById } from '@data/services'
import { Link } from '@tanstack/react-router'

type EditorialStep = {
  title: string
  description: string
}

type GuidedPathContent = {
  kind: 'guided-path'
  eyebrow: string
  title: string
  intro: string
  concerns: readonly string[]
  steps: readonly EditorialStep[]
}

type EffectChoice = EditorialStep & {
  serviceIds: readonly ServiceId[]
}

type EffectChoiceContent = {
  kind: 'effect-choice'
  eyebrow: string
  title: string
  intro: string
  choices: readonly EffectChoice[]
}

type EditorialContent = GuidedPathContent | EffectChoiceContent

type ServiceLookup = (serviceId: ServiceId) => PublicService | undefined
type ServicePathResolver = (service: PublicService) => string | undefined

export function resolveEditorialServices(
  serviceIds: readonly ServiceId[],
  getService: ServiceLookup = getServiceById,
  getPath: ServicePathResolver = getPublicServicePath,
) {
  return serviceIds.flatMap((serviceId) => {
    const service = getService(serviceId)
    if (!service?.isPublished) return []
    const path = getPath(service)
    return path ? [{ service, path }] : []
  })
}

const editorialContent: Record<ServiceSpecializationId, EditorialContent> = {
  cosmetology: {
    kind: 'guided-path',
    eyebrow: 'Jak wygląda pierwszy krok',
    title: 'Od potrzeby skóry do przemyślanego planu',
    intro:
      'Nie musisz samodzielnie rozpoznawać, którego zabiegu potrzebuje Twoja skóra. Punktem wyjścia jest jej aktualny stan i cel wizyty.',
    concerns: [
      'trądzik i niedoskonałości',
      'przebarwienia',
      'suchość i wrażliwość',
      'oznaki starzenia',
    ],
    steps: [
      {
        title: 'Rozpoznajemy potrzeby',
        description:
          'Rozmawiamy o aktualnym stanie skóry, codziennej pielęgnacji i celu wizyty.',
      },
      {
        title: 'Dobieramy właściwy kierunek',
        description:
          'Na tej podstawie wybieramy zabieg dopasowany do bieżącej kondycji skóry.',
      },
      {
        title: 'Planujemy dalszą opiekę',
        description:
          'Jeżeli potrzebne są kolejne spotkania, ustalamy bezpieczną kolejność zabiegów i pielęgnacji.',
      },
    ],
  },
  trichology: {
    kind: 'guided-path',
    eyebrow: 'Pierwsza konsultacja',
    title: 'Konsultacja, zanim wybierzesz zabieg',
    intro:
      'Podobne objawy mogą mieć różne podłoże, dlatego punktem wyjścia jest rozmowa i ocena skóry głowy.',
    concerns: [
      'wypadanie i przerzedzenie włosów',
      'łupież i łojotok',
      'świąd skóry głowy',
      'osłabiona kondycja włosów',
    ],
    steps: [
      {
        title: 'Szczegółowy wywiad',
        description:
          'Rozmawiamy o zdrowiu, pielęgnacji oraz obserwowanych zmianach.',
      },
      {
        title: 'Badanie skóry głowy',
        description:
          'Trichoskopia pomaga dokładniej ocenić skórę głowy i kondycję włosów.',
      },
      {
        title: 'Indywidualny plan',
        description:
          'Ustalamy dalsze postępowanie i, w razie potrzeby, zalecenia do dodatkowej diagnostyki.',
      },
    ],
  },
  'eye-styling': {
    kind: 'effect-choice',
    eyebrow: 'Wybierz oczekiwany efekt',
    title: 'Zacznij od efektu, nie od nazwy zabiegu',
    intro:
      'Pomyśl, co chcesz zmienić w codziennym wyglądzie brwi lub rzęs. Poniższe podpowiedzi ułatwią wybór odpowiedniej usługi.',
    choices: [
      {
        title: 'Nadać brwiom kształt lub kolor',
        description:
          'Dla subtelnego uporządkowania łuku, podkreślenia koloru albo obu tych efektów.',
        serviceIds: [
          'service-regulacja-brwi',
          'service-henna-brwi-z-regulacja',
          'service-farbka-z-regulacja',
        ],
      },
      {
        title: 'Ułożyć niesforne brwi',
        description:
          'Gdy włoski rosną w różnych kierunkach i zależy Ci na utrwaleniu ich kształtu.',
        serviceIds: [
          'service-laminacja-brwi-regulacja-bez-koloryzacji',
          'service-laminacja-brwi-regulacja-koloryzacja',
        ],
      },
      {
        title: 'Unieść i przyciemnić naturalne rzęsy',
        description:
          'Gdy zależy Ci na podkręceniu rzęs i podkreśleniu spojrzenia bez codziennej maskary.',
        serviceIds: ['service-lifting-rzes-farbka'],
      },
    ],
  },
}

function GuidedPath({ content }: { content: GuidedPathContent }) {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <SectionHeader
          align="left"
          eyebrow={content.eyebrow}
          title={content.title}
          subtitle={content.intro}
          className="mb-8"
        />
        <ul className="border-y border-border-default">
          {content.concerns.map((concern, index) => (
            <li
              key={concern}
              className="border-b border-border-default py-3.5 font-body text-base text-text-primary last:border-b-0"
              data-reveal-on-scroll
              data-reveal-delay={index.toString()}
            >
              {concern}
            </li>
          ))}
        </ul>
      </div>
      <ol className="border-t border-border-default lg:col-span-7 lg:mt-1">
        {content.steps.map((step, index) => (
          <li
            key={step.title}
            className="grid gap-3 border-b border-border-default py-7 sm:grid-cols-[3rem_1fr] sm:gap-5 sm:py-8"
            data-reveal-on-scroll
            data-reveal-delay={index.toString()}
          >
            <span
              aria-hidden="true"
              className="font-display text-xl font-bold text-action"
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <Heading level={3} variant="content">
                {step.title}
              </Heading>
              <Text className="mt-3 max-w-2xl leading-relaxed">
                {step.description}
              </Text>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function EffectChoices({ content }: { content: EffectChoiceContent }) {
  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-4">
        <SectionHeader
          align="left"
          eyebrow={content.eyebrow}
          title={content.title}
          subtitle={content.intro}
          className="mb-0"
        />
      </div>
      <ol className="border-t border-border-default lg:col-span-8 lg:mt-1">
        {content.choices.map((choice, index) => {
          const services = resolveEditorialServices(choice.serviceIds)

          return (
            <li
              key={choice.title}
              className="grid gap-4 border-b border-border-default py-7 sm:grid-cols-[3rem_1fr] sm:gap-5 sm:py-8"
              data-reveal-on-scroll
              data-reveal-delay={index.toString()}
            >
              <span
                aria-hidden="true"
                className="font-display text-xl font-bold text-action"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <Heading level={3} variant="content">
                  {choice.title}
                </Heading>
                <Text className="mt-3 max-w-2xl leading-relaxed">
                  {choice.description}
                </Text>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
                  {services.map(({ service, path }) => (
                    <Link
                      key={service.id}
                      to={path}
                      className={actionLinkStyles({
                        variant: 'text',
                        size: 'sm',
                        className: 'justify-start px-0',
                      })}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export function SpecializationEditorialSection({
  specializationId,
}: {
  specializationId: ServiceSpecializationId
}) {
  const content = editorialContent[specializationId]

  return (
    <Section background="white" decorated="bottom">
      <div className="mx-auto max-w-6xl">
        {content.kind === 'guided-path' ? (
          <GuidedPath content={content} />
        ) : (
          <EffectChoices content={content} />
        )}
      </div>
    </Section>
  )
}
