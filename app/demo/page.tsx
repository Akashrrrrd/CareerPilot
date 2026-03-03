'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { LiveAgentDemo } from '@/components/agent/live-agent-demo'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Github, Youtube, FileText } from 'lucide-react'

export default function DemoPage() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            CareerPilot AI Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Watch how our AI agent uses Gemini Vision to automatically navigate and complete job
            applications across any platform
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="outline" className="gap-2">
              <Youtube className="h-4 w-4" />
              Watch Video
            </Button>
            <Button variant="outline" className="gap-2">
              <Github className="h-4 w-4" />
              View Code
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Documentation
            </Button>
          </div>
        </div>

        {/* Main Demo Component */}
        <LiveAgentDemo />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">2-3 min</div>
            <div className="mt-2 text-sm text-muted-foreground">Per Application</div>
            <div className="mt-1 text-xs text-muted-foreground">(vs 10-15 manual)</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">95%+</div>
            <div className="mt-2 text-sm text-muted-foreground">Field Detection</div>
            <div className="mt-1 text-xs text-muted-foreground">Accuracy Rate</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">100+</div>
            <div className="mt-2 text-sm text-muted-foreground">Job Boards</div>
            <div className="mt-1 text-xs text-muted-foreground">Supported</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-primary">8-25 hrs</div>
            <div className="mt-2 text-sm text-muted-foreground">Time Saved</div>
            <div className="mt-1 text-xs text-muted-foreground">Per Job Search</div>
          </Card>
        </div>

        {/* Technology Stack */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Technology Stack</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Required (Hackathon)</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Gemini 2.0 Flash (Multimodal Vision)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Google GenAI SDK v0.21.0
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Google Cloud Run (Deployment)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Cloud Storage (Screenshots)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Secret Manager (API Keys)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Additional Tech</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Next.js 16 + React 19
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  TypeScript + Tailwind CSS
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Playwright (Browser Automation)
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  PostgreSQL + Prisma ORM
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Sharp (Image Processing)
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Use Cases */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Supported Platforms</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              'LinkedIn',
              'Indeed',
              'Glassdoor',
              'Monster',
              'ZipRecruiter',
              'CareerBuilder',
              'Company Career Pages',
              'Startup Job Boards',
              'Custom ATS Systems',
            ].map((platform) => (
              <div
                key={platform}
                className="flex items-center gap-2 rounded-lg border border-border p-3"
              >
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-foreground">{platform}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Works on any job board - no API integration required. The agent visually understands
            the page structure and adapts automatically.
          </p>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
          <h2 className="text-2xl font-bold text-foreground">Ready to Try It?</h2>
          <p className="mt-2 text-muted-foreground">
            Experience the future of job application automation
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button size="lg" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Try Live Demo
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Github className="h-4 w-4" />
              View on GitHub
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
