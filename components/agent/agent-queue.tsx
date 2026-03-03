'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Trash2, Eye, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react'
import type { ApplicationJob } from '@/lib/agent/types'

export function AgentQueue() {
  const [jobs, setJobs] = useState<ApplicationJob[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchQueue()
  }, [])

  const fetchQueue = async () => {
    try {
      const response = await fetch('/api/agent/queue?userId=1')
      const data = await response.json()
      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async (job: ApplicationJob) => {
    setProcessingId(job.id)

    try {
      // Get user profile (mock for now)
      const profile = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        headline: 'Senior Full Stack Developer',
        summary: 'Experienced developer with 8+ years building scalable web applications.',
        resumeUrl: '/resume.pdf',
        experience: [],
        education: [],
        skills: ['React', 'Node.js', 'TypeScript'],
      }

      const response = await fetch('/api/agent/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobUrl: job.url,
          jobTitle: job.title,
          company: job.company,
          profile,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Update job status
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: 'completed' } : j))
        )
      } else {
        setJobs((prev) =>
          prev.map((j) => (j.id === job.id ? { ...j, status: 'failed', error: data.message } : j))
        )
      }
    } catch (error) {
      console.error('Application failed:', error)
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id
            ? { ...j, status: 'failed', error: 'Network error' }
            : j
        )
      )
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (jobId: string) => {
    try {
      await fetch(`/api/agent/queue?id=${jobId}`, { method: 'DELETE' })
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
    } catch (error) {
      console.error('Failed to delete job:', error)
    }
  }

  const getStatusIcon = (status: ApplicationJob['status']) => {
    switch (status) {
      case 'queued':
        return <Clock className="h-4 w-4" />
      case 'in_progress':
        return <Loader2 className="h-4 w-4 animate-spin" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />
      case 'failed':
        return <XCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: ApplicationJob['status']) => {
    switch (status) {
      case 'queued':
        return 'secondary'
      case 'in_progress':
        return 'default'
      case 'completed':
        return 'default'
      case 'failed':
        return 'destructive'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">No jobs in queue</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Add job URLs to let the AI agent apply automatically
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                <Badge variant={getStatusColor(job.status)} className="gap-1">
                  {getStatusIcon(job.status)}
                  {job.status.replace('_', ' ')}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
              <p className="mt-2 text-xs text-muted-foreground break-all">{job.url}</p>

              {job.error && (
                <div className="mt-3 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  Error: {job.error}
                </div>
              )}

              {job.completedAt && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Completed: {new Date(job.completedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {job.status === 'queued' && (
                <Button
                  size="sm"
                  onClick={() => handleProcess(job)}
                  disabled={processingId !== null}
                  className="gap-2"
                >
                  {processingId === job.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start
                    </>
                  )}
                </Button>
              )}

              {job.status === 'completed' && job.screenshots.length > 0 && (
                <Button size="sm" variant="outline" className="gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              )}

              {job.status !== 'in_progress' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(job.id)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
