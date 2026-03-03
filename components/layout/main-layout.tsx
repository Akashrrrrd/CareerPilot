'use client'

import { SidebarNav } from './sidebar-nav'
import { TopNav } from './top-nav'
import { SidebarProvider, useSidebar } from './sidebar-context'

interface MainLayoutProps {
  children: React.ReactNode
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { isCollapsed } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <div className={`transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <TopNav />
        <main className="relative p-8 z-0">
          {children}
        </main>
      </div>
    </div>
  )
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </SidebarProvider>
  )
}
