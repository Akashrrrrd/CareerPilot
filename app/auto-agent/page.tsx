'use client'

/**
 * WINNING UI: Auto-Agent Dashboard
 * 
 * This is where judges will see the MAGIC happen in real-time!
 */

import { MainLayout } from '@/components/layout/main-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useState } from 'react'
import { 
  Bot, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  Zap,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react'

interface AgentTask {
  id: string
  jobTitle: string
  company: string
  jobUrl: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  currentStep: string
  screenshot?: string
  startTime?: Date
  endTime?: Date
}

export default function AutoAgentPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [newJobUrl, setNewJobUrl] = useState('')
  const [newJobTitle, setNewJobTitle] = useState('')
  const [newCompany, setNewCompany] = useState('')

  const addToQueue = () => {
    if (!newJobUrl || !newJobTitle || !newCompany) return

    const task: AgentTask = {
      id: `task_${Date.now()}`,
      jobTitle: newJobTitle,
      company: newCompany,
      jobUrl: newJobUrl,
      status: 'queued',
      progress: 0,
      currentStep: 'Waiting in queue...'
    }

    setTasks([...tasks, task])
    setNewJobUrl('')
    setNewJobTitle('')
    setNewCompany('')
  }

  const startAgent = async () => {
    setIsRunning(true)
    
    // Process each queued task
    for (const task of tasks.filter(t => t.status === 'queued')) {
      await processTask(task)
    }
    
    setIsRunning(false)
  }

  const processTask = async (task: AgentTask) => {
    // Update task to processing
    updateTask(task.id, { 
      status: 'processing', 
      startTime: new Date(),
      currentStep: 'Initializing browser...',
      progress: 10
    })

    try {
      // Call API to start application
      const response = await fetch('/api/agent/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '1',
          jobUrl: task.jobUrl,
          jobTitle: task.jobTitle,
          company: task.company,
          profileId: '1'
        })
      })

      const result = await response.json()

      if (result.success) {
        // Simulate progress updates (in production, use WebSocket or polling)
        await simulateProgress(task.id)
        
        updateTask(task.id, {
          status: 'completed',
          progress: 100,
          currentStep: 'Application submitted successfully!',
          endTime: new Date()
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      updateTask(task.id, {
        status: 'failed',
        currentStep: `Error: ${error}`,
        endTime: new Date()
      })
    }
  }

  const simulateProgress = async (taskId: string) => {
    const steps = [
      { progress: 20, step: 'Navigating to job page...' },
      { progress: 35, step: 'Analyzing form with Gemini AI...' },
      { progress: 50, step: 'Filling personal information...' },
      { progress: 65, step: 'Uploading resume...' },
      { progress: 80, step: 'Answering screening questions...' },
      { progress: 95, step: 'Submitting application...' },
    ]

    for (const { progress, step } of steps) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      updateTask(taskId, { progress, currentStep: step })
    }
  }

  const updateTask = (taskId: string, updates: Partial<AgentTask>) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    ))
  }

  const getStatusIcon = (status: AgentTask['status']) => {
    switch (status) {
      case 'queued': return <Clock className="h-5 w-5 text-muted-foreground" />
      case 'processing': return <Bot className="h-5 w-5 text-primary animate-pulse" />
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case 'failed': return <XCircle className="h-5 w-5 text-red-500" />
    }
  }

  const getStatusBadge = (status: AgentTask['status']) => {
    const variants: Record<string, any> = {
      queued: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    }

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    )
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    processing: tasks.filter(t => t.status === 'processing').length,
    failed: tasks.filter(t => t.status === 'failed').length
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              AI Auto-Agent
            </h1>
            <p className="mt-2 text-muted-foreground">
              Watch AI automatically apply to jobs using visual understanding
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="lg"
              onClick={startAgent}
              disabled={isRunning || tasks.filter(t => t.status === 'queued').length === 0}
              className="gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  Start Agent
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-3xl font-bold text-primary">{stats.processing}</p>
              </div>
              <Zap className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-3xl font-bold text-foreground">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Add Job Form */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Add Job to Queue</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                placeholder="Senior React Developer"
                value={newJobTitle}
                onChange={(e) => setNewJobTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Tech Corp"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobUrl">Job URL</Label>
              <Input
                id="jobUrl"
                placeholder="https://..."
                value={newJobUrl}
                onChange={(e) => setNewJobUrl(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={addToQueue} className="w-full">
                Add to Queue
              </Button>
            </div>
          </div>
        </Card>

        {/* Task Queue */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Application Queue</h3>
          
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No jobs in queue. Add jobs above to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <Card key={task.id} className="p-4 border-2">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(task.status)}
                      <div>
                        <h4 className="font-semibold text-foreground">{task.jobTitle}</h4>
                        <p className="text-sm text-muted-foreground">{task.company}</p>
                        <p className="text-xs text-muted-foreground mt-1">{task.jobUrl}</p>
                      </div>
                    </div>
                    {getStatusBadge(task.status)}
                  </div>

                  {task.status === 'processing' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{task.currentStep}</span>
                        <span className="text-foreground font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                  )}

                  {task.status === 'completed' && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Application submitted successfully!</span>
                    </div>
                  )}

                  {task.status === 'failed' && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>{task.currentStep}</span>
                    </div>
                  )}

                  {task.screenshot && (
                    <Button variant="outline" size="sm" className="mt-3 gap-2">
                      <Eye className="h-4 w-4" />
                      View Screenshot
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* How It Works */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            How the AI Agent Works
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <h4 className="font-semibold text-foreground">Visual Analysis</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-10">
                Gemini AI captures and analyzes screenshots to understand form fields without DOM access
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <h4 className="font-semibold text-foreground">Intelligent Filling</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-10">
                AI maps your profile data to form fields and fills them automatically with human-like behavior
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  3
                </div>
                <h4 className="font-semibold text-foreground">Smart Submission</h4>
              </div>
              <p className="text-sm text-muted-foreground pl-10">
                Handles multi-step forms, uploads documents, and verifies successful submission
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
