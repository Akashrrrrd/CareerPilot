'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Eye,
  Brain,
  Zap,
  CheckCircle2,
  Code2,
  Image as ImageIcon,
  Play,
  Sparkles,
} from 'lucide-react'

export function AgentDemo() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      title: 'Screenshot Capture',
      icon: ImageIcon,
      description: 'Agent navigates to job URL and captures page screenshot',
      code: `const screenshot = await browser.navigateAndCapture(jobUrl)`,
      color: 'text-blue-500',
    },
    {
      title: 'Gemini Vision Analysis',
      icon: Eye,
      description: 'Gemini analyzes screenshot to identify form fields and UI elements',
      code: `const analysis = await geminiVision.analyzeScreenshot(screenshot)
// Returns: { pageType, formFields, elements, nextSteps }`,
      color: 'text-purple-500',
    },
    {
      title: 'Field Mapping',
      icon: Brain,
      description: 'Maps detected fields to user profile data automatically',
      code: `formFields.map(field => ({
  ...field,
  value: getProfileValue(field.mappedTo, profile)
}))`,
      color: 'text-green-500',
    },
    {
      title: 'Action Execution',
      icon: Zap,
      description: 'Executes browser actions: click, type, upload, submit',
      code: `await browser.executeAction({
  type: 'type',
  target: 'email',
  value: profile.email
})`,
      color: 'text-orange-500',
    },
    {
      title: 'Verification',
      icon: CheckCircle2,
      description: 'Compares before/after screenshots to verify success',
      code: `const result = await vision.verifyAction(
  beforeScreenshot,
  afterScreenshot,
  'Application submitted'
)`,
      color: 'text-teal-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8">
        <div className="flex items-start gap-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">
              UI Navigator Agent with Gemini Vision
            </h2>
            <p className="mt-2 text-muted-foreground">
              Watch how our AI agent visually understands and navigates job application forms using
              Google's Gemini multimodal capabilities. No APIs, no DOM access - just pure visual
              intelligence.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1">
                <Eye className="h-3 w-3" />
                Gemini 2.0 Flash
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Code2 className="h-3 w-3" />
                Google GenAI SDK
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Zap className="h-3 w-3" />
                Playwright Automation
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Process Flow */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">How It Works</h3>

        <Tabs value={activeStep.toString()} onValueChange={(v) => setActiveStep(parseInt(v))}>
          <TabsList className="grid w-full grid-cols-5">
            {steps.map((step, i) => (
              <TabsTrigger key={i} value={i.toString()} className="gap-2">
                <step.icon className={`h-4 w-4 ${step.color}`} />
                <span className="hidden md:inline">{step.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {steps.map((step, i) => (
            <TabsContent key={i} value={i.toString()} className="space-y-4">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${step.color}`}
                >
                  <step.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{step.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>

              <Card className="bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">Code Example</span>
                  <Badge variant="outline" className="text-xs">
                    TypeScript
                  </Badge>
                </div>
                <pre className="text-sm font-mono text-foreground overflow-x-auto">
                  <code>{step.code}</code>
                </pre>
              </Card>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveStep(Math.max(0, i - 1))}
                  disabled={i === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveStep(Math.min(steps.length - 1, i + 1))}
                  disabled={i === steps.length - 1}
                >
                  Next
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* Key Features */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
            <Eye className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="mt-4 font-semibold text-foreground">Visual Understanding</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Gemini Vision analyzes screenshots to understand page structure, form fields, and UI
            elements without DOM access.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
            <Brain className="h-5 w-5 text-purple-500" />
          </div>
          <h3 className="mt-4 font-semibold text-foreground">Intelligent Mapping</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Automatically maps form fields to profile data using AI-powered field recognition and
            semantic understanding.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
            <Zap className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="mt-4 font-semibold text-foreground">Universal Compatibility</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Works on any job board - LinkedIn, Indeed, Glassdoor, or custom career portals. No API
            integration needed.
          </p>
        </Card>
      </div>

      {/* CTA */}
      <Card className="bg-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Ready to try it?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a job to the queue and watch the AI agent work its magic
            </p>
          </div>
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Start Demo
          </Button>
        </div>
      </Card>
    </div>
  )
}
