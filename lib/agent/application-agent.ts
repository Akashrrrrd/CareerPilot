import { BrowserController } from './browser-controller'
import { VisionAnalyzer } from './vision-analyzer'
import { geminiModel } from './gemini-client'
import type {
  ApplicationJob,
  AgentSession,
  AgentLog,
  AgentAction,
  ProfileData,
  PageAnalysis,
} from './types'

export class ApplicationAgent {
  private browser: BrowserController
  private vision: VisionAnalyzer
  private session: AgentSession | null = null
  private logs: AgentLog[] = []

  constructor() {
    this.browser = new BrowserController()
    this.vision = new VisionAnalyzer()
  }

  /**
   * Main method to process a job application
   */
  async processApplication(job: ApplicationJob, profile: ProfileData): Promise<AgentSession> {
    this.session = {
      id: `session_${Date.now()}`,
      jobId: job.id,
      status: 'running',
      currentStep: 0,
      totalSteps: 10, // Estimated
      logs: [],
      startTime: new Date(),
    }

    try {
      await this.log('info', `Starting application for ${job.title} at ${job.company}`)

      // Initialize browser
      await this.browser.initialize()
      await this.log('info', 'Browser initialized')

      // Navigate to job URL
      await this.log('info', `Navigating to ${job.url}`)
      const initialScreenshot = await this.browser.navigateAndCapture(job.url)
      await this.log('info', 'Page loaded', initialScreenshot)

      // Analyze the page
      await this.log('info', 'Analyzing page with Gemini Vision...')
      const analysis = await this.vision.analyzeScreenshot(initialScreenshot)
      await this.log('info', `Page type detected: ${analysis.pageType}`)

      // Check for CAPTCHA
      const hasCaptcha = await this.vision.detectCaptcha(initialScreenshot)
      if (hasCaptcha) {
        throw new Error('CAPTCHA detected - human intervention required')
      }

      // Process based on page type
      switch (analysis.pageType) {
        case 'job_listing':
          await this.handleJobListing(analysis, profile)
          break

        case 'application_form':
          await this.handleApplicationForm(analysis, profile)
          break

        case 'login':
          await this.log('warning', 'Login required - cannot proceed automatically')
          throw new Error('Authentication required')

        case 'multi_step':
          await this.handleMultiStepApplication(analysis, profile)
          break

        default:
          await this.log('warning', `Unknown page type: ${analysis.pageType}`)
          throw new Error('Unable to determine page type')
      }

      // Verify submission
      await this.log('info', 'Verifying application submission...')
      const finalScreenshot = await this.browser.takeScreenshot()
      const verification = await this.vision.verifyAction(
        initialScreenshot,
        finalScreenshot,
        'Application submitted successfully'
      )

      if (verification.success) {
        await this.log('success', `Application submitted: ${verification.description}`, finalScreenshot)
        this.session.status = 'completed'
      } else {
        throw new Error(`Submission verification failed: ${verification.description}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.log('error', `Application failed: ${errorMessage}`)
      this.session.status = 'failed'
      throw error
    } finally {
      await this.browser.close()
      this.session.endTime = new Date()
      this.session.logs = this.logs
    }

    return this.session
  }

  /**
   * Handle job listing page (find and click apply button)
   */
  private async handleJobListing(analysis: PageAnalysis, profile: ProfileData): Promise<void> {
    await this.log('info', 'Looking for Apply button...')

    // Find apply button from analysis
    const applyButton = analysis.elements.find(
      (el) =>
        el.type === 'button' &&
        (el.label.toLowerCase().includes('apply') || el.label.toLowerCase().includes('submit'))
    )

    if (!applyButton) {
      throw new Error('Could not find Apply button')
    }

    // Click apply button
    const action: AgentAction = {
      type: 'click',
      target: applyButton.label,
      description: `Click "${applyButton.label}" button`,
    }

    await this.browser.executeAction(action)
    await this.log('info', `Clicked "${applyButton.label}"`)

    // Wait and analyze next page
    await this.browser.executeAction({ type: 'wait', value: '3000', description: 'Wait for form to load' })
    const nextScreenshot = await this.browser.takeScreenshot()
    const nextAnalysis = await this.vision.analyzeScreenshot(nextScreenshot)

    // Recursively handle the next page
    if (nextAnalysis.pageType === 'application_form') {
      await this.handleApplicationForm(nextAnalysis, profile)
    } else if (nextAnalysis.pageType === 'multi_step') {
      await this.handleMultiStepApplication(nextAnalysis, profile)
    }
  }

  /**
   * Handle single-page application form
   */
  private async handleApplicationForm(analysis: PageAnalysis, profile: ProfileData): Promise<void> {
    await this.log('info', `Filling application form with ${analysis.formFields.length} fields`)

    // Fill each form field
    for (const field of analysis.formFields) {
      try {
        const value = this.getProfileValue(field.mappedTo, profile)

        if (value) {
          const action: AgentAction = {
            type: field.type === 'file' ? 'upload' : 'type',
            target: field.name,
            value: value,
            description: `Fill "${field.label}" with ${field.type === 'file' ? 'file' : 'value'}`,
          }

          await this.browser.executeAction(action, profile)
          await this.log('info', `Filled field: ${field.label}`)
        } else if (field.required) {
          await this.log('warning', `Required field "${field.label}" has no value`)
        }
      } catch (error) {
        await this.log('warning', `Failed to fill field "${field.label}": ${error}`)
      }
    }

    // Take screenshot before submission
    const beforeSubmit = await this.browser.takeScreenshot()
    await this.log('info', 'Form filled, preparing to submit', beforeSubmit)

    // Submit form
    await this.browser.executeAction({
      type: 'submit',
      description: 'Submit application form',
    })

    await this.log('info', 'Form submitted')
  }

  /**
   * Handle multi-step application process
   */
  private async handleMultiStepApplication(analysis: PageAnalysis, profile: ProfileData): Promise<void> {
    await this.log('info', 'Starting multi-step application process')

    let currentStep = 1
    let maxSteps = 10 // Safety limit

    while (currentStep <= maxSteps) {
      await this.log('info', `Processing step ${currentStep}`)

      // Fill current page
      await this.handleApplicationForm(analysis, profile)

      // Check if there's a "Next" or "Continue" button
      const hasNext = analysis.nextSteps.some((step) =>
        step.toLowerCase().includes('next') || step.toLowerCase().includes('continue')
      )

      if (!hasNext) {
        await this.log('info', 'No more steps detected')
        break
      }

      // Click next/continue
      await this.browser.executeAction({
        type: 'click',
        target: 'Next',
        description: 'Click Next/Continue button',
      })

      await this.browser.executeAction({
        type: 'wait',
        value: '2000',
        description: 'Wait for next step',
      })

      // Analyze next page
      const nextScreenshot = await this.browser.takeScreenshot()
      analysis = await this.vision.analyzeScreenshot(nextScreenshot)

      // Check if we reached confirmation page
      if (analysis.pageType === 'confirmation') {
        await this.log('success', 'Reached confirmation page')
        break
      }

      currentStep++
    }

    if (currentStep > maxSteps) {
      throw new Error('Exceeded maximum steps for multi-step application')
    }
  }

  /**
   * Get value from profile data based on mapping
   */
  private getProfileValue(mappedTo: string | undefined, profile: ProfileData): string | undefined {
    if (!mappedTo) return undefined

    const value = profile[mappedTo as keyof ProfileData]
    return typeof value === 'string' ? value : undefined
  }

  /**
   * Log an event
   */
  private async log(
    level: 'info' | 'warning' | 'error' | 'success',
    message: string,
    screenshot?: Buffer
  ): Promise<void> {
    const log: AgentLog = {
      timestamp: new Date(),
      level,
      message,
      screenshot: screenshot ? screenshot.toString('base64') : undefined,
    }

    this.logs.push(log)

    if (this.session) {
      this.session.currentStep++
    }

    console.log(`[${level.toUpperCase()}] ${message}`)
  }

  /**
   * Get current session
   */
  getSession(): AgentSession | null {
    return this.session
  }

  /**
   * Get all logs
   */
  getLogs(): AgentLog[] {
    return this.logs
  }
}
