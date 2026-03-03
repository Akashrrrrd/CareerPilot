'use client'

import { useState, useEffect } from 'react'
import { Bell, LogOut, Settings, User, Briefcase, Bot, CheckCircle2, Clock, Info } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface Notification {
  _id: string
  userId: string
  type: 'application' | 'agent' | 'success' | 'reminder' | 'info'
  title: string
  message: string
  icon?: string
  unread: boolean
  createdAt: string
  updatedAt: string
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'application':
      return Briefcase
    case 'agent':
      return Bot
    case 'success':
      return CheckCircle2
    case 'reminder':
      return Clock
    default:
      return Info
  }
}

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

export function TopNav() {
  const router = useRouter()
  const { toast } = useToast()
  
  // Get user from localStorage
  const [user, setUser] = useState<{ name: string; email: string; isNewUser?: boolean } | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Fetch notifications when user is available
  useEffect(() => {
    if (user?.email) {
      fetchNotifications()
    }
  }, [user?.email])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/notifications?userId=${encodeURIComponent(user!.email)}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.email,
          notificationId,
        }),
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, unread: false } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user!.email,
          markAllRead: true,
        }),
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
        setUnreadCount(0)
        toast({
          title: "All notifications marked as read",
        })
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getWelcomeMessage = () => {
    if (!user) return 'Welcome to CP!'
    
    const firstName = user.name.split(' ')[0]
    
    if (user.isNewUser) {
      return `Welcome ${firstName}!`
    } else {
      return `Welcome back ${firstName}!`
    }
  }

  const handleLogout = () => {
    // Clear any stored auth tokens/data
    localStorage.clear()
    sessionStorage.clear()
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    })
    
    // Redirect to login page
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-8">
      {/* Left side - Welcome message */}
      <div>
        <h1 className="text-sm font-medium text-foreground">{getWelcomeMessage()}</h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-background">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-80 bg-white dark:bg-black border-border shadow-2xl z-[9999]"
            sideOffset={8}
          >
            <div className="flex items-center justify-between p-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} new
                </Badge>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = getIconForType(notification.type)
                  return (
                    <DropdownMenuItem 
                      key={notification._id} 
                      className="cursor-pointer p-3 focus:bg-accent"
                      onClick={() => {
                        if (notification.unread) {
                          markAsRead(notification._id)
                        }
                      }}
                    >
                      <div className="flex gap-3 w-full">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                          notification.unread ? 'bg-primary/10' : 'bg-muted'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            notification.unread ? 'text-primary' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${
                              notification.unread ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {notification.title}
                            </p>
                            {notification.unread && (
                              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  )
                })
              )}
            </div>
            {unreadCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm" 
                    size="sm"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-white dark:bg-black border-border shadow-2xl z-[9999]"
            sideOffset={8}
          >
            <div className="flex items-center gap-2 p-2">
              <div className="h-9 w-9 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || 'John Doe'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || 'john@example.com'}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
