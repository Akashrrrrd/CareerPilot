'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { LiveAgentDemo } from '@/components/agent/live-agent-demo'
import { Card } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default function DemoPage() {
  return (
    <MainLayout>
      <div className="pb-8 space-y-8">
        <LiveAgentDemo />

        {/* Supported Platforms */}
        <div className="px-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Supported Platforms</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Works on any job board - no API integration required. The agent visually understands the page structure and adapts automatically.
            </p>
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
              {[
                'LinkedIn',
                'Indeed',
                'Glassdoor',
                'Monster',
                'ZipRecruiter',
                'CareerBuilder',
                'Dice',
                'SimplyHired',
                'Company Career Pages',
                'Startup Job Boards',
                'Custom ATS Systems',
                'Any Job Board',
              ].map((platform) => (
                <div
                  key={platform}
                  className="flex items-center gap-2 rounded-lg border border-border p-3 bg-card"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">{platform}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
