import { test, expect } from '@playwright/test'

test.describe('Dashboard E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/dashboard')
    })

    test('should display balances and allow navigating to send form', async ({ page }) => {
        // Check if stats cards are visible
        await expect(page.locator('text=Total Balance')).toBeVisible()

        // Click on Send button (assuming it exists in a nav or quick action)
        await page.click('button:has-text("Send")')

        // Verify we are on the send page or modal
        await expect(page.locator('h2:has-text("Send Money")')).toBeVisible()
    })

    test('should show error for invalid address in send form', async ({ page }) => {
        await page.click('button:has-text("Send")')

        await page.fill('input[aria-label="Recipient Address"]', 'invalid-address')
        await page.fill('input[aria-label="Amount"]', '100')

        await page.click('button:has-text("Confirm Send")') // Adjust based on actual text

        await expect(page.locator('text=Invalid address')).toBeVisible()
    })
})
