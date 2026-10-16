import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { JsonLd } from './JsonLd'

describe('JsonLd', () => {
  it('renders a script element with type application/ld+json', () => {
    const data = { '@context': 'https://schema.org', '@type': 'WebPage' }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script')

    expect(script).not.toBeNull()
    expect(script?.getAttribute('type')).toBe('application/ld+json')
    expect(JSON.parse(script?.textContent || '')).toEqual(data)
  })

  it('supports arrays of structured data', () => {
    const data = [
      { '@context': 'https://schema.org', '@type': 'Service', name: 'Zabieg' },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList' },
    ]
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script')

    expect(script).not.toBeNull()
    expect(JSON.parse(script?.textContent || '')).toEqual(data)
  })

  it('escapes < characters to prevent HTML/XSS injection while parsing back correctly', () => {
    const data = {
      '@context': 'https://schema.org',
      name: '</script><script>alert("xss")</script>',
      note: 'Wartość < 100 oraz > 50',
    }
    const { container } = render(<JsonLd data={data} />)
    const script = container.querySelector('script')

    expect(script).not.toBeNull()
    expect(script?.innerHTML).not.toContain('<script')
    expect(script?.innerHTML).not.toContain('</script>')
    expect(script?.innerHTML).toContain('\\u003c/script>\\u003cscript>')
    expect(JSON.parse(script?.textContent || '')).toEqual(data)
  })
})
