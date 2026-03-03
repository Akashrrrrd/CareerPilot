'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { AgentQueue } from '@/components/agent/agent-queue'
import { AddJobDialog } from '@/components/agent/add-job-dialog'
import { Button } from '@/components/ui/button'
import { Bot, Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function AgentQueuePage() {
  const [showAddDialog, setShowAddDialog] = useState(false)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">AI Agent Queue</h1>
                <p className="mt-1 text-muted-foreground">
                  Let the AI agent automatically apply to jobs for you
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Job to Queue
          </Button>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">How it works</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The AI agent uses Gemini Vision to understand job application pages visually, then
                automatically fills forms and submits applications using your profile data. No API
                integration needed - it works on any job board!
              </p>
            </div>
          </div>
        </div>

        {/* Queue */}
        <AgentQueue />

        {/* Add Job Dialog */}
        <AddJobDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      </div>
    </MainLayout>
  )
}
