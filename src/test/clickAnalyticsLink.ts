import type { UserEvent } from '@testing-library/user-event'

export async function clickAnalyticsLink(user: UserEvent, link: Element) {
  link.addEventListener('click', (event) => event.preventDefault(), {
    once: true,
  })
  await user.click(link)
}
