import {expect, test} from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page', async ({page}) => {
    await page.goto('/en/login')

    // Check if login form is present
    await expect(page.locator('form')).toBeVisible()

    // Check for email input
    await expect(page.locator('input[type="email"]')).toBeVisible()

    // Check for password input
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // Check for submit button
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should display register page', async ({page}) => {
    await page.goto('/en/register')

    // Check if provider buttons are present
    await expect(page.locator('button:has-text("Google")')).toBeVisible()
    await expect(page.locator('button:has-text("Apple")')).toBeVisible()

    // Click "Create account with email" to show the form
    await page.click('button:has-text("Create account with email")')

    // Check if signup form is now visible
    await expect(page.locator('form')).toBeVisible()

    // Check for registration inputs
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
  })

  test('should navigate from login to register', async ({page}) => {
    await page.goto('/en/login')

    // Click on register link (using href selector)
    await page.click('a[href="/register"]')

    // Should be on register page
    await expect(page).toHaveURL(/\/en\/register/)
  })
})
