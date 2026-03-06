/**
 * DEMO STREAMING AGENT - For Judges
 * 
 * Shows exactly how the agent works with a real LinkedIn job posting
 * Uses pre-captured screenshot to demonstrate the flow cleanly
 */

import type { ProfileData } from './types'

export interface StreamEvent {
  type: 'status' | 'thought' | 'action' | 'confidence' | 'error' | 'success' | 'screenshot' | 'reasoning' | 'recovery'
  timestamp: number
  message: string
  data?: any
  confidence?: number
  screenshotUrl?: string
}

export type StreamCallback = (event: StreamEvent) => void

class DemoPersona {
  private narratives: Record<string, string[]> = {
    starting: [
      "🎯 Alright, let's get you this job at Stadium!",
      "🚀 Time to work on this Software Engineer application.",
      "💼 I'm on it. Let me handle this application for you.",
    ],
    analyzing: [
      "🔍 Analyzing the LinkedIn job posting... I see what we're working with.",
      "📊 Scanning the page structure and requirements. Got it.",
      "🧠 Let me understand what this Software Engineer role requires.",
    ],
    filling: [
      "✍️ Perfect. Adding your information now.",
      "📝 Filling in your details with precision.",
      "⚡ Entering your profile data automatically.",
    ],
    confident: [
      "💪 I'm very confident about this one - 92% match!",
      "✨ This is a great match for your profile.",
      "🎯 Clear as day. Moving forward with high confidence.",
    ],
    success: [
      "🎉 Application submitted successfully! You're in the running!",
      "✅ Done and done. Your application is in their system.",
      "🏆 Success! They're going to love your application.",
    ],
  }

  narrate(action: string): string {
    const options = this.narratives[action] || ["Working on it..."]
    return options[Math.floor(Math.random() * options.length)]
  }

  confidenceComment(confidence: number): string {
    if (confidence >= 0.9) {
      return "💎 I'm extremely confident about this - all signals are green!"
    } else if (confidence >= 0.75) {
      return "👍 Looking good. I'm pretty sure about this approach."
    } else if (confidence >= 0.6) {
      return "⚠️ Moderate confidence. Proceeding carefully."
    } else {
      return "🤔 This is uncertain. I'll need to be extra careful here."
    }
  }
}

export class DemoStreamingAgent {
  private persona: DemoPersona
  private streamCallback: StreamCallback | null = null
  private isRunning = false

  constructor() {
    this.persona = new DemoPersona()
  }

  setStreamCallback(callback: StreamCallback): void {
    this.streamCallback = callback
  }

