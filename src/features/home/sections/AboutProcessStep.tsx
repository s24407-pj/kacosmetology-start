import type {
  AboutProcessStep as AboutProcessStepData,
  AboutProcessStepIcon,
} from '@app-types/types'
import { Heading, surfaceCardStyles, Text } from '@components/ui'
import { cn } from '@libs/utils'
import AboutVideo from './AboutVideo'

type AboutProcessStepProps = {
  step: AboutProcessStepData
  staggerClass: string
  isActive?: boolean
  onActivate?: () => void
  onVideoEnded?: () => void
}

const IMAGE_ASPECT_CLASSES = {
  '16/10': 'aspect-[16/10]',
  '4/5': 'aspect-[4/5]',
  '9/16': 'aspect-[9/16]',
} as const

function StepIcon({ icon }: { icon: AboutProcessStepIcon }) {
  const paths: Record<AboutProcessStepIcon, string> = {
    clipboard:
      'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4',
    sparkles:
      'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z',
    checklist:
      'M11.35 3.836A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586M8.25 8.25H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Zm-1.5 7.5 1.5 1.5 3-3.75',
    refresh:
      'M16.023 9.348h4.992M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99',
  }
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
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[icon]} />
    </svg>
  )
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
        loop={!isAccordion}
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
          surfaceCardStyles({ className: 'relative overflow-hidden' }),
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
          {String(step.step).padStart(2, '0')}
        </span>
        <div className="relative px-6 pt-10 pb-6">
          <Heading level={3} variant="card" className="mb-2 text-center">
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
