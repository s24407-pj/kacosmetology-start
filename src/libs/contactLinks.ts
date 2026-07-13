import type { ContactLinkType } from '@app-types/types'

export const getContactHref = (type: ContactLinkType, value: string) => {
  if (type === 'phone') {
    return `tel:${value.replace(/\s+/g, '')}`
  }

  if (type === 'email') {
    return `mailto:${value}`
  }

  return value
}
