import { Heading, PageHero, Section, Text } from '@components/ui'
import { brand, businessProfile, primarySalonLocation } from '@data/business'
import {
  getPrivacyPolicySections,
  PRIVACY_POLICY_EFFECTIVE_DATE,
  type PrivacyPolicyBlock,
} from '@features/legal/content/privacyPolicyContent'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

function linkifyPolicyText(text: string): ReactNode[] {
  const patterns: Array<{
    match: string
    href: string
    external?: boolean
  }> = [
    { match: brand.email, href: `mailto:${brand.email}` },
    {
      match: primarySalonLocation.bookingUrl,
      href: primarySalonLocation.bookingUrl,
      external: true,
    },
    { match: brand.siteUrl, href: brand.siteUrl, external: true },
  ]

  const nodes: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    let earliestIndex = -1
    let earliest: (typeof patterns)[number] | null = null

    for (const pattern of patterns) {
      const index = remaining.indexOf(pattern.match)
      if (index === -1) {
        continue
      }
      if (earliestIndex === -1 || index < earliestIndex) {
        earliestIndex = index
        earliest = pattern
      }
    }

    if (earliestIndex === -1 || !earliest) {
      nodes.push(remaining)
      break
    }

    if (earliestIndex > 0) {
      nodes.push(remaining.slice(0, earliestIndex))
    }

    nodes.push(
      <a
        key={`link-${key}`}
        href={earliest.href}
        className="font-semibold text-action underline-offset-4 hover:underline"
        {...(earliest.external
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
      >
        {earliest.match}
      </a>,
    )
    key += 1
    remaining = remaining.slice(earliestIndex + earliest.match.length)
  }

  return nodes
}

function PolicyBlock({ block }: { block: PrivacyPolicyBlock }) {
  if (block.type === 'paragraph') {
    return <Text className="mt-4">{linkifyPolicyText(block.text)}</Text>
  }

  return (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-base text-text-secondary">
      {block.items.map((item) => (
        <li key={item.slice(0, 48)}>{linkifyPolicyText(item)}</li>
      ))}
    </ul>
  )
}

function blockKey(sectionId: string, block: PrivacyPolicyBlock): string {
  if (block.type === 'paragraph') {
    return `${sectionId}-p-${block.text.slice(0, 40)}`
  }
  return `${sectionId}-ul-${block.items[0]?.slice(0, 40) ?? 'empty'}`
}

export default function PrivacyPolicyPage() {
  const sections = getPrivacyPolicySections(businessProfile)

  return (
    <>
      <PageHero
        maxWidth="medium"
        title="Polityka prywatności"
        description={
          <>
            Informacje o ochronie danych osobowych i plikach cookies w{' '}
            {brand.name}. Obowiązuje od {PRIVACY_POLICY_EFFECTIVE_DATE}.
          </>
        }
      />
      <Section background="white" spacing="regular">
        <div className="mx-auto max-w-3xl">
          {sections.map((section) => (
            <section
              key={section.id}
              className="mt-10 first:mt-0"
              id={section.id}
            >
              <Heading level={2} variant="content">
                {section.title}
              </Heading>
              {section.blocks.map((block) => (
                <PolicyBlock key={blockKey(section.id, block)} block={block} />
              ))}
            </section>
          ))}

          <Text className="mt-10">
            Zarządzanie zgodami na cookies jest dostępne w dowolnym momencie z
            poziomu stopki strony („Zarządzaj cookies”).
          </Text>

          <p className="mt-8">
            <Link
              to="/"
              className="font-semibold text-action underline-offset-4 hover:underline"
            >
              Wróć na stronę główną
            </Link>
          </p>
        </div>
      </Section>
    </>
  )
}
