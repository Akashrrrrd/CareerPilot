import { NextRequest, NextResponse } from 'next/server'
import { BrowserAutomation } from '@/lib/agent/browser-automation'

export async function POST(request: NextRequest) {
  const automation = new BrowserAutomation()

  try {
    const body = await request.json()
    const { jobUrl, jobTitle, company, profile } = body

    console.log('[Agent Apply] Starting real browser automation:', { jobUrl, jobTitle, company })

    if (!jobUrl || !jobTitle || !company || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields: jobUrl, jobTitle, company, profile' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Gemini API key not configured',
          message: 'Please add GEMINI_API_KEY to your environment variables'
        },
        { status: 500 }
      )
    }

    const logs: any[] = []
    const actions: any[] = []
    const screenshots: string[] = []

    // Step 1: Initialize browser
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Initializing headless browser...',
    })

    await automation.initialize()

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: '✅ Browser initialized successfully',
    })

    // Step 2: Navigate to job URL
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Navigating to: ${jobUrl}`,
    })

    await automation.navigateTo(jobUrl)

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: '✅ Page loaded successfully',
    })

    actions.push({
      type: 'navigate',
      target: jobUrl,
      description: `Navigated to ${jobUrl}`,
    })

    // Step 3: Take screenshot and analyze with Gemini Vision
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Capturing page screenshot...',
    })

    const screenshot = await automation.takeScreenshot()
    screenshots.push(screenshot)

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Analyzing page with Gemini Vision AI...',
    })

    const analysis = await automation.analyzePageWithGemini(screenshot)

    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: `Page type detected: ${analysis.pageType}`,
    })

    actions.push({
      type: 'analyze',
      description: `Analyzed page: ${analysis.pageType}`,
      value: JSON.stringify(analysis, null, 2),
    })

    // Step 4: Check if login is required
    if (analysis.requiresLogin) {
      logs.push({
        timestamp: new Date(),
        level: 'warning',
        message: '⚠️ Login required - cannot proceed automatically',
      })

      await automation.close()

      return NextResponse.json({
        success: false,
        message: 'This job requires login. Please log in manually and try again.',
        session: {
          id: `session_${Date.now()}`,
          status: 'failed',
          logs,
          startTime: new Date(),
          endTime: new Date(),
        },
        screenshots,
        actions,
      })
    }

    // Step 5: Fill form fields
    if (analysis.formFields && analysis.formFields.length > 0) {
      logs.push({
        timestamp: new Date(),
        level: 'info',
        message: `Found ${analysis.formFields.length} form fields. Filling with profile data...`,
      })

      const fillResults = await automation.findAndFillForm(profile, analysis)

      for (const result of fillResults) {
        if (result.success) {
          logs.push({
            timestamp: new Date(),
            level: 'info',
            message: `✅ Filled "${result.field}": ${result.value}`,
          })

          actions.push({
            type: 'type',
            target: result.field,
            value: result.value,
            description: `Filled ${result.field}`,
          })
        } else {
          logs.push({
            timestamp: new Date(),
            level: 'warning',
            message: `⚠️ Could not fill "${result.field}"`,
          })
        }
      }

      // Take screenshot after filling
      const filledScreenshot = await automation.takeScreenshot()
      screenshots.push(filledScreenshot)

      logs.push({
        timestamp: new Date(),
        level: 'info',
        message: '✅ Form filled successfully',
      })
    }

    // Step 6: Submit form
    logs.push({
      timestamp: new Date(),
      level: 'info',
      message: 'Attempting to submit application...',
    })

    const submitted = await automation.submitForm()

    if (submitted) {
      await automation.page?.waitForTimeout(3000)

      // Take final screenshot
      const finalScreenshot = await automation.takeScreenshot()
      screenshots.push(finalScreenshot)

      logs.push({
        timestamp: new Date(),
        level: 'success',
        message: '✅ Application submitted successfully!',
      })

      actions.push({
        type: 'submit',
        description: 'Submitted application form',
      })

      await automation.close()

      return NextResponse.json({
        success: true,
        message: 'Application submitted successfully!',
        session: {
          id: `session_${Date.now()}`,
          status: 'completed',
          logs,
          startTime: new Date(),
          endTime: new Date(),
        },
        screenshots,
        actions,
      })
    } else {
      logs.push({
        timestamp: new Date(),
        level: 'error',
        message: '❌ Failed to submit application',
      })

      await automation.close()

      return NextResponse.json({
        success: false,
        message: 'Could not find or click submit button',
        session: {
          id: `session_${Date.now()}`,
          status: 'failed',
          logs,
          startTime: new Date(),
          endTime: new Date(),
        },
        screenshots,
        actions,
      })
    }
  } catch (error) {
    console.error('[Agent Apply] Error:', error)
    console.error('[Agent Apply] Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('[Agent Apply] Error details:', JSON.stringify(error, null, 2))

    try {
      await automation.close()
    } catch (e) {
      console.error('[Agent Apply] Cleanup error:', e)
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Application failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    )
  }
}
