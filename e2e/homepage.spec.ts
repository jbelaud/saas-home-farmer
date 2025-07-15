import {expect, test} from '@playwright/test'

test.describe('Homepage', () => {
  test('should display the homepage correctly', async ({page}) => {
    await page.goto('/')

    // Check if the page loads
    await expect(page).toHaveTitle(/Next.js SaaS Boilerplate/)

    // Check for main heading or content
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should have working navigation', async ({page}) => {
    await page.goto('/')

    // Check if navigation links are present
    const navigation = page.locator('nav')
    await expect(navigation).toBeVisible()
  })
})
