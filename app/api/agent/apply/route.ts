import { NextRequest, NextResponse } from 'next/server'
import { ApplicationAgent } from '@/lib/agent/application-agent'
import type { ApplicationJob, ProfileData } from '@/lib/agent/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobUrl, jobTitle, company, profile } = body

    if (!jobUrl || !jobTitle || !company || !profile) {
      return NextResponse.json(
        { error: 'Missing required fields: jobUrl, jobTitle, company, profile' },
        { status: 400 }
      )
    }

    // Create job object
    const job: ApplicationJob = {
      id: `job_${Date.now()}`,
      url: jobUrl,
      title: jobTitle,
      company: company,
      status: 'in_progress',
      profileId: profile.id || 'default',
      createdAt: new Date(),
      screenshots: [],
      actions: [],
    }

    // Create agent and process application
    const agent = new ApplicationAgent()
    const session = await agent.processApplication(job, profile as ProfileData)

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        logs: session.logs,
        startTime: session.startTime,
        endTime: session.endTime,
      },
    })
  } catch (error) {
    console.error('Agent application error:', error)
    return NextResponse.json(
      {
        error: 'Application failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