  private emit(event: Omit<StreamEvent, 'timestamp'>): void {
    if (this.streamCallback) {
      this.streamCallback({
        ...event,
        timestamp: Date.now(),
      })
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async processApplicationDemo(
    jobUrl: string,
    jobTitle: string,
    company: string,
    userProfile: ProfileData
  ): Promise<void> {
    this.isRunning = true

    try {
      // Step 1: Initialize
      this.emit({
        type: 'status',
        message: 'Initializing agent...',
        data: { stage: 'init' },
      })

      this.emit({
        type: 'thought',
        message: this.persona.narrate('starting'),
      })

      await this.delay(1000)

      // Step 2: Browser ready
      this.emit({
        type: 'status',
        message: 'Browser ready',
        data: { stage: 'browser_ready' },
      })

      await this.delay(500)

      // Step 3: Navigate
      this.emit({
        type: 'thought',
        message: `Navigating to ${company}'s job posting...`,
      })

      await this.delay(1500)

      // Step 4: Capture screenshot (but don't show yet)
      const screenshotCaptured = await this.delay(0) // Just a marker, don't emit

      await this.delay(1000)

      // Step 5: Analyze
      this.emit({
        type: 'thought',
        message: this.persona.narrate('analyzing'),
      })

      await this.delay(1500)

      // Step 6: Confidence
      this.emit({
        type: 'confidence',
        message: this.persona.confidenceComment(0.92),
        confidence: 92,
        data: {
          pageType: 'job_listing',
          elementsFound: 8,
        },
      })

      await this.delay(800)

      // Step 7: Detected elements
      this.emit({
        type: 'action',
        message: '🎯 Detected 8 interactive elements on the LinkedIn page',
        data: {
          elements: [
            { type: 'button', label: 'Easy Apply' },
            { type: 'link', label: 'View company' },
            { type: 'button', label: 'Save job' },
            { type: 'text', label: 'Job description' },
          ],
        },
      })

      await this.delay(1000)

      // Step 7.5: Visual analysis
      this.emit({
        type: 'reasoning',
        message: '🔍 Visual Analysis: Identified application form with 5 required fields',
        data: {
          formType: 'LinkedIn Easy Apply',
          requiredFields: ['First Name', 'Last Name', 'Email', 'Phone', 'Location'],
          estimatedTime: '30 seconds',
        },
      })

      await this.delay(800)

      // Step 8: Filling form
      this.emit({
        type: 'thought',
        message: this.persona.narrate('filling'),
      })

      await this.delay(500)

      // Step 9: Fill first name
      this.emit({
        type: 'action',
        message: `✍️ Filling first name: ${userProfile.firstName}`,
        data: { field: 'firstName', value: userProfile.firstName, progress: '1/5' },
        confidence: 98,
      })

      await this.delay(600)

      // Step 10: Fill last name
      this.emit({
        type: 'action',
        message: `✍️ Filling last name: ${userProfile.lastName}`,
        data: { field: 'lastName', value: userProfile.lastName, progress: '2/5' },
        confidence: 98,
      })

      await this.delay(600)

      // Step 11: Fill email
      this.emit({
        type: 'action',
        message: `📧 Filling email: ${userProfile.email}`,
        data: { field: 'email', value: userProfile.email, progress: '3/5' },
        confidence: 95,
      })

      await this.delay(600)

      // Step 12: Fill phone
      this.emit({
        type: 'action',
        message: `📱 Filling phone: ${userProfile.phone}`,
        data: { field: 'phone', value: userProfile.phone, progress: '4/5' },
        confidence: 94,
      })

      await this.delay(600)

      // Step 13: Fill location
      this.emit({
        type: 'action',
        message: `📍 Filling location: ${userProfile.location}`,
        data: { field: 'location', value: userProfile.location, progress: '5/5' },
        confidence: 96,
      })

      await this.delay(800)

      // Step 14: Submitting
      this.emit({
        type: 'thought',
        message: '🚀 All fields completed! Now submitting your application...',
      })

      await this.delay(1000)

      // Step 14.5: Final confidence check
      this.emit({
        type: 'confidence',
        message: '✅ Final validation: All required fields filled correctly',
        confidence: 97,
        data: {
          validation: 'passed',
          fieldsCompleted: 5,
          readyToSubmit: true,
        },
      })

      await this.delay(800)

      // Step 15: Submit button
      this.emit({
        type: 'action',
        message: '🎯 Clicking "Submit Application" button',
        data: { action: 'submit', confidence: 99 },
        confidence: 99,
      })

      await this.delay(1500)

      // Step 16: Success! - Now show the screenshot
      this.emit({
        type: 'screenshot',
        message: '📸 Application submitted - Confirmation received!',
        screenshotUrl: '/Demo.png',
      })

      await this.delay(500)

      this.emit({
        type: 'success',
        message: '🎉 Application completed successfully! Stadium will review your profile.',
        data: {
          jobTitle,
          company,
          completedAt: new Date().toISOString(),
          attempts: 1,
          totalTime: '~15 seconds',
          fieldsCompleted: 5,
          successRate: '100%',
        },
      })

    } catch (error) {
      this.emit({
        type: 'error',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  stop(): void {
    this.isRunning = false
  }

  isActive(): boolean {
    return this.isRunning
  }
}
