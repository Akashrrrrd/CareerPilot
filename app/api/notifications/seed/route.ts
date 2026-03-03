import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Notification from '@/lib/models/Notification'

// POST create sample notifications for testing
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Clear existing notifications for this user
    await Notification.deleteMany({ userId })

    // Create sample notifications
    const sampleNotifications = [
      {
        userId,
        type: 'application',
        title: 'Application Update',
        message: 'Your application to Google was moved to "Interviewing"',
        unread: true,
      },
      {
        userId,
        type: 'agent',
        title: 'Agent Completed',
        message: 'Successfully applied to 3 jobs on LinkedIn',
        unread: true,
      },
      {
        userId,
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated',
        unread: false,
      },
      {
        userId,
        type: 'reminder',
        title: 'Follow-up Reminder',
        message: 'Follow up with Microsoft - Interview scheduled',
        unread: false,
      },
    ]

    const notifications = await Notification.insertMany(sampleNotifications)

    return NextResponse.json(
      { 
        message: 'Sample notifications created successfully',
        count: notifications.length,
        notifications 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Notifications Seed API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create sample notifications' },
      { status: 500 }
    )
  }
}
