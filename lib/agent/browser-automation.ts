import { chromium, Browser, Page } from 'playwright'
import { GoogleGenAI } from '@google/genai'

const genAI = new GoogleGenAI({
  vertexai: false,
  apiKey: process.env.GEMINI_API_KEY || '',
})

export class BrowserAutomation {
  private browser: Browser | null = null
  public page: Page | null = null

  async initialize() {
    try {
      console.log('[Browser] Launching Playwright Chromium...')
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      })
      console.log('[Browser] Browser launched successfully')
      
      this.page = await this.browser.newPage()
      await this.page.setViewportSize({ width: 1920, height: 1080 })
      console.log('[Browser] Page created successfully')
    } catch (error) {
      console.error('[Browser] Failed to initialize:', error)
      throw new Error(`Browser initialization failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async navigateTo(url: string) {
    if (!this.page) throw new Error('Browser not initialized')
    
    try {
      console.log(`[Browser] Navigating to: ${url}`)
      await this.page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
      await this.page.waitForTimeout(2000) // Wait for dynamic content
      console.log('[Browser] Navigation successful')
    } catch (error) {
      console.error('[Browser] Navigation failed:', error)
      throw new Error(`Navigation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  async navigateAndCapture(url: string): Promise<string> {
    await this.navigateTo(url)
    return await this.takeScreenshot()
  }

  async takeScreenshot(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized')
    const screenshot = await this.page.screenshot({ fullPage: false })
    return screenshot.toString('base64')
  }

  async captureCurrentState(): Promise<string> {
    return await this.takeScreenshot()
  }

  async analyzePageWithGemini(screenshot: string): Promise<any> {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

    const prompt = `Analyze this job application page screenshot. Identify:
1. Page type (job_listing, application_form, login, multi_step, confirmation, unknown)
2. All form fields visible (name, type, label, required)
3. Buttons (especially Apply, Submit, Next, Continue)
4. Any special requirements or instructions

Return a JSON object with this structure:
{
  "pageType": "application_form",
  "formFields": [
    {"name": "firstName", "type": "text", "label": "First Name", "required": true},
    ...
  ],
  "buttons": [
    {"text": "Apply Now", "type": "submit"},
    ...
  ],
  "instructions": "any special instructions found",
  "requiresLogin": false
}`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: 'image/png',
          data: screenshot,
        },
      },
    ])

    const response = result.response.text()
    
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (e) {
      console.error('Failed to parse Gemini response:', e)
    }

    return {
      pageType: 'unknown',
      formFields: [],
      buttons: [],
      instructions: response,
      requiresLogin: false,
    }
  }

  async fillField(selector: string, value: string) {
    if (!this.page) throw new Error('Browser not initialized')
    
    try {
      // Try multiple selector strategies
      const element = await this.page.locator(selector).first()
      await element.waitFor({ timeout: 5000 })
      await element.fill(value)
      return true
    } catch (e) {
      console.error(`Failed to fill field ${selector}:`, e)
      return false
    }
  }

  async clickButton(text: string) {
    if (!this.page) throw new Error('Browser not initialized')
    
    try {
      // Try to find button by text
      const button = this.page.getByRole('button', { name: new RegExp(text, 'i') })
      await button.click()
      await this.page.waitForTimeout(2000)
      return true
    } catch (e) {
      console.error(`Failed to click button "${text}":`, e)
      return false
    }
  }

  async findAndFillForm(profile: any, analysis: any) {
    const results: any[] = []

    for (const field of analysis.formFields) {
      let value = ''

      // Map form fields to profile data
      const fieldName = field.name.toLowerCase()
      const fieldLabel = field.label.toLowerCase()

      if (fieldName.includes('first') || fieldLabel.includes('first')) {
        value = profile.firstName
      } else if (fieldName.includes('last') || fieldLabel.includes('last')) {
        value = profile.lastName
      } else if (fieldName.includes('email')) {
        value = profile.email
      } else if (fieldName.includes('phone')) {
        value = profile.phone || ''
      } else if (fieldName.includes('location') || fieldName.includes('city')) {
        value = profile.location || ''
      } else if (fieldName.includes('headline') || fieldName.includes('title')) {
        value = profile.headline || ''
      } else if (fieldName.includes('summary') || fieldName.includes('about')) {
        value = profile.summary || ''
      }

      if (value) {
        const success = await this.fillField(`[name="${field.name}"]`, value)
        results.push({
          field: field.label,
          value: value.substring(0, 50) + (value.length > 50 ? '...' : ''),
          success,
        })
      }
    }

    return results
  }

  async submitForm() {
    if (!this.page) throw new Error('Browser not initialized')
    
    try {
      // Try to find and click submit button
      const submitButton = this.page.getByRole('button', { 
        name: /submit|apply|send|continue/i 
      }).first()
      
      await submitButton.click()
      await this.page.waitForTimeout(3000)
      return true
    } catch (e) {
      console.error('Failed to submit form:', e)
      return false
    }
  }

  async getPageText(): Promise<string> {
    if (!this.page) throw new Error('Browser not initialized')
    return await this.page.textContent('body') || ''
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.page = null
    }
  }
}
