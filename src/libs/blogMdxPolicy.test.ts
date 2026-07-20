import { compile } from '@mdx-js/mdx'
import remarkFrontmatter from 'remark-frontmatter'
import { describe, expect, it } from 'vitest'
import { blogMdxPolicy } from './blogMdxPolicy'

const compileWithPolicy = async (source: string) =>
  compile(source, {
    remarkPlugins: [remarkFrontmatter, blogMdxPolicy],
  })

describe('blogMdxPolicy', () => {
  it('accepts Markdown-only MDX with frontmatter', async () => {
    await expect(
      compileWithPolicy(`---
title: Ok
---

## Nagłówek

Akapit z [linkiem](/blog).
`),
    ).resolves.toBeTruthy()
  })

  it('rejects JSX', async () => {
    await expect(
      compileWithPolicy(`## Tytuł

<div>nie</div>
`),
    ).rejects.toThrow(/mdxJsxFlowElement|Blog MDX policy/)
  })

  it('rejects imports', async () => {
    await expect(
      compileWithPolicy(`import x from './x.js'

## Tytuł
`),
    ).rejects.toThrow(/mdxjsEsm|Blog MDX policy/)
  })

  it('rejects expressions', async () => {
    await expect(
      compileWithPolicy(`## Tytuł

{1 + 1}
`),
    ).rejects.toThrow(/mdxFlowExpression|Blog MDX policy/)
  })

  it('rejects body images', async () => {
    await expect(
      compileWithPolicy(`## Tytuł

![alt](/images/blog/x/cover.webp)
`),
    ).rejects.toThrow(/image|Blog MDX policy/)
  })
})
