'use client'

import { useState, useEffect } from 'react'
import { Bell, LogOut, Settings, User, Briefcase, Bot, CheckCircle2, Clock } from 'lucide-react'
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

const notifications = [
  {
    id: 1,
    type: 'application',
    icon: Briefcase,
    title: 'Application Update',
    message: 'Your application to Google was moved to "Interviewing"',
    time: '5 min ago',
    unread: true,
  },
  {
    id: 2,
    type: 'agent',
    icon: Bot,
    title: 'Agent Completed',
    message: 'Successfully applied to 3 jobs on LinkedIn',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 3,
    type: 'success',
    icon: CheckCircle2,
    title: 'Profile Updated',
    message: 'Your resume has been successfully updated',
    time: '2 hours ago',
    unread: false,
  },
  {
    id: 4,
    type: 'reminder',
    icon: Clock,
    title: 'Follow-up Reminder',
    message: 'Follow up with Microsoft - Interview scheduled',
    time: '1 day ago',
    unread: false,
  },
]

export function TopNav() {
  const router = useRouter()
  const { toast } = useToast()
  const unreadCount = notifications.filter(n => n.unread).length
  
  // Get user from localStorage
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

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
        <h1 className="text-sm font-medium text-foreground">Welcome back to CP!</h1>
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
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
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
              {notifications.map((notification) => {
                const Icon = notification.icon
                return (
                  <DropdownMenuItem 
                    key={notification.id} 
                    className="cursor-pointer p-3 focus:bg-accent"
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
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                )
              })}
            </div>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button variant="ghost" className="w-full text-sm" size="sm">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=CareerPilot" />
                <AvatarFallback>CP</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-white dark:bg-black border-border shadow-2xl z-[9999]"
            sideOffset={8}
          >
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=CareerPilot" />
                <AvatarFallback>CP</AvatarFallback>
              </Avatar>
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
