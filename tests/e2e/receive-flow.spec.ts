import { test, expect } from '@playwright/test'

const VALID_ADDRESS = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF'

test.describe('Receive Flow — E2E (#22)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/receive')
  })

  test('happy path: address tab shows QR and copies address', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await expect(page.getByTestId('receive-page')).toBeVisible()
    await expect(page.getByTestId('receive-address')).toContainText(VALID_ADDRESS)
    await expect(page.getByTestId('address-qr')).toBeVisible()

    await page.getByTestId('copy-address-button').click()
    await expect(page.getByText(/copied to clipboard/i)).toBeVisible({ timeout: 5000 })
  })

  test('happy path: payment request tab generates QR with amount and memo', async ({ page }) => {
    await page.getByTestId('tab-request').click()
    await page.getByTestId('receive-amount-input').fill('25')
    await page.getByTestId('receive-memo-input').fill('Invoice')

    await expect(page.getByTestId('payment-qr')).toBeVisible()
    await expect(page.getByTestId('receive-summary')).toBeVisible()
    await expect(page.getByTestId('summary-amount')).toContainText('25 XLM')
    await expect(page.getByTestId('summary-memo')).toContainText('Invoice')
  })

  test('failure path: invalid amount disables share actions', async ({ page }) => {
    await page.getByTestId('tab-request').click()
    await page.getByTestId('receive-amount-input').fill('-1')

    await expect(page.getByTestId('receive-amount-error')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('copy-payment-button')).toBeDisabled()
    await expect(page.getByTestId('share-payment-button')).toBeDisabled()
  })
})
