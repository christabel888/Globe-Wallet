import { test, expect } from '@playwright/test'

test.describe('Finance Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/')
  })

  test('should display balance information correctly', async ({ page }) => {
    // Wait for the balance card to load
    await page.waitForSelector('[data-testid="balance-card"]', { timeout: 10000 })
    
    // Check that balance card is visible
    const balanceCard = page.locator('[data-testid="balance-card"]')
    await expect(balanceCard).toBeVisible()
    
    // Check that total value is displayed
    const totalValue = page.locator('[data-testid="total-value"]')
    await expect(totalValue).toBeVisible()
    
    // Verify fiat and crypto totals
    const fiatTotal = page.locator('[data-testid="fiat-total"]')
    const cryptoTotal = page.locator('[data-testid="crypto-total"]')
    
    await expect(fiatTotal).toBeVisible()
    await expect(cryptoTotal).toBeVisible()
  })

  test('should refresh balance data', async ({ page }) => {
    // Wait for balance card to load
    await page.waitForSelector('[data-testid="balance-card"]')
    
    // Get initial total value
    const totalValue = page.locator('[data-testid="total-value"]')
    const initialValue = await totalValue.textContent()
    
    // Click refresh button
    const refreshButton = page.locator('[data-testid="refresh-button"]')
    await refreshButton.click()
    
    // Wait for potential loading state
    await page.waitForTimeout(500)
    
    // Verify the component is still there (not in error state)
    await expect(totalValue).toBeVisible()
  })

  test('should handle crypto conversion', async ({ page }) => {
    // Navigate to a page with crypto converter or find it on current page
    const converter = page.locator('[data-testid="crypto-converter"]')
    
    if (await converter.count() > 0) {
      // Fill in amount
      const amountInput = page.locator('[data-testid="amount-input"]')
      await amountInput.fill('100')
      
      // Click convert button
      const convertButton = page.locator('[data-testid="convert-button"]')
      await convertButton.click()
      
      // Wait for result
      await page.waitForSelector('[data-testid="conversion-result"]', { timeout: 5000 })
      
      const result = page.locator('[data-testid="conversion-result"]')
      await expect(result).toBeVisible()
    }
  })

  test('should display transaction list', async ({ page }) => {
    // Look for transaction list on the page
    const transactionList = page.locator('[data-testid="transaction-list"]')
    
    if (await transactionList.count() > 0) {
      await expect(transactionList).toBeVisible()
      
      // Check if there are transaction items
      const transactions = page.locator('[data-testid^="transaction-"]')
      const transactionCount = await transactions.count()
      
      if (transactionCount > 0) {
        // Verify first transaction is visible
        const firstTransaction = transactions.first()
        await expect(firstTransaction).toBeVisible()
      }
    }
  })

  test('should handle error states gracefully', async ({ page }) => {
    // Test error boundary by triggering network error
    await page.route('**/api/**', route => route.abort())
    
    // Reload the page to trigger API calls
    await page.reload()
    
    // Wait a bit for error states to appear
    await page.waitForTimeout(2000)
    
    // Check for error states or retry buttons
    const errorElements = page.locator('[data-testid*="error"], [data-testid*="retry"]')
    const errorCount = await errorElements.count()
    
    // If there are error elements, verify they're accessible
    if (errorCount > 0) {
      const firstError = errorElements.first()
      await expect(firstError).toBeVisible()
    }
    
    // The app should not crash completely
    const body = page.locator('body')
    await expect(body).toBeVisible()
  })
})