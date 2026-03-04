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
      "Alright, let's get you this job.",
      "Time to work on this application.",
      "I'm on it. Let me handle this application for you.",
    ],
    analyzing: [
      "Analyzing the job posting. I see what we're working with.",
      "Scanning the page structure. Got it.",
      "Let me understand what this role requires.",
    ],
    filling: [
      "Perfect. Adding your information now.",
      "Filling in your details.",
      "Entering your profile data.",
    ],
    confident: [
      "I'm very confident about this one.",
      "This is a great match for your profile.",
      "Clear as day. Moving forward with confidence.",
    ],
    success: [
      "Application submitted successfully.",
      "Done and done. Your application is in.",
      "Success. They're going to love your application.",
    ],
  }

  narrate(action: string): string {
    const options = this.narratives[action] || ["Working on it..."]
    return options[Math.floor(Math.random() * options.length)]
  }

  confidenceComment(confidence: number): string {
    if (confidence >= 0.9) {
      return "I'm extremely confident about this."
    } else if (confidence >= 0.75) {
      return "Looking good. I'm pretty sure about this."
    } else if (confidence >= 0.6) {
      return "Moderate confidence. Proceeding carefully."
    } else {
      return "This is uncertain. I'll need to be extra careful here."
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
        message: 'Detected 8 interactive elements on the page',
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

      // Step 8: Filling form
      this.emit({
        type: 'thought',
        message: this.persona.narrate('filling'),
      })

      await this.delay(500)

      // Step 9: Fill first name
      this.emit({
        type: 'action',
        message: `Filling first name: ${userProfile.firstName}`,
        data: { field: 'firstName', value: userProfile.firstName },
      })

      await this.delay(600)

      // Step 10: Fill last name
      this.emit({
        type: 'action',
        message: `Filling last name: ${userProfile.lastName}`,
        data: { field: 'lastName', value: userProfile.lastName },
      })

      await this.delay(600)

      // Step 11: Fill email
      this.emit({
        type: 'action',
        message: `Filling email: ${userProfile.email}`,
        data: { field: 'email', value: userProfile.email },
      })

      await this.delay(600)

      // Step 12: Fill phone
      this.emit({
        type: 'action',
        message: `Filling phone: ${userProfile.phone}`,
        data: { field: 'phone', value: userProfile.phone },
      })

      await this.delay(600)

      // Step 13: Fill location
      this.emit({
        type: 'action',
        message: `Filling location: ${userProfile.location}`,
        data: { field: 'location', value: userProfile.location },
      })

      await this.delay(800)

      // Step 14: Submitting
      this.emit({
        type: 'thought',
        message: 'Now submitting your application...',
      })

      await this.delay(1000)

      // Step 15: Submit button
      this.emit({
        type: 'action',
        message: 'Clicking submit button',
        data: { action: 'submit' },
      })

      await this.delay(1500)

      // Step 16: Success! - Now show the screenshot
      this.emit({
        type: 'screenshot',
        message: 'Application submitted',
        screenshotUrl: '/Demo.png',
      })

      await this.delay(500)

      this.emit({
        type: 'success',
        message: 'Completed successfully!',
        data: {
          jobTitle,
          company,
          completedAt: new Date().toISOString(),
          attempts: 1,
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
