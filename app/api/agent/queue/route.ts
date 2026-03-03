import { NextRequest, NextResponse } from 'next/server'
import type { ApplicationJob } from '@/lib/agent/types'

// In-memory queue (replace with database in production)
const applicationQueue: ApplicationJob[] = []

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Filter by user (in production, query from database)
    const userJobs = applicationQueue

    return NextResponse.json({
      success: true,
      jobs: userJobs,
      total: userJobs.length,
    })
  } catch (error) {
    console.error('Queue fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, title, company, profileId } = body

    if (!url || !title || !company || !profileId) {
      return NextResponse.json(
        { error: 'Missing required fields: url, title, company, profileId' },
        { status: 400 }
      )
    }

    const newJob: ApplicationJob = {
      id: `job_${Date.now()}`,
      url,
      title,
      company,
      status: 'queued',
      profileId,
      createdAt: new Date(),
      screenshots: [],
      actions: [],
    }

    applicationQueue.push(newJob)

    return NextResponse.json({
      success: true,
      job: newJob,
      message: 'Job added to queue',
    })
  } catch (error) {
    console.error('Queue add error:', error)
    return NextResponse.json({ error: 'Failed to add job to queue' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('id')

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    const index = applicationQueue.findIndex((job) => job.id === jobId)

    if (index === -1) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    applicationQueue.splice(index, 1)

    return NextResponse.json({
      success: true,
      message: 'Job removed from queue',
    })
  } catch (error) {
    console.error('Queue delete error:', error)
    return NextResponse.json({ error: 'Failed to remove job' }, { status: 500 })
  }
}
