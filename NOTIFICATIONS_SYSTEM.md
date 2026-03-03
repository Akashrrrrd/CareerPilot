# Notifications System

## Overview
The CareerPilot application now has a fully functional real-time notifications system that stores notifications in MongoDB and displays them to users.

## Features

### 1. Real-time Notifications
- Notifications are fetched from MongoDB when the user logs in
- Badge shows unread count in the top navigation bar
- Notifications dropdown shows all recent notifications (up to 50)

### 2. Notification Types
- **Application**: Updates about job applications (status changes)
- **Agent**: AI agent completion notifications
- **Success**: Profile updates and other successful actions
- **Reminder**: Follow-up reminders for interviews
- **Info**: General information notifications

### 3. User Actions
- Click on a notification to mark it as read
- "Mark all read" button to mark all notifications as read
- "View all" button to navigate to full notifications page (future feature)
- Unread notifications are highlighted with blue accent

### 4. Automatic Notification Creation
Notifications are automatically created when:
- A new application is created
- An application status is changed
- A user profile is updated

## API Endpoints

### GET `/api/notifications?userId={email}`
Fetch all notifications for a user
- Returns: `{ notifications: [], unreadCount: number }`

### POST `/api/notifications`
Create a new notification
```json
{
  "userId": "user@example.com",
  "type": "application",
  "title": "Application Update",
  "message": "Your application to Google was moved to Interviewing",
  "icon": "optional"
}
```

### PUT `/api/notifications`
Mark notification(s) as read
```json
{
  "userId": "user@example.com",
  "notificationId": "notification_id", // Optional: mark specific notification
  "markAllRead": true // Optional: mark all as read
}
```

### DELETE `/api/notifications?userId={email}&notificationId={id}`
Delete notification(s)
- Add `deleteAll=true` to delete all notifications for user

## Testing

### Seed Sample Notifications
To test the notification system, you can seed sample notifications:

```bash
curl -X POST http://localhost:3000/api/notifications/seed \
  -H "Content-Type: application/json" \
  -d '{"userId": "your-email@example.com"}'
```

This will create 4 sample notifications (2 unread, 2 read) for testing.

## Helper Functions

The `lib/notifications.ts` file provides helper functions for common notification types:

```typescript
import { 
  notifyApplicationStatusChange,
  notifyAgentComplete,
  notifyProfileUpdate,
  notifyFollowUpReminder 
} from '@/lib/notifications'

// Example usage
await notifyApplicationStatusChange(
  'user@example.com',
  'Google',
  'Interviewing'
)
```

## Database Schema

```typescript
{
  userId: string,           // User email
  type: string,            // application | agent | success | reminder | info
  title: string,           // Notification title
  message: string,         // Notification message
  icon: string,            // Optional icon name
  unread: boolean,         // Read/unread status
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-generated
}
```

## UI Components

### Top Navigation Bar
- Bell icon with red badge showing unread count
- Dropdown menu with scrollable notification list
- Each notification shows icon, title, message, and time ago
- Unread notifications have blue accent and dot indicator

### Notification Item
- Icon with colored background (blue for unread, gray for read)
- Title and message
- Relative time (e.g., "5 min ago", "1 hour ago")
- Click to mark as read

## Future Enhancements
- Full notifications page at `/notifications`
- Push notifications (browser notifications)
- Email notifications for important updates
- Notification preferences in settings
- Delete individual notifications
- Notification categories/filters
