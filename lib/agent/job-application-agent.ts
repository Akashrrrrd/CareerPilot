/**
 * WINNING FEATURE #3: Complete Job Application Agent
 * 
 * Orchestrates the entire application process from start to finish
 * This is what ties everything together into a WINNING solution
 */

import { BrowserAutomationEngine, AutomationResult } from './browser-automation'
import { geminiAgent } from './gemini-vision'
import { prisma } from '@/lib/db'

export interface JobApplicationTask {
  id: string
  userId: string
  jobUrl: string
  jobTitle: string
  company: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  profileId: string
}

export interface ApplicationProgress {
  taskId: string
  status: 'started' | 'analyzing' | 'filling' | 'submitting' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  message: string
  screenshotUrl?: string
  error?: string
}

export class JobApplicationAgent {
  private browser: BrowserAutomationEngine
  private progressCallbacks: Map<string, (progress: ApplicationProgress) => void>

  constructor() {
    this.browser = new BrowserAutomationEngine()
    this.progressCallbacks = new Map()
  }

  /**
   * Register progress callback for real-time updates
   */
  onProgress(taskId: string, callback: (progress: ApplicationProgress) => void): void {
    this.progressCallbacks.set(taskId, callback)
  }

  /**
   * Send progress update
   */
  private updateProgress(taskId: string, progress: Partial<ApplicationProgress>): void {
    const callback = this.progressCallbacks.get(taskId)
    if (callback) {
      callback({
        taskId,
        status: 'started',
        currentStep: 0,
        totalSteps: 0,
        message: '',
        ...progress
      } as ApplicationProgress)
    }
  }

