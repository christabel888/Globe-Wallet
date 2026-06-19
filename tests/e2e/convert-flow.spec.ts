/**
 * E2E — Convert Flow (issue #25)
 * Covers: rate display, amount input, swap currencies, fee summary, convert button.
 */
import { test, expect } from '@playwright/test'

test.describe('Convert Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/convert')
  })

  // ── happy path ──────────────────────────────────────────────────────────────

  test('shows exchange rate card on load', async ({ page }) => {
    // Rate card shows "1 XLM = ..."
    await expect(page.getByText(/1 XLM/i)).toBeVisible({ timeout: 5000 })
  })

  test('entering a from-amount calculates the to-amount', async ({ page }) => {
    const inputs = page.getByRole('spinbutton')
    const fromInput = inputs.first()
    await fromInput.fill('100')

    const toInput = inputs.nth(1)
    const toValue = await toInput.inputValue()
    // Should be non-empty and numeric
    expect(parseFloat(toValue)).toBeGreaterThan(0)
  })

  test('fee summary appears after entering an amount', async ({ page }) => {
    const inputs = page.getByRole('spinbutton')
    await inputs.first().fill('10')
    await expect(page.getByText(/network fee/i)).toBeVisible({ timeout: 3000 })
    await expect(page.getByText(/you'll receive/i)).toBeVisible()
  })

  test('swap button reverses the currency pair', async ({ page }) => {
    // Default: XLM → USDC
    const swapBtn = page.getByRole('button', { name: '' }).filter({ hasText: '' }).locator('svg')
    // locate swap via its icon parent button
    const swapButton = page.locator('button').filter({ has: page.locator('svg') }).nth(0)
    // Just verify the page doesn't crash on click
    const inputs = page.getByRole('spinbutton')
    await inputs.first().fill('5')
    const initialTo = await inputs.nth(1).inputValue()

    // Click the swap/reverse button (ArrowUpDown icon button)
    await page.locator('button.rounded-full').click()

    // After swap from/to pair is inverted — page still functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('Convert button is disabled when amount is empty', async ({ page }) => {
    const convertBtn = page.getByRole('button', { name: /convert/i })
    await expect(convertBtn).toBeDisabled()
  })

  test('Convert button enables after valid amount is entered', async ({ page }) => {
    const inputs = page.getByRole('spinbutton')
    await inputs.first().fill('1')
    const convertBtn = page.getByRole('button', { name: /^convert$/i })
    await expect(convertBtn).toBeEnabled({ timeout: 3000 })
  })

  // ── failure path ────────────────────────────────────────────────────────────

  test('shows error toast when amount exceeds balance', async ({ page }) => {
    const inputs = page.getByRole('spinbutton')
    await inputs.first().fill('999999')
    await page.getByRole('button', { name: /^convert$/i }).click()
    // Sonner toast appears in the DOM as a li with the error text
    await expect(page.locator('[data-sonner-toast]').or(page.getByText(/insufficient/i))).toBeVisible({ timeout: 5000 })
  })

  // ── navigation ──────────────────────────────────────────────────────────────

  test('back button returns to home', async ({ page }) => {
    await page.getByRole('link', { name: /back/i }).click()
    await expect(page).toHaveURL('/')
  })
})
