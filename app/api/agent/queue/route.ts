import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import AgentJob from '@/lib/models/AgentJob'

// GET all agent jobs for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    await connectDB()

    const jobs = await AgentJob.find({ userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      jobs,
      total: jobs.length,
    })
  } catch (error) {
    console.error('[Agent Queue GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch queue' }, { status: 500 })
  }
}

// POST add new job to queue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, url, title, company } = body

    if (!userId || !url || !title || !company) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, url, title, company' },
        { status: 400 }
      )
    }

    await connectDB()

    const newJob = await AgentJob.create({
      userId,
      url,
      title,
      company,
      status: 'queued',
      screenshots: [],
      actions: [],
    })

    return NextResponse.json({
      success: true,
      job: newJob,
      message: 'Job added to queue',
    })
  } catch (error) {
    console.error('[Agent Queue POST] Error:', error)
    return NextResponse.json({ error: 'Failed to add job to queue' }, { status: 500 })
  }
}

// PUT update job status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, status, error, screenshots, actions, startedAt, completedAt, instructions, strategy, applicationData } = body

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    await connectDB()

    const updateData: any = {}
    if (status) updateData.status = status
    if (error !== undefined) updateData.error = error
    if (screenshots) updateData.screenshots = screenshots
    if (actions) updateData.actions = actions
    if (startedAt) updateData.startedAt = startedAt
    if (completedAt) updateData.completedAt = completedAt
    if (instructions) updateData.instructions = instructions
    if (strategy) updateData.strategy = strategy
    if (applicationData) updateData.applicationData = applicationData

    const job = await AgentJob.findByIdAndUpdate(
      jobId,
      { $set: updateData },
      { new: true }
    )

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      job,
      message: 'Job updated',
    })
  } catch (error) {
    console.error('[Agent Queue PUT] Error:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
  }
}

// DELETE remove job from queue
export async function DELETE(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('id')
    const userId = request.nextUrl.searchParams.get('userId')

    if (!jobId || !userId) {
      return NextResponse.json({ error: 'Job ID and User ID required' }, { status: 400 })
    }

    await connectDB()

    const job = await AgentJob.findOneAndDelete({ _id: jobId, userId })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Job removed from queue',
    })
  } catch (error) {
    console.error('[Agent Queue DELETE] Error:', error)
    return NextResponse.json({ error: 'Failed to remove job' }, { status: 500 })
  }
}
