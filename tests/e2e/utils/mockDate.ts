import type { Page } from '@playwright/test'

export async function mockDate(page: Page, isoString: string) {
  await page.addInitScript(
    ({ now }) => {
      const fixedTimestamp = Date.parse(now)
      const RealDate = Date

      class MockDate extends RealDate {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(fixedTimestamp)
            return
          }

          super(...(args as ConstructorParameters<typeof Date>))
        }

        static now() {
          return fixedTimestamp
        }
      }

      Object.setPrototypeOf(MockDate, RealDate)
      MockDate.UTC = RealDate.UTC
      MockDate.parse = RealDate.parse
      MockDate.prototype = RealDate.prototype

      globalThis.Date = MockDate as typeof Date
    },
    { now: isoString },
  )
}
