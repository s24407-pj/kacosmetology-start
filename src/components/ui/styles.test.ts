import { describe, expect, it } from 'vitest'
import { actionLinkStyles, iconActionStyles, surfaceCardStyles } from './styles'

describe('shared UI styles', () => {
  it('supports compact inverse actions', () => {
    const classes = actionLinkStyles({ variant: 'inverse', size: 'xs' })

    expect(classes).toContain('bg-white')
    expect(classes).toContain('min-h-10')
  })

  it('keeps raised surfaces free from redundant borders', () => {
    const classes = surfaceCardStyles()

    expect(classes).toContain('shadow-subtle')
    expect(classes).not.toContain('border-border-default')
  })

  it('uses one focus treatment for icon actions', () => {
    const classes = iconActionStyles({ tone: 'overlay', size: 'lg' })

    expect(classes).toContain('h-11')
    expect(classes).toContain('bg-surface/90')
    expect(classes).toContain('focus-visible:ring-2')
  })
})
