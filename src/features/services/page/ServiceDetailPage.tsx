import type { PublicService } from '@app-types/types'
import {
  Alert,
  actionLinkStyles,
  Breadcrumbs,
  Heading,
  PageHero,
  Section,
  SectionHeader,
  ServicePrice,
  Text,
} from '@components/ui'
import { brand } from '@data/business'
import { getPublicServicePath, getRelatedServices } from '@data/services'
import { trackPlausibleEvent } from '@libs/analytics'
import { toBreadcrumbListJsonLd, toServiceJsonLd } from '@libs/businessMetadata'
import { Link } from '@tanstack/react-router'
import BooksyLink from '@widgets/actions/BooksyLink'
import { Clock } from 'lucide-react'
import { useEffect } from 'react'

function DetailList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null
  return (
    <section className="border-t border-border-default pt-6">
      <Heading level={2} variant="content">
        {title}
      </Heading>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-text-secondary">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  )
}

export function ServiceDetailPage({ service }: { service: PublicService }) {
  const parentPath =
    service.category === 'eye-styling'
      ? '/oprawa-oka'
      : service.area === 'cosmetology'
        ? '/kosmetologia'
        : '/trychologia'
  const parentLabel =
    service.category === 'eye-styling'
      ? 'Oprawa oka'
      : service.area === 'cosmetology'
        ? 'Kosmetologia'
        : 'Trychologia'
  const related = getRelatedServices(service).filter(
    (item) => item.hasDetailPage,
  )
  const servicePath = getPublicServicePath(service) ?? parentPath
  const structuredData = [
    toServiceJsonLd({ brand, service, path: servicePath }),
    toBreadcrumbListJsonLd({
      brand,
      items: [
        { name: 'Strona główna', path: '/' },
        { name: parentLabel, path: parentPath },
        { name: service.name, path: servicePath },
      ],
    }),
  ]

  useEffect(() => {
    trackPlausibleEvent('Service Detail View', {
      area: service.area,
      serviceId: service.id,
      serviceSlug: service.slug,
    })
  }, [service])

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from validated, repository-controlled service data.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageHero
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: 'Strona główna', to: '/' },
              { label: parentLabel, to: parentPath },
              { label: service.name },
            ]}
          />
        }
        eyebrow={parentLabel}
        title={service.name}
        description={service.shortDescription}
        meta={
          <>
            <ServicePrice service={service} />
            <span className="inline-flex items-center gap-2 py-2 text-text-secondary">
              <Clock className="h-5 w-5 text-action" /> około {service.duration}{' '}
              min
            </span>
          </>
        }
        actions={
          <BooksyLink
            placement="service-detail"
            area={service.area}
            serviceId={service.id}
          >
            Zarezerwuj w Booksy
          </BooksyLink>
        }
      />
      <Section background="white">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            eyebrow="Informacje o usłudze"
            title="Przebieg i przygotowanie"
          />
          <div className="space-y-8">
            {service.forWho ? (
              <section className="border-t border-border-default pt-6">
                <Heading level={2} variant="content">
                  Dla kogo?
                </Heading>
                <Text className="mt-4 leading-relaxed">{service.forWho}</Text>
              </section>
            ) : null}
            <DetailList title="Przygotowanie" items={service.preparation} />
            <DetailList title="Co obejmuje usługa" items={service.includes} />
            <DetailList title="Możliwe efekty" items={service.effects} />
            <DetailList
              title="Zalecane badania"
              items={service.recommendedTests}
            />
            {service.requiresPriorConsultation ? (
              <Alert
                variant="warning"
                title="Wymagana wcześniejsza konsultacja"
              >
                <p>
                  Przed wykonaniem tej usługi umów konsultację odpowiednią dla
                  wybranego obszaru.
                </p>
              </Alert>
            ) : null}
            {service.note ? (
              <Alert title="Ważna informacja">
                <p>{service.note}</p>
              </Alert>
            ) : null}
            {service.contraindications ? (
              <Alert variant="error" title="Przeciwwskazania">
                {Array.isArray(service.contraindications) ? (
                  <ul className="list-disc pl-6">
                    {service.contraindications.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2">{service.contraindications}</p>
                )}
              </Alert>
            ) : null}
          </div>
        </div>
      </Section>
      {related.length ? (
        <Section background="gray">
          <div className="mx-auto max-w-5xl">
            <SectionHeader
              eyebrow="Dalsze możliwości"
              title="Powiązane usługi"
            />
            <div className="mx-auto grid max-w-4xl gap-x-10 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={
                    item.category === 'eye-styling'
                      ? '/oprawa-oka/$slug'
                      : item.area === 'cosmetology'
                        ? '/kosmetologia/$slug'
                        : '/trychologia/$slug'
                  }
                  params={{ slug: item.slug }}
                  onClick={() =>
                    trackPlausibleEvent('Related Service Click', {
                      serviceId: item.id,
                      area: item.area,
                    })
                  }
                  className={actionLinkStyles({
                    variant: 'text',
                    size: 'sm',
                    className:
                      'justify-between border-t border-border-default px-0 py-5 text-left',
                  })}
                >
                  <span>{item.name}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </div>
        </Section>
      ) : null}
    </>
  )
}