  /**
   * MAIN METHOD: Apply to a job automatically
   * This is the money shot that wins the hackathon!
   */
  async applyToJob(task: JobApplicationTask): Promise<{
    success: boolean
    applicationId?: string
    message: string
    screenshots: string[]
    confirmationNumber?: string
  }> {
    const screenshots: string[] = []
    
    try {
      console.log(`\n${'='.repeat(60)}`)
      console.log(`🎯 STARTING APPLICATION: ${task.jobTitle} at ${task.company}`)
      console.log(`${'='.repeat(60)}\n`)

      this.updateProgress(task.id, {
        status: 'started',
        message: 'Initializing browser...',
        currentStep: 1,
        totalSteps: 5
      })

      // Initialize browser
      await this.browser.initialize()

      // Get user profile data
      this.updateProgress(task.id, {
        status: 'analyzing',
        message: 'Loading your profile...',
        currentStep: 2,
        totalSteps: 5
      })

      const profile = await this.getUserProfile(task.profileId)
      
      if (!profile) {
        throw new Error('User profile not found')
      }

      // Navigate to job URL
      this.updateProgress(task.id, {
        status: 'analyzing',
        message: `Navigating to ${task.company}...`,
        currentStep: 3,
        totalSteps: 5
      })

      const initialScreenshot = await this.browser.navigateAndCapture(task.jobUrl)
      screenshots.push(initialScreenshot)

      // Analyze the page
      this.updateProgress(task.id, {
        status: 'analyzing',
        message: 'Analyzing application form with AI...',
        currentStep: 3,
        totalSteps: 5
      })

      const analysis = await geminiAgent.analyzeScreenshot(initialScreenshot)
      
      console.log(`\n📊 Page Analysis:`)
      console.log(`   Type: ${analysis.pageType}`)
      console.log(`   Elements found: ${analysis.elements.length}`)
      console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(1)}%`)
      console.log(`   Next action: ${analysis.nextAction}\n`)

      // Handle different page types
      if (analysis.pageType === 'job_listing') {
        // Find and click Apply button
        const applyButton = analysis.elements.find(el => 
          el.type === 'button' && 
          el.label.toLowerCase().includes('apply')
        )

        if (applyButton) {
          this.updateProgress(task.id, {
            status: 'filling',
            message: 'Clicking Apply button...',
            currentStep: 4,
            totalSteps: 5
          })

          await this.browser.clickButton(applyButton.label)
          const afterClickScreenshot = await this.browser.captureCurrentState()
          screenshots.push(afterClickScreenshot)

          // Re-analyze after clicking
          const formAnalysis = await geminiAgent.analyzeScreenshot(afterClickScreenshot)
          
          // Now fill the form
          await this.fillAndSubmitApplication(task, formAnalysis, profile, screenshots)
        } else {
          throw new Error('No Apply button found on job listing')
        }
      } else if (analysis.pageType === 'application_form' || analysis.pageType === 'multi_step_form') {
        // Direct application form
        await this.fillAndSubmitApplication(task, analysis, profile, screenshots)
      } else {
        throw new Error(`Unexpected page type: ${analysis.pageType}`)
      }

      // Verify submission
      this.updateProgress(task.id, {
        status: 'completed',
        message: 'Verifying submission...',
        currentStep: 5,
        totalSteps: 5
      })

      const finalScreenshot = screenshots[screenshots.length - 1]
      const verification = await geminiAgent.verifySubmission(finalScreenshot)

      if (!verification.success) {
        throw new Error('Could not verify successful submission')
      }

      // Save to database
      const application = await this.saveApplication(task, verification.confirmationNumber)

      console.log(`\n${'='.repeat(60)}`)
      console.log(`✅ APPLICATION COMPLETED SUCCESSFULLY!`)
      console.log(`   Confirmation: ${verification.confirmationNumber || 'N/A'}`)
      console.log(`   Screenshots: ${screenshots.length}`)
      console.log(`${'='.repeat(60)}\n`)

      return {
        success: true,
        applicationId: application.id,
        message: verification.message,
        screenshots,
        confirmationNumber: verification.confirmationNumber
      }

    } catch (error) {
      console.error(`\n❌ APPLICATION FAILED:`, error)
      
      this.updateProgress(task.id, {
        status: 'failed',
        message: String(error),
        error: String(error)
      })

      return {
        success: false,
        message: String(error),
        screenshots
      }
    } finally {
      await this.browser.close()
    }
  }

  /**
   * Fill and submit the application form
   */
  private async fillAndSubmitApplication(
    task: JobApplicationTask,
    analysis: any,
    profile: any,
    screenshots: string[]
  ): Promise<void> {
    this.updateProgress(task.id, {
      status: 'filling',
      message: 'Filling out application form...',
      currentStep: 4,
      totalSteps: 5
    })

    // Handle multi-step forms
    if (analysis.pageType === 'multi_step_form') {
      const results = await this.browser.handleMultiStepForm(profile)
      
      // Collect all screenshots
      results.forEach(result => {
        if (result.screenshotPath) {
          screenshots.push(result.screenshotPath)
        }
      })

      // Check if any step failed
      const failed = results.find(r => !r.success)
      if (failed) {
        throw new Error(failed.message)
      }
    } else {
      // Single-page form
      const fillResult = await this.browser.fillFormIntelligently(analysis, profile)
      
      if (fillResult.screenshotPath) {
        screenshots.push(fillResult.screenshotPath)
      }

      if (!fillResult.success) {
        throw new Error(fillResult.message)
      }

      // Find and click Submit button
      const submitButton = analysis.elements.find((el: any) => 
        el.type === 'button' && 
        (el.label.toLowerCase().includes('submit') || 
         el.label.toLowerCase().includes('apply'))
      )

      if (submitButton) {
        this.updateProgress(task.id, {
          status: 'submitting',
          message: 'Submitting application...',
          currentStep: 5,
          totalSteps: 5
        })

        const submitResult = await this.browser.clickButton(submitButton.label)
        
        if (submitResult.screenshotPath) {
          screenshots.push(submitResult.screenshotPath)
        }

        if (!submitResult.success) {
          throw new Error(submitResult.message)
        }
      }
    }
  }

  /**
   * Get user profile with all related data
   */
  private async getUserProfile(profileId: string): Promise<any> {
    // For now, return mock data
    // In production, fetch from database
    return {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/johndoe',
      portfolioUrl: 'https://johndoe.dev',
      resumePath: '/path/to/resume.pdf',
      summary: 'Experienced software engineer with 8+ years building scalable web applications.',
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Developer',
          startDate: '2021-01-01',
          endDate: null,
          description: 'Leading frontend development team'
        }
      ],
      education: [
        {
          school: 'University of California',
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          graduationYear: 2018
        }
      ],
      skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS']
    }
  }

  /**
   * Save application to database
   */
  private async saveApplication(
    task: JobApplicationTask,
    confirmationNumber?: string
  ): Promise<any> {
    // Mock implementation
    // In production, save to Prisma
    return {
      id: `app_${Date.now()}`,
      userId: task.userId,
      jobId: task.id,
      jobTitle: task.jobTitle,
      company: task.company,
      status: 'applied',
      appliedDate: new Date(),
      confirmationNumber
    }
  }

  /**
   * Process multiple jobs in queue
   */
  async processQueue(tasks: JobApplicationTask[]): Promise<void> {
    console.log(`\n🚀 Processing ${tasks.length} applications in queue...\n`)

    for (const task of tasks) {
      try {
        await this.applyToJob(task)
        
        // Delay between applications to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 5000))
      } catch (error) {
        console.error(`Failed to process task ${task.id}:`, error)
        continue
      }
    }

    console.log(`\n✅ Queue processing completed!\n`)
  }
}

// Export singleton instance
export const jobAgent = new JobApplicationAgent()
