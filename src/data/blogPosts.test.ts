import {
  filterPublicBlogPosts,
  getAllBlogPosts,
  getBlogCategories,
  getBlogPostBySlug,
  getBlogTags,
  getPublicBlogPaths,
  getPublicBlogPostBySlug,
  getPublicBlogPosts,
  getRelatedBlogPosts,
} from '@data/blogPosts'
import { describe, expect, it } from 'vitest'

describe('blogPosts data selectors', () => {
  it('exposes the published anti-aging article publicly', () => {
    const post = getBlogPostBySlug('pielegnacja-anti-aging-po-50')
    expect(post?.status).toBe('published')
    expect(post?.isPublic).toBe(true)
    expect(getPublicBlogPostBySlug('pielegnacja-anti-aging-po-50')?.slug).toBe(
      'pielegnacja-anti-aging-po-50',
    )
    expect(getPublicBlogPosts().map((entry) => entry.slug)).toEqual([
      'pielegnacja-anti-aging-po-50',
    ])
    expect(getAllBlogPosts().some((entry) => entry.slug === post?.slug)).toBe(
      true,
    )
  })

  it('lists blog paths, categories and tags for the public article', () => {
    expect(getPublicBlogPaths()).toEqual([
      '/blog',
      '/blog/pielegnacja-anti-aging-po-50',
    ])
    expect(getBlogCategories()).toEqual([
      { slug: 'pielegnacja-skory', label: 'Pielęgnacja skóry' },
    ])
    expect(
      getBlogTags()
        .map((tag) => tag.slug)
        .sort(),
    ).toEqual([
      'anti-aging',
      'ochrona-przeciwsloneczna',
      'retinoidy',
      'skora-dojrzala',
    ])
    expect(
      filterPublicBlogPosts({ category: 'pielegnacja-skory' }).map(
        (entry) => entry.slug,
      ),
    ).toEqual(['pielegnacja-anti-aging-po-50'])
    expect(
      filterPublicBlogPosts({ tag: 'anti-aging' }).map((entry) => entry.slug),
    ).toEqual(['pielegnacja-anti-aging-po-50'])
    expect(filterPublicBlogPosts({ category: 'brak' })).toEqual([])
  })

  it('returns no related posts when only one public article exists', () => {
    const post = getBlogPostBySlug('pielegnacja-anti-aging-po-50')
    expect(post).toBeDefined()
    expect(getRelatedBlogPosts(post!)).toEqual([])
  })
})
