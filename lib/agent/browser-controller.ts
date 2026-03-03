import { chromium, Browser, Page, BrowserContext } from 'playwright'
import type { AgentAction, ProfileData } from './types'
import path from 'path'
import fs from 'fs/promises'

export class BrowserController {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private page: Page | null = null
  private screenshotDir: string

  constructor(screenshotDir: string = './screenshots') {
    this.screenshotDir = screenshotDir
  }

  /**
   * Initialize browser with realistic settings
   */
  async initialize(): Promise<void> {
    // Ensure screenshot directory exists
    await fs.mkdir(this.screenshotDir, { recursive: true })

    this.browser = await chromium.launch({
      headless: false, // Set to true for production
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ],
    })

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
    })

    this.page = await this.context.newPage()

    // Add stealth scripts
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false })
    })
  }

  /**
   * Navigate to URL and take screenshot
   */
  async navigateAndCapture(url: string): Promise<Buffer> {
    if (!this.page) throw new Error('Browser not initialized')

    await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    await this.page.waitForTimeout(2000) // Wait for dynamic content

    const screenshot = await this.page.screenshot({ fullPage: false })
    return screenshot
  }

  /**
   * Take a screenshot of current page
   */
  async takeScreenshot(filename?: string): Promise<Buffer> {
    if (!this.page) throw new Error('Browser not initialized')

    const screenshot = await this.page.screenshot({ fullPage: false })

    if (filename) {
      const filepath = path.join(this.screenshotDir, filename)
      await fs.writeFile(filepath, screenshot)
    }

    return screenshot
  }

  /**
   * Execute an action based on Gemini's analysis
   */
  async executeAction(action: AgentAction, profileData?: ProfileData): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    console.log(`Executing action: ${action.type} - ${action.description}`)

    switch (action.type) {
      case 'click':
        if (action.target) {
          await this.smartClick(action.target)
        }
        break

      case 'type':
        if (action.target && action.value) {
          await this.smartType(action.target, action.value)
        }
        break

      case 'select':
        if (action.target && action.value) {
          await this.page.selectOption(action.target, action.value)
        }
        break

      case 'upload':
        if (action.target && action.value) {
          await this.page.setInputFiles(action.target, action.value)
        }
        break

      case 'wait':
        const waitTime = parseInt(action.value || '2000')
        await this.page.waitForTimeout(waitTime)
        break

      case 'navigate':
        if (action.value) {
          await this.page.goto(action.value, { waitUntil: 'networkidle' })
        }
        break

      case 'scroll':
        const scrollAmount = parseInt(action.value || '500')
        await this.page.evaluate((amount) => window.scrollBy(0, amount), scrollAmount)
        break

      case 'submit':
        if (action.target) {
          await this.page.click(action.target)
        } else {
          // Try to find and click submit button
          await this.findAndClickSubmit()
        }
        break
    }

    // Wait for page to settle after action
    await this.page.waitForTimeout(1000)
  }

  /**
   * Smart click that tries multiple selectors
   */
  private async smartClick(target: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    // Try different selector strategies
    const selectors = [
      target,
      `button:has-text("${target}")`,
      `a:has-text("${target}")`,
      `[aria-label="${target}"]`,
      `[title="${target}"]`,
    ]

    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          await element.click()
          return
        }
      } catch (error) {
        continue
      }
    }

    throw new Error(`Could not find clickable element: ${target}`)
  }

  /**
   * Smart type that handles different input types
   */
  private async smartType(target: string, value: string): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    const selectors = [
      target,
      `input[name="${target}"]`,
      `input[id="${target}"]`,
      `textarea[name="${target}"]`,
      `[aria-label="${target}"]`,
    ]

    for (const selector of selectors) {
      try {
        const element = await this.page.$(selector)
        if (element) {
          await element.click()
          await element.fill(value)
          return
        }
      } catch (error) {
        continue
      }
    }

    throw new Error(`Could not find input element: ${target}`)
  }

  /**
   * Find and click submit button
   */
  private async findAndClickSubmit(): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Submit")',
      'button:has-text("Apply")',
      'button:has-text("Send")',
      'button:has-text("Continue")',
      'button:has-text("Next")',
    ]

    for (const selector of submitSelectors) {
      try {
        const element = await this.page.$(selector)
        if (element && (await element.isVisible())) {
          await element.click()
          return
        }
      } catch (error) {
        continue
      }
    }

    throw new Error('Could not find submit button')
  }

  /**
   * Fill form with profile data
   */
  async fillFormWithProfile(profileData: ProfileData): Promise<void> {
    if (!this.page) throw new Error('Browser not initialized')

    // Common field mappings
    const fieldMappings = {
      firstName: ['firstName', 'first_name', 'fname', 'given_name'],
      lastName: ['lastName', 'last_name', 'lname', 'family_name'],
      email: ['email', 'email_address', 'e-mail'],
      phone: ['phone', 'telephone', 'mobile', 'phone_number'],
      location: ['location', 'city', 'address', 'residence'],
    }

    // Try to fill each field
    for (const [key, selectors] of Object.entries(fieldMappings)) {
      const value = profileData[key as keyof ProfileData]
      if (typeof value === 'string') {
        for (const selector of selectors) {
          try {
            const element = await this.page.$(`input[name="${selector}"], input[id="${selector}"]`)
            if (element) {
              await element.fill(value)
              break
            }
          } catch (error) {
            continue
          }
        }
      }
    }
  }

  /**
   * Get current page URL
   */
  getCurrentUrl(): string {
    if (!this.page) throw new Error('Browser not initialized')
    return this.page.url()
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized')
    return await this.page.title()
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    if (!this.page) throw new Error('Browser not initialized')
    const element = await this.page.$(selector)
    return element !== null
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.page) await this.page.close()
    if (this.context) await this.context.close()
    if (this.browser) await this.browser.close()

    this.page = null
    this.context = null
    this.browser = null
  }
}
