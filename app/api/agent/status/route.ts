/**
 * API Route: Get agent status and progress
 */

import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for demo (use Redis in production)
const taskStatus = new Map()

export async function GET(request: NextRequest) {
  try {
    const taskId = request.nextUrl.searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID required' },
        { status: 400 }
      )
    }

    const status = taskStatus.get(taskId) || {
      status: 'unknown',
      message: 'Task not found'
    }

    return NextResponse.json(status)

  } catch (error) {
    console.error('Status API error:', error)
    return NextResponse.json(
      { error: 'Failed to get status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { taskId, ...status } = body

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID required' },
        { status: 400 }
      )
    }

    taskStatus.set(taskId, status)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Status update error:', error)
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    )
  }
}
