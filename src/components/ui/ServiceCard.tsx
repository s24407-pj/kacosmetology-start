import type { PublicService } from '@app-types/types'
import { Link } from '@tanstack/react-router'
import BooksyLink from '@widgets/actions/BooksyLink'
import { ArrowRight, Clock } from 'lucide-react'
import { Heading } from './Heading'
import { ServicePrice } from './ServicePrice'
import { actionLinkStyles } from './styles'

export function ServiceCard({ service }: { service: PublicService }) {
  const detailTo =
    service.category === 'eye-styling'
      ? '/oprawa-oka/$slug'
      : service.area === 'cosmetology'
        ? '/kosmetologia/$slug'
        : '/trychologia/$slug'

  return (
    <article className="group flex h-full flex-col border-t border-border-default py-6 sm:py-7">
      <Heading level={3} variant="card">
        {service.name}
      </Heading>
      <p className="mt-3 grow leading-relaxed text-text-secondary">
        {service.shortDescription}
      </p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <ServicePrice service={service} />
        <span className="inline-flex items-center gap-1 text-sm text-text-muted">
          <Clock className="h-4 w-4" /> {service.duration} min
        </span>
      </div>
      {service.hasDetailPage ? (
        <Link
          to={detailTo}
          params={{ slug: service.slug }}
          className={actionLinkStyles({
            variant: 'text',
            size: 'sm',
            className: 'mt-4 w-fit px-0',
          })}
        >
          Poznaj szczegóły <ArrowRight className="h-4 w-4" />
        </Link>
      ) : (
        <BooksyLink
          placement="service-card"
          area={service.area}
          serviceId={service.id}
          className={actionLinkStyles({
            size: 'sm',
            className: 'mt-5 w-fit',
          })}
        >
          Zarezerwuj w Booksy
        </BooksyLink>
      )}
    </article>
  )
}
