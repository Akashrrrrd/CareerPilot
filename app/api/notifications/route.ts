import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Notification from '@/lib/models/Notification'

// GET notifications for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)

    const unreadCount = await Notification.countDocuments({ userId, unread: true })

    return NextResponse.json({
      notifications,
      unreadCount,
    }, { status: 200 })
  } catch (error: any) {
    console.error('[Notifications API GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

// POST create a new notification
export async function POST(request: NextRequest) {
  try {
    const { userId, type, title, message, icon } = await request.json()

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'User ID, title, and message are required' },
        { status: 400 }
      )
    }

    await connectDB()

    const notification = await Notification.create({
      userId,
      type: type || 'info',
      title,
      message,
      icon,
      unread: true,
    })

    return NextResponse.json(
      { notification, message: 'Notification created successfully' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Notifications API POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}

// PUT mark notification(s) as read
export async function PUT(request: NextRequest) {
  try {
    const { userId, notificationId, markAllRead } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    if (markAllRead) {
      // Mark all notifications as read for this user
      await Notification.updateMany(
        { userId, unread: true },
        { unread: false }
      )
      return NextResponse.json(
        { message: 'All notifications marked as read' },
        { status: 200 }
      )
    } else if (notificationId) {
      // Mark specific notification as read
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { unread: false },
        { new: true }
      )

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { notification, message: 'Notification marked as read' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or markAllRead is required' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('[Notifications API PUT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

// DELETE notification(s)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const notificationId = searchParams.get('notificationId')
    const deleteAll = searchParams.get('deleteAll') === 'true'

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    if (deleteAll) {
      // Delete all notifications for this user
      await Notification.deleteMany({ userId })
      return NextResponse.json(
        { message: 'All notifications deleted' },
        { status: 200 }
      )
    } else if (notificationId) {
      // Delete specific notification
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        userId,
      })

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { message: 'Notification deleted' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Either notificationId or deleteAll is required' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('[Notifications API DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
