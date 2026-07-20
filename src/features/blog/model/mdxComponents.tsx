import type { ComponentPropsWithoutRef, ReactNode } from 'react'

type ChildrenProps = { children?: ReactNode }

const heading =
  (Tag: 'h2' | 'h3' | 'h4') =>
  ({ children }: ChildrenProps) => (
    <Tag className="mt-8 font-display text-2xl text-text-primary first:mt-0">
      {children}
    </Tag>
  )

export const blogMdxComponents = {
  h1: ({ children }: ChildrenProps) => (
    <p className="font-display text-2xl text-text-primary">{children}</p>
  ),
  h2: heading('h2'),
  h3: heading('h3'),
  h4: heading('h4'),
  p: ({ children }: ChildrenProps) => (
    <p className="mt-4 text-text-secondary leading-relaxed">{children}</p>
  ),
  ul: ({ children }: ChildrenProps) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-text-secondary">
      {children}
    </ul>
  ),
  ol: ({ children }: ChildrenProps) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-text-secondary">
      {children}
    </ol>
  ),
  li: ({ children }: ChildrenProps) => <li>{children}</li>,
  a: ({ href, children, ...rest }: ComponentPropsWithoutRef<'a'>) => {
    const isExternal = typeof href === 'string' && /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        className="text-action underline-offset-2 hover:underline"
        {...(isExternal
          ? { target: '_blank', rel: 'noopener noreferrer' }
          : {})}
        {...rest}
      >
        {children}
      </a>
    )
  },
  blockquote: ({ children }: ChildrenProps) => (
    <blockquote className="mt-4 border-l-2 border-action pl-4 text-text-secondary italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border-default" />,
  strong: ({ children }: ChildrenProps) => (
    <strong className="font-semibold text-text-primary">{children}</strong>
  ),
  em: ({ children }: ChildrenProps) => <em>{children}</em>,
}
