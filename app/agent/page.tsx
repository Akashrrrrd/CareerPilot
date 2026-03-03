'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { ChatInterface } from '@/components/agent/chat-interface'

export default function AgentPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
          <p className="mt-2 text-muted-foreground">Get personalized advice on your job search and applications</p>
        </div>

        <ChatInterface />
      </div>
    </MainLayout>
  )
}
