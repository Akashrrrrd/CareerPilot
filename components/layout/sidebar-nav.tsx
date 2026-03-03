'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Briefcase, Brain, FileText, Home, Settings, Users, Bot, Presentation, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSidebar } from './sidebar-context'

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Profile',
    href: '/profile',
    icon: FileText,
  },
  {
    label: 'Jobs',
    href: '/jobs',
    icon: Briefcase,
  },
  {
    label: 'Applications',
    href: '/applications',
    icon: Users,
  },
  {
    label: 'Agent Queue',
    href: '/agent-queue',
    icon: Bot,
  },
  {
    label: 'Demo',
    href: '/demo',
    icon: Presentation,
  },
  {
    label: 'AI Chat',
    href: '/agent',
    icon: Brain,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  return (
    <TooltipProvider delayDuration={0}>
      <aside className={`fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Logo */}
        <div className={`flex h-16 border-b border-sidebar-border items-center ${isCollapsed ? 'justify-between px-2' : 'justify-center px-4'}`}>
          {!isCollapsed ? (
            <>
              <span className="text-2xl font-bold">CareerPilot</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 absolute right-2"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1" />
              <span className="text-2xl font-bold">CP</span>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 space-y-1 py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname?.startsWith(item.href)

            const linkContent = (
              <Link
                href={item.href}
                className={`flex items-center rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                } ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'}`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <>
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            )

            return isCollapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent 
                  side="right" 
                  className="flex items-center gap-2 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 shadow-lg px-3 py-2 text-sm font-medium"
                  sideOffset={8}
                >
                  {item.label}
                  {item.badge && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.href}>{linkContent}</div>
            )
          })}
        </nav>
      </aside>
    </TooltipProvider>
  )
}
