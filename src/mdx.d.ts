declare module '*.mdx' {
  import type { ComponentType, ReactNode } from 'react'

  const MDXContent: ComponentType<{
    components?: Record<string, ComponentType<{ children?: ReactNode }>>
  }>
  export default MDXContent
}
