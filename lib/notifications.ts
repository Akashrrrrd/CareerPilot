import { connectDB } from './db'
import Notification from './models/Notification'

export type NotificationType = 'application' | 'agent' | 'success' | 'reminder' | 'info'

interface CreateNotificationParams {
  userId: string
  type: NotificationType
  title: string
  message: string
  icon?: string
}

export async function createNotification({
  userId,
  type,
  title,
  message,
  icon,
}: CreateNotificationParams) {
  try {
    await connectDB()
    
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      icon,
      unread: true,
    })

    return notification
  } catch (error) {
    console.error('[Create Notification] Error:', error)
    throw error
  }
}

// Helper functions for common notification types
export async function notifyApplicationStatusChange(
  userId: string,
  company: string,
  newStatus: string
) {
  return createNotification({
    userId,
    type: 'application',
    title: 'Application Update',
    message: `Your application to ${company} was moved to "${newStatus}"`,
  })
}

export async function notifyAgentComplete(
  userId: string,
  jobCount: number,
  platform: string
) {
  return createNotification({
    userId,
    type: 'agent',
    title: 'Agent Completed',
    message: `Successfully applied to ${jobCount} job${jobCount > 1 ? 's' : ''} on ${platform}`,
  })
}

export async function notifyProfileUpdate(userId: string) {
  return createNotification({
    userId,
    type: 'success',
    title: 'Profile Updated',
    message: 'Your profile has been successfully updated',
  })
}

export async function notifyFollowUpReminder(
  userId: string,
  company: string,
  action: string
) {
  return createNotification({
    userId,
    type: 'reminder',
    title: 'Follow-up Reminder',
    message: `Follow up with ${company} - ${action}`,
  })
}
