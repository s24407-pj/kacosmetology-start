import { cn } from '@libs/utils'
import type { ReactNode } from 'react'
import { Eyebrow } from './Eyebrow'
import { Heading } from './Heading'
import { Text } from './Text'

type PageHeroProps = {
  title: ReactNode
  eyebrow?: string
  description?: ReactNode
  breadcrumbs?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
  media?: ReactNode
  align?: 'left' | 'center'
  maxWidth?: 'medium' | 'wide'
}

export function PageHero({
  title,
  eyebrow,
  description,
  breadcrumbs,
  actions,
  meta,
  media,
  align = 'left',
  maxWidth = 'wide',
}: PageHeroProps) {
  const centered = align === 'center'
  return (
    <section className="relative overflow-hidden border-b border-border-default bg-surface-muted px-4 pb-14 pt-52 sm:px-6 sm:pb-16 min-[810px]:pt-40">
      <div
        className={cn(
          'mx-auto',
          maxWidth === 'wide' ? 'max-w-6xl' : 'max-w-4xl',
        )}
      >
        <div
          className={cn(
            media &&
              'grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)] lg:gap-14',
            centered && !media && 'text-center',
          )}
        >
          <div>
            {breadcrumbs ? <div className="mb-7">{breadcrumbs}</div> : null}
            {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
            <Heading level={1} variant="page">
              {title}
            </Heading>
            {description ? (
              <Text
                variant="lead"
                font="crimson"
                className={cn(
                  'mt-6 max-w-3xl leading-relaxed',
                  centered && !media && 'mx-auto',
                )}
              >
                {description}
              </Text>
            ) : null}
            {meta ? (
              <div
                className={cn(
                  'mt-8 flex flex-wrap items-center gap-5',
                  centered && !media && 'justify-center',
                )}
              >
                {meta}
              </div>
            ) : null}
            {actions ? (
              <div
                className={cn(
                  'mt-8 flex flex-wrap gap-3',
                  centered && !media && 'justify-center',
                )}
              >
                {actions}
              </div>
            ) : null}
          </div>
          {media ? <div className="mt-2 lg:mt-0">{media}</div> : null}
        </div>
      </div>
    </section>
  )
}
