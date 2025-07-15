import {expect, test} from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({page}) => {
    await page.goto('/signin')

    // Check if login form is present
    await expect(page.locator('form')).toBeVisible()

    // Check for email input
    await expect(page.locator('input[type="email"]')).toBeVisible()

    // Check for password input
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should display signup page', async ({page}) => {
    await page.goto('/signup')

    // Check if signup form is present
    await expect(page.locator('form')).toBeVisible()

    // Check for email input
    await expect(page.locator('input[type="email"]')).toBeVisible()

    // Check for password input
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })
})
