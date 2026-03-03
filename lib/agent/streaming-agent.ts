import { EventEmitter } from 'events'
import { BrowserController } from './browser-controller'
import { VisionAnalyzer } from './vision-analyzer'
import type { ApplicationJob, ProfileData, AgentLog } from './types'

export interface StreamEvent {
  type: 'status' | 'progress' | 'log' | 'screenshot' | 'complete' | 'error'
  step: string
  message: string
  progress?: number
  screenshot?: string
  confidence?: number
  data?: any
}

export class StreamingAgent extends EventEmitter {
  private browser: BrowserController
  private vision: VisionAnalyzer
  private totalSteps = 8

  constructor() {
    super()
    this.browser = new BrowserController()
    this.vision = new VisionAnalyzer()
  }

  private emit(event: StreamEvent) {
    super.emit('update', event)
  }

  async processApplicationWithStreaming(
    job: ApplicationJob,
    profile: ProfileData
  ): Promise<void> {
    try {
      // Step 1: Initialize
      this.emitStatus('initializing', 'Starting up the agent...', 0)
      await this.browser.initialize()
      await this.sleep(500)

      // Step 2: Navigate
      this.emitStatus('navigating', `Opening ${job.company} job page...`, 12.5)
      const screenshot = await this.browser.navigateAndCapture(job.url)
      this.emitScreenshot(screenshot, 'Initial page load')

      // Step 3: Analyze
      this.emitStatus('analyzing', 'Gemini is analyzing the page structure...', 25)
      const analysis = await this.vision.analyzeScreenshot(screenshot)
      this.emitLog('info', `Detected page type: ${analysis.pageType}`)
      this.emitLog('info', `Found ${analysis.formFields.length} form fields`)

      // Step 4: Check for blockers
      this.emitStatus('checking', 'Checking for CAPTCHAs and login requirements...', 37.5)
      const hasCaptcha = await this.vision.detectCaptcha(screenshot)
      if (hasCaptcha) {
        throw new Error('CAPTCHA detected - human intervention required')
      }

      // Step 5: Fill form
      this.emitStatus(
        'filling',
        `Filling ${analysis.formFields.length} fields with your profile data...`,
        50
      )

      for (let i = 0; i < analysis.formFields.length; i++) {
        const field = analysis.formFields[i]
        const progress = 50 + (25 * (i + 1)) / analysis.formFields.length

        this.emitLog('info', `Filling field: ${field.label}`)
        this.emitStatus('filling', `Filling "${field.label}"...`, progress)

        // Simulate field filling (replace with actual logic)
        await this.sleep(300)
      }

      // Step 6: Review
      this.emitStatus('reviewing', 'Reviewing filled form before submission...', 75)
      const beforeSubmit = await this.browser.takeScreenshot()
      this.emitScreenshot(beforeSubmit, 'Form filled - ready to submit')
      await this.sleep(1000)

      // Step 7: Submit
      this.emitStatus('submitting', 'Submitting your application...', 87.5)
      await this.browser.executeAction({
        type: 'submit',
        description: 'Submit application form',
      })
      await this.sleep(2000)

      // Step 8: Verify
      this.emitStatus('verifying', 'Verifying submission success...', 95)
      const afterSubmit = await this.browser.takeScreenshot()
      this.emitScreenshot(afterSubmit, 'After submission')

      const verification = await this.vision.verifyAction(
        beforeSubmit,
        afterSubmit,
        'Application submitted successfully'
      )

      if (verification.success) {
        this.emitComplete('Application submitted successfully! 🎉', afterSubmit)
      } else {
        throw new Error(`Verification failed: ${verification.description}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.emitError(errorMessage)
      throw error
    } finally {
      await this.browser.close()
    }
  }

  private emitStatus(step: string, message: string, progress: number) {
    this.emit({
      type: 'status',
      step,
      message,
      progress,
    })
  }

  private emitLog(level: 'info' | 'warning' | 'error', message: string) {
    this.emit({
      type: 'log',
      step: 'logging',
      message,
      data: { level },
    })
  }

  private emitScreenshot(screenshot: Buffer, description: string) {
    this.emit({
      type: 'screenshot',
      step: 'screenshot',
      message: description,
      screenshot: screenshot.toString('base64'),
    })
  }

  private emitComplete(message: string, screenshot?: Buffer) {
    this.emit({
      type: 'complete',
      step: 'complete',
      message,
      progress: 100,
      screenshot: screenshot?.toString('base64'),
    })
  }

  private emitError(message: string) {
    this.emit({
      type: 'error',
      step: 'error',
      message,
      progress: 0,
    })
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
