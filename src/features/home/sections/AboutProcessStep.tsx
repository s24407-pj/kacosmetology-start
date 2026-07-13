import type {
  AboutProcessStep as AboutProcessStepData,
  AboutProcessStepIcon,
} from '@app-types/types'
import { Heading, Text } from '@components/ui'
import { cn } from '@libs/utils'
import AboutVideo from './AboutVideo'

type AboutProcessStepProps = {
  step: AboutProcessStepData
  staggerClass: string
  isActive?: boolean
  onActivate?: () => void
  onVideoEnded?: () => void
}

function formatStepNumber(step: number) {
  return String(step).padStart(2, '0')
}

const IMAGE_ASPECT_CLASSES = {
  '16/10': 'aspect-[16/10]',
  '4/5': 'aspect-[4/5]',
  '9/16': 'aspect-[9/16]',
} as const

function StepIcon({ icon }: { icon: AboutProcessStepIcon }) {
  switch (icon) {
    case 'clipboard':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4"
          />
        </svg>
      )
    case 'sparkles':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
          />
        </svg>
      )
    case 'checklist':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
          />
        </svg>
      )
    case 'refresh':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
          />
        </svg>
      )
  }
}

function StepMedia({
  step,
  isAccordion,
  isActive,
  onVideoEnded,
}: {
  step: AboutProcessStepData
  isAccordion: boolean
  isActive: boolean
  onVideoEnded?: () => void
}) {
  if (step.video) {
    return (
      <AboutVideo
        video={step.video}
        variant="embedded"
        active={isAccordion ? isActive : true}
        loop={isAccordion ? false : true}
        onEnded={isAccordion ? onVideoEnded : undefined}
      />
    )
  }

  return (
    <img
      src={step.image!.src}
      alt={step.image!.alt}
      loading="lazy"
      decoding="async"
      className={cn(
        'w-full object-cover object-center',
        IMAGE_ASPECT_CLASSES[step.image!.aspect ?? '16/10'],
      )}
    />
  )
}

export default function AboutProcessStep({
  step,
  staggerClass,
  isActive,
  onActivate,
  onVideoEnded,
}: AboutProcessStepProps) {
  const isAccordion = isActive !== undefined
  const active = isActive ?? true

  return (
    <article
      role={isAccordion ? 'tab' : undefined}
      aria-selected={isAccordion ? active : undefined}
      aria-label={
        isAccordion ? `${step.title}: ${step.description}` : undefined
      }
      tabIndex={isAccordion ? 0 : undefined}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className="relative"
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-border-default bg-surface shadow-subtle',
          isAccordion &&
            'origin-center transition-all duration-500 ease-in-out',
          isAccordion && active && 'z-10 scale-[1.025] ring-1 ring-action/20',
          isAccordion && !active && 'cursor-pointer',
          !isAccordion && cn('animate-on-scroll', staggerClass),
        )}
      >
        <div className="relative">
          <StepMedia
            step={step}
            isAccordion={isAccordion}
            isActive={active}
            onVideoEnded={onVideoEnded}
          />
          <div className="absolute inset-0 bg-black/25" />

          <div className="absolute -bottom-7 left-1/2 z-20 -translate-x-1/2">
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-action text-white ring-4 ring-white/90">
              <StepIcon icon={step.icon} />
            </div>
          </div>
        </div>

        <span
          className="pointer-events-none absolute -right-3 -bottom-6 select-none text-[7rem] font-bold leading-none text-action/[0.06]"
          aria-hidden="true"
        >
          {formatStepNumber(step.step)}
        </span>

        <div className="relative px-6 pt-10 pb-6">
          <Heading level={3} className="mb-2 text-center text-xl md:text-2xl">
            {step.title}
          </Heading>
          <Text font="crimson" className="text-center text-sm md:text-base">
            {step.description}
          </Text>
        </div>
      </div>
    </article>
  )
}
