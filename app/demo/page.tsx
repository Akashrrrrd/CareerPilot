'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { LiveAgentDemo } from '@/components/agent/live-agent-demo'
import { Card } from '@/components/ui/card'
import { CheckCircle2 } from 'lucide-react'

export default function DemoPage() {
  return (
    <MainLayout>
      <div className="pb-8 space-y-8">
        {/* Hero Section */}
        <div className="px-6 pt-6">
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <span className="text-sm font-medium">🏆 Gemini Live Agent Challenge</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Live AI Agent Demo
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch our AI agent apply to a real LinkedIn job posting in real-time using Gemini 2.0 Flash Vision. 
              No DOM access, no APIs - just pure visual understanding.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>Live Streaming</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span>Confidence Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span>Visual Understanding</span>
              </div>
            </div>
          </div>
        </div>

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
