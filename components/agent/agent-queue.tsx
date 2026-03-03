'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Trash2, Eye, CheckCircle2, XCircle, Clock, Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AgentJob {
  _id: string
  userId: string
  url: string
  title: string
  company: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  createdAt: string
  startedAt?: string
  completedAt?: string
  error?: string
  screenshots: string[]
  actions: any[]
  instructions?: string
  strategy?: any
  applicationData?: any
}

export function AgentQueue() {
  const [jobs, setJobs] = useState<AgentJob[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [selectedJob, setSelectedJob] = useState<AgentJob | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    }
  }, [])

  useEffect(() => {
    if (user?.email) {
      fetchQueue()
    }
  }, [user?.email])

  const fetchQueue = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/agent/queue?userId=${encodeURIComponent(user!.email)}`)
      const data = await response.json()
      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error)
      toast.error('Failed to load agent queue')
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async (job: AgentJob) => {
    setProcessingId(job._id)

    try {
      // Update status to in_progress
      await fetch('/api/agent/queue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job._id,
          status: 'in_progress',
          startedAt: new Date().toISOString(),
        }),
      })

      // Update local state
      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, status: 'in_progress' as const } : j))
      )

      // Get user profile
      const profileResponse = await fetch(`/api/profile?userId=${encodeURIComponent(user!.email)}`)
      const profileData = await profileResponse.json()

      const profile = {
        firstName: profileData.profile?.profileName?.split(' ')[0] || 'User',
        lastName: profileData.profile?.profileName?.split(' ').slice(1).join(' ') || '',
        email: user!.email,
        phone: '',
        location: '',
        headline: profileData.profile?.headline || '',
        summary: profileData.profile?.summary || '',
        resumeUrl: '',
        experience: profileData.profile?.experience || [],
        education: profileData.profile?.education || [],
        skills: profileData.profile?.skills || [],
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
        // Update job status to completed
        await fetch('/api/agent/queue', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job._id,
            status: 'completed',
            completedAt: new Date().toISOString(),
            screenshots: data.screenshots || [],
            actions: data.actions || [],
            instructions: data.instructions,
            strategy: data.strategy,
            applicationData: data.applicationData,
          }),
        })

        setJobs((prev) =>
          prev.map((j) =>
            j._id === job._id
              ? {
                  ...j,
                  status: 'completed' as const,
                  completedAt: new Date().toISOString(),
                  screenshots: data.screenshots || [],
                  actions: data.actions || [],
                  instructions: data.instructions,
                  strategy: data.strategy,
                  applicationData: data.applicationData,
                }
              : j
          )
        )

        // Show instructions dialog
        const updatedJob = jobs.find(j => j._id === job._id)
        if (updatedJob) {
          setSelectedJob({
            ...updatedJob,
            instructions: data.instructions,
            strategy: data.strategy,
            applicationData: data.applicationData,
          })
          setShowInstructions(true)
        }

        toast.success('Application submitted successfully!')
      } else {
        // Update job status to failed
        await fetch('/api/agent/queue', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobId: job._id,
            status: 'failed',
            error: data.message || 'Application failed',
            completedAt: new Date().toISOString(),
          }),
        })

        setJobs((prev) =>
          prev.map((j) =>
            j._id === job._id
              ? {
                  ...j,
                  status: 'failed' as const,
                  error: data.message || 'Application failed',
                  completedAt: new Date().toISOString(),
                }
              : j
          )
        )

        toast.error(data.message || 'Application failed')
      }
    } catch (error) {
      console.error('Application failed:', error)

      // Update job status to failed
      await fetch('/api/agent/queue', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job._id,
          status: 'failed',
          error: 'Network error',
          completedAt: new Date().toISOString(),
        }),
      })

      setJobs((prev) =>
        prev.map((j) =>
          j._id === job._id
            ? {
                ...j,
                status: 'failed' as const,
                error: 'Network error',
                completedAt: new Date().toISOString(),
              }
            : j
        )
      )

      toast.error('Network error occurred')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/agent/queue?id=${jobId}&userId=${encodeURIComponent(user!.email)}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId))
        toast.success('Job removed from queue')
      } else {
        toast.error('Failed to remove job')
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
      toast.error('Failed to remove job')
    }
  }

  const getStatusIcon = (status: AgentJob['status']) => {
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

  const getStatusColor = (status: AgentJob['status']) => {
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
        <Card key={job._id} className="p-6">
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
                  {processingId === job._id ? (
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

              {job.status === 'completed' && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => {
                    setSelectedJob(job)
                    setShowInstructions(true)
                  }}
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              )}

              {job.status !== 'in_progress' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(job._id)}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}

      {/* Instructions Dialog */}
      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>AI Application Assistant</DialogTitle>
            <DialogDescription>
              {selectedJob && `${selectedJob.title} at ${selectedJob.company}`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            {selectedJob && (
              <div className="space-y-6">
                {/* Job Link */}
                <div>
                  <h3 className="font-semibold mb-2">Job Posting</h3>
                  <a 
                    href={selectedJob.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    Open job posting <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                {/* Strategy */}
                {selectedJob.strategy && (
                  <div>
                    <h3 className="font-semibold mb-2">Application Strategy</h3>
                    <div className="rounded-lg bg-muted p-4 text-sm">
                      <p className="whitespace-pre-wrap">{selectedJob.strategy.strategy}</p>
                      
                      {selectedJob.strategy.keyPoints && selectedJob.strategy.keyPoints.length > 0 && (
                        <div className="mt-4">
                          <p className="font-semibold mb-2">Key Points to Highlight:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {selectedJob.strategy.keyPoints.map((point: string, i: number) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                {selectedJob.instructions && (
                  <div>
                    <h3 className="font-semibold mb-2">Step-by-Step Instructions</h3>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
                      <p className="whitespace-pre-wrap">{selectedJob.instructions}</p>
                    </div>
                  </div>
                )}

                {/* Application Data */}
                {selectedJob.applicationData && (
                  <div>
                    <h3 className="font-semibold mb-2">Your Prepared Data</h3>
                    <div className="rounded-lg bg-muted p-4 text-sm space-y-3">
                      <div>
                        <p className="font-semibold">Personal Information:</p>
                        <p>Name: {selectedJob.applicationData.personalInfo?.firstName} {selectedJob.applicationData.personalInfo?.lastName}</p>
                        <p>Email: {selectedJob.applicationData.personalInfo?.email}</p>
                        {selectedJob.applicationData.personalInfo?.phone && (
                          <p>Phone: {selectedJob.applicationData.personalInfo.phone}</p>
                        )}
                      </div>
                      
                      {selectedJob.applicationData.professional?.headline && (
                        <div>
                          <p className="font-semibold">Headline:</p>
                          <p>{selectedJob.applicationData.professional.headline}</p>
                        </div>
                      )}
                      
                      {selectedJob.applicationData.professional?.skills && selectedJob.applicationData.professional.skills.length > 0 && (
                        <div>
                          <p className="font-semibold">Skills:</p>
                          <p>{selectedJob.applicationData.professional.skills.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowInstructions(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      window.open(selectedJob.url, '_blank')
                      setShowInstructions(false)
                    }}
                    className="flex-1 gap-2"
                  >
                    Apply Now <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
