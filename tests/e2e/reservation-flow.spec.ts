import { expect, test } from '@playwright/test'
import { ready } from './helpers'

test.describe('Reservation Flow E2E', () => {
  test('customer completes multi-step booking wizard', async ({ page }) => {
    // Intercept backend API calls with mock fixtures
    await page.route('**/api/company/public/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          name: 'Ka.Cosmetology',
          openingTime: '09:00:00',
          closingTime: '18:00:00',
          slotIntervalMinutes: 30,
          lastMinuteDiscountPercent: 15,
          lastMinuteDiscountHours: 24,
          minBookingAdvanceMinutes: 60,
        }),
      })
    })

    await page.route('**/api/offerings/public/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            companyId: 1,
            name: 'Oczyszczanie wodorowe',
            durationMinutes: 60,
            price: 200,
            active: true,
            categoryId: 3,
          },
        ]),
      })
    })

    await page.route('**/api/employees/public/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            firstName: 'Katarzyna',
            lastName: 'Suwalska',
            role: 'OWNER',
          },
        ]),
      })
    })

    await page.route('**/api/availability**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { time: '10:00:00', price: 200, originalPrice: 200 },
          { time: '11:30:00', price: 170, originalPrice: 200 },
        ]),
      })
    })

    await page.route('**/api/auth/request-code', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Kod wysłany!' }),
      })
    })

    await page.route('**/api/auth/verify-code', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: 'e2e-jwt-token' }),
      })
    })

    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 10,
          phoneNumber: '+48726154460',
          firstName: 'Anna',
          lastName: 'Kowalska',
        }),
      })
    })

    await page.route('**/api/reservations', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 88,
            employeeId: 1,
            serviceId: 1,
            price: 200,
            startTime: '2026-10-15T10:00:00',
            endTime: '2026-10-15T11:00:00',
            status: 'CONFIRMED',
          }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      }
    })

    // Navigate to /rezerwacja
    await ready(page, '/rezerwacja')

    // Step 1: Select Service
    await expect(
      page.getByRole('heading', { level: 1, name: /Umów wizytę w salonie/i }),
    ).toBeVisible()
    const serviceCard = page.locator('button', {
      hasText: 'Oczyszczanie wodorowe',
    })
    await expect(serviceCard).toBeVisible()
    await serviceCard.click()

    // Step 2: Select Specialist
    await expect(
      page.getByRole('heading', { level: 2, name: /Wybierz specjalistę/i }),
    ).toBeVisible()
    const employeeCard = page.locator('button', {
      hasText: 'Katarzyna Suwalska',
    })
    await expect(employeeCard).toBeVisible()
    await employeeCard.click()

    // Step 3: Select Date & Time Slot
    await expect(
      page.getByRole('heading', { level: 2, name: /Wybierz termin wizyty/i }),
    ).toBeVisible()
    const slotBtn = page.locator('button', { hasText: '10:00' })
    await expect(slotBtn).toBeVisible()
    await slotBtn.click()

    // Step 4: Auth via SMS OTP
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: /Weryfikacja numeru telefonu/i,
      }),
    ).toBeVisible()
    await page.getByLabel('Numer telefonu').fill('726 154 460')
    await page.getByRole('button', { name: /Wyślij kod SMS/i }).click()

    await expect(page.getByLabel(/Kod z wiadomości SMS/i)).toBeVisible()
    await page.getByLabel(/Kod z wiadomości SMS/i).fill('123456')
    await page
      .getByRole('button', { name: /Zatwierdź kod i kontynuuj/i })
      .click()

    // Step 5: Summary
    await expect(
      page.getByRole('heading', { level: 2, name: /Podsumowanie rezerwacji/i }),
    ).toBeVisible()
    await expect(page.getByText('Oczyszczanie wodorowe')).toBeVisible()
    await page.getByRole('button', { name: /Potwierdzam rezerwację/i }).click()

    // Step 6: Confirmation Screen
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: /Wizyta została zarezerwowana/i,
      }),
    ).toBeVisible()
    await expect(page.getByText('#88')).toBeVisible()
    await expect(page.getByText(/Pobierz plik kalendarza/i)).toBeVisible()
  })
})
