'use client'

/**
 * WINNING FEATURE #1: Live Agent Demo UI
 * 
 * This is what judges will see - a LIVE agent working in real-time
 * with personality, confidence scores, and visual feedback
 */

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Play,
  Square,
  Brain,
  Zap,
  CheckCircle2,
  AlertCircle,
  Camera,
  Activity,
  Bot,
  Eye,
} from 'lucide-react'
import { StreamEvent } from '@/lib/agent/live-streaming-agent'

interface LogEntry extends StreamEvent {
  id: string
}

export function LiveAgentDemo() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [currentStatus, setCurrentStatus] = useState<string>('Ready to start')
  const [confidence, setConfidence] = useState<number>(0)
  const [progress, setProgress] = useState<number>(0)
  const [latestScreenshot, setLatestScreenshot] = useState<string | null>(null)
  
  // Form inputs
  const [jobUrl, setJobUrl] = useState('https://www.linkedin.com/jobs/view/123456')
  const [jobTitle, setJobTitle] = useState('Senior React Developer')
  const [company, setCompany] = useState('Tech Corp')

  const logsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to latest log
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  /**
   * Start the live agent
   */
  const startAgent = async () => {
    setIsRunning(true)
    setLogs([])
    setProgress(0)
    setConfidence(0)

    try {
      const response = await fetch('/api/agent/stream-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobUrl,
          jobTitle,
          company,
          userProfile: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            linkedinUrl: 'https://linkedin.com/in/johndoe',
            resumePath: '/path/to/resume.pdf',
          },
        }),
      })

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const event: StreamEvent = JSON.parse(data)
              handleStreamEvent(event)
            } catch (e) {
              console.error('Failed to parse event:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error)
      addLog({
        type: 'error',
        timestamp: Date.now(),
        message: 'Failed to connect to agent',
      })
    } finally {
      setIsRunning(false)
    }
  }

  /**
   * Handle incoming stream events
   */
  const handleStreamEvent = (event: StreamEvent) => {
    addLog(event)

    switch (event.type) {
      case 'status':
        setCurrentStatus(event.message)
        break

      case 'confidence':
        if (event.confidence) {
          setConfidence(event.confidence)
        }
        break

      case 'screenshot':
        if (event.screenshot) {
          setLatestScreenshot(event.screenshot)
        }
        break

      case 'action':
        if (event.data?.progress) {
          const [current, total] = event.data.progress.split('/').map(Number)
          setProgress((current / total) * 100)
        }
        break

      case 'success':
        setCurrentStatus('Application submitted successfully!')
        setProgress(100)
        break

      case 'error':
        setCurrentStatus('Error occurred')
        break
    }
  }

  /**
   * Add log entry
   */
  const addLog = (event: StreamEvent) => {
    const logEntry: LogEntry = {
      ...event,
      id: `${event.timestamp}-${Math.random()}`,
    }
    setLogs((prev) => [...prev, logEntry])
  }

  /**
   * Stop the agent
   */
  const stopAgent = () => {
    setIsRunning(false)
    setCurrentStatus('Stopped by user')
  }

  /**
   * Get icon for log type
   */
  const getLogIcon = (type: string) => {
    switch (type) {
      case 'thought':
        return <Brain className="h-4 w-4 text-purple-500" />
      case 'action':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'confidence':
        return <Activity className="h-4 w-4 text-green-500" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'screenshot':
        return <Camera className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  /**
   * Get badge color for log type
   */
  const getLogBadgeColor = (type: string) => {
    switch (type) {
      case 'thought':
        return 'bg-purple-500/10 text-purple-500'
      case 'action':
        return 'bg-blue-500/10 text-blue-500'
      case 'confidence':
        return 'bg-green-500/10 text-green-500'
      case 'success':
        return 'bg-green-500/10 text-green-500'
      case 'error':
        return 'bg-red-500/10 text-red-500'
      case 'screenshot':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Live AI Agent Demo
          </CardTitle>
          <CardDescription>
            Watch the agent work in real-time with personality and confidence scoring
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="jobUrl">Job URL</Label>
              <Input
                id="jobUrl"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                disabled={isRunning}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={isRunning}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="flex gap-2">
            {!isRunning ? (
              <Button onClick={startAgent} className="gap-2">
                <Play className="h-4 w-4" />
                Start Agent
              </Button>
            ) : (
              <Button onClick={stopAgent} variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                Stop Agent
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Dashboard */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Current Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStatus}</div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confidence.toFixed(0)}%</div>
            <Progress value={confidence} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress.toFixed(0)}%</div>
            <Progress value={progress} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Live Feed */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Agent Logs */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Agent Activity Feed
            </CardTitle>
            <CardDescription>Real-time thoughts and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No activity yet. Start the agent to see it in action!
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">{getLogIcon(log.type)}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={getLogBadgeColor(log.type)}>
                            {log.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        {log.confidence && (
                          <div className="flex items-center gap-2">
                            <Progress value={log.confidence} className="h-1 flex-1" />
                            <span className="text-xs text-muted-foreground">
                              {log.confidence.toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Screenshot Preview */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Screenshot
            </CardTitle>
            <CardDescription>What the agent sees right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] bg-muted rounded-lg flex items-center justify-center">
              {latestScreenshot ? (
                <img
                  src={latestScreenshot}
                  alt="Agent view"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No screenshot yet</p>
                  <p className="text-sm">Screenshots will appear here as the agent works</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
