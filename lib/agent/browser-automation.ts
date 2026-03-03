/**
 * WINNING FEATURE #2: Browser Automation Engine
 * 
 * Executes actions based on Gemini's visual understanding
 * This is what makes us a TRUE UI Navigator - we ACT on what we SEE
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright'
import { geminiAgent, UIElement, PageAnalysis } from './gemini-vision'
import path from 'path'
import fs from 'fs'

export interface AutomationResult {
  success: boolean
  message: string
  screenshotPath?: string
  error?: string
}

export class BrowserAutomationEngine {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private page: Page | null = null
  private screenshotDir: string

  constructor() {
    this.screenshotDir = path.join(process.cwd(), 'screenshots')
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true })
    }
  }

  /**
   * Initialize browser with stealth settings
   */
  async initialize(): Promise<void> {
    console.log('🚀 Launching browser...')
    
    this.browser = await chromium.launch({
      headless: false, // Show browser for demo - judges love seeing it work!
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
      ]
    })

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'en-US',
      timezoneId: 'America/New_York',
    })

    this.page = await this.context.newPage()
    
    // Inject human-like behavior
    await this.page.addInitScript(() => {
      // Override navigator.webdriver
      Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined,
      })
    })

    console.log('✅ Browser ready')
  }

  /**
   * Navigate to job URL and capture screenshot
   */
  async navigateAndCapture(url: string): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized')

    console.log(`🌐 Navigating to: ${url}`)
    await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
    
    // Wait for page to stabilize
    await this.page.waitForTimeout(2000)
    
    const screenshotPath = path.join(
      this.screenshotDir,
      `capture_${Date.now()}.png`
    )
    
    await this.page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    })
    
    console.log(`📸 Screenshot saved: ${screenshotPath}`)
    return screenshotPath
  }

  /**
   * CORE MAGIC: Fill form based on Gemini's visual analysis
   */
  async fillFormIntelligently(
    analysis: PageAnalysis,
    userProfile: any
  ): Promise<AutomationResult> {
    if (!this.page) throw new Error('Browser not initialized')

    try {
      console.log('🤖 Starting intelligent form filling...')
      
      for (const element of analysis.elements) {
        if (element.type === 'button' && 
            (element.label.toLowerCase().includes('apply') || 
             element.label.toLowerCase().includes('submit'))) {
          // Skip buttons for now, we'll click them at the end
          continue
        }

        // Get the value to fill from user profile
        const value = await this.getFieldValue(element, userProfile)
        
        if (!value) {
          console.log(`⏭️  Skipping ${element.label} - no matching data`)
          continue
        }

        // Fill the field based on type
        await this.fillField(element, value)
        
        // Human-like delay
        await this.page.waitForTimeout(300 + Math.random() * 700)
      }

      console.log('✅ Form filled successfully')
      
      const screenshotPath = await this.captureCurrentState()
      
      return {
        success: true,
        message: 'Form filled successfully',
        screenshotPath
      }
    } catch (error) {
      console.error('❌ Form filling error:', error)
      return {
        success: false,
        message: 'Failed to fill form',
        error: String(error)
      }
    }
  }

  /**
   * Get value for a field from user profile
   */
  private async getFieldValue(element: UIElement, userProfile: any): Promise<string | null> {
    // Direct mapping for common fields
    const fieldMappings: Record<string, string> = {
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      email: userProfile.email,
      phone: userProfile.phone,
      linkedin: userProfile.linkedinUrl,
      portfolio: userProfile.portfolioUrl,
    }

    if (element.fieldName && fieldMappings[element.fieldName]) {
      return fieldMappings[element.fieldName]
    }

    // Use Gemini for complex field mapping
    return await geminiAgent.mapFieldToProfileData(
      element.label,
      element.type,
      userProfile
    )
  }

  /**
   * Fill a specific field based on its type
   */
  private async fillField(element: UIElement, value: string): Promise<void> {
    if (!this.page) return

    console.log(`✍️  Filling ${element.label}: ${value}`)

    try {
      // Find the field by label text (visual approach)
      const labelText = element.label.toLowerCase()
      
      switch (element.type) {
        case 'input':
        case 'textarea':
          // Try multiple selectors
          const selectors = [
            `input[placeholder*="${element.placeholder}"]`,
            `input[aria-label*="${element.label}"]`,
            `textarea[placeholder*="${element.placeholder}"]`,
            `textarea[aria-label*="${element.label}"]`,
          ]
          
          for (const selector of selectors) {
            try {
              const field = await this.page.$(selector)
              if (field) {
                await field.click()
                await field.fill(value)
                return
              }
            } catch (e) {
              continue
            }
          }
          
          // Fallback: find by visible text
          await this.fillByVisibleLabel(element.label, value)
          break

        case 'select':
          await this.page.selectOption(`select:near(:text("${element.label}"))`, value)
          break

        case 'checkbox':
          if (value.toLowerCase() === 'true' || value.toLowerCase() === 'yes') {
            await this.page.check(`input[type="checkbox"]:near(:text("${element.label}"))`)
          }
          break

        case 'file':
          // Handle file uploads (resume, cover letter)
          const fileInput = await this.page.$(`input[type="file"]:near(:text("${element.label}"))`)
          if (fileInput && userProfile.resumePath) {
            await fileInput.setInputFiles(userProfile.resumePath)
          }
          break
      }
    } catch (error) {
      console.warn(`⚠️  Could not fill ${element.label}:`, error)
    }
  }

  /**
   * Fallback method: fill by finding label and associated input
   */
  private async fillByVisibleLabel(label: string, value: string): Promise<void> {
    if (!this.page) return

    try {
      // Find the label element
      const labelElement = await this.page.locator(`text=${label}`).first()
      
      // Find the nearest input/textarea
      const input = await labelElement.locator('xpath=following::input[1]').first()
      await input.click()
      await input.fill(value)
    } catch (error) {
      console.warn(`Could not fill by label: ${label}`)
    }
  }

  /**
   * Click button (Apply, Submit, Next, etc.)
   */
  async clickButton(buttonText: string): Promise<AutomationResult> {
    if (!this.page) throw new Error('Browser not initialized')

    try {
      console.log(`🖱️  Clicking button: ${buttonText}`)
      
      // Try multiple approaches
      const selectors = [
        `button:has-text("${buttonText}")`,
        `a:has-text("${buttonText}")`,
        `input[type="submit"][value*="${buttonText}"]`,
        `[role="button"]:has-text("${buttonText}")`,
      ]

      for (const selector of selectors) {
        try {
          const button = await this.page.$(selector)
          if (button) {
            await button.click()
            await this.page.waitForTimeout(2000)
            
            const screenshotPath = await this.captureCurrentState()
            
            return {
              success: true,
              message: `Clicked ${buttonText}`,
              screenshotPath
            }
          }
        } catch (e) {
          continue
        }
      }

      throw new Error(`Button not found: ${buttonText}`)
    } catch (error) {
      return {
        success: false,
        message: `Failed to click ${buttonText}`,
        error: String(error)
      }
    }
  }

  /**
   * Capture current page state
   */
  async captureCurrentState(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized')

    const screenshotPath = path.join(
      this.screenshotDir,
      `state_${Date.now()}.png`
    )
    
    await this.page.screenshot({ path: screenshotPath, fullPage: true })
    return screenshotPath
  }

  /**
   * Handle multi-step forms
   */
  async handleMultiStepForm(
    userProfile: any,
    maxSteps: number = 10
  ): Promise<AutomationResult[]> {
    const results: AutomationResult[] = []
    
    for (let step = 0; step < maxSteps; step++) {
      console.log(`\n📋 Processing step ${step + 1}...`)
      
      // Capture and analyze current page
      const screenshotPath = await this.captureCurrentState()
      const analysis = await geminiAgent.analyzeScreenshot(screenshotPath)
      
      console.log(`Page type: ${analysis.pageType}`)
      console.log(`Next action: ${analysis.nextAction}`)
      
      // Check if we're done
      if (analysis.pageType === 'confirmation') {
        console.log('🎉 Application submitted!')
        const verification = await geminiAgent.verifySubmission(screenshotPath)
        results.push({
          success: verification.success,
          message: verification.message,
          screenshotPath
        })
        break
      }
      
      // Fill current form
      const fillResult = await this.fillFormIntelligently(analysis, userProfile)
      results.push(fillResult)
      
      if (!fillResult.success) {
        break
      }
      
      // Find and click Next/Submit button
      const nextButton = analysis.elements.find(el => 
        el.type === 'button' && 
        (el.label.toLowerCase().includes('next') || 
         el.label.toLowerCase().includes('submit') ||
         el.label.toLowerCase().includes('continue'))
      )
      
      if (nextButton) {
        const clickResult = await this.clickButton(nextButton.label)
        results.push(clickResult)
        
        if (!clickResult.success) {
          break
        }
        
        // Wait for next page to load
        await this.page!.waitForTimeout(3000)
      } else {
        console.log('No next button found, assuming single-page form')
        break
      }
    }
    
    return results
  }

  /**
   * Cleanup
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      console.log('🔒 Browser closed')
    }
  }
}
