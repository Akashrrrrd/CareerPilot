'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { JobFilter } from '@/components/jobs/job-filter'
import { JobCard } from '@/components/jobs/job-card'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Grid, List, ExternalLink, Bookmark } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  description: string
  jobType: string
  postedDays: number
  matchScore: number
  requirements?: string[]
  benefits?: string[]
  applyLink?: string
  thumbnail?: string
}

export default function JobsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [savedJobs, setSavedJobs] = useState<string[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobDialog, setShowJobDialog] = useState(false)
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    jobType: '',
  })

  useEffect(() => {
    fetchJobs()
  }, [filters])

  useEffect(() => {
    // Fetch user's existing applications to check for duplicates
    fetchAppliedJobs()
  }, [])

  const fetchAppliedJobs = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/applications?userId=${encodeURIComponent(user.email)}`)
      
      if (response.ok) {
        const data = await response.json()
        const appliedSet = new Set<string>()
        
        // Create a set of "company-jobTitle" combinations
        data.applications?.forEach((app: any) => {
          const key = `${app.company.toLowerCase()}-${app.jobTitle.toLowerCase()}`
          appliedSet.add(key)
        })
        
        setAppliedJobs(appliedSet)
      }
    } catch (error) {
      console.error('Failed to fetch applied jobs:', error)
    }
  }

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.location) params.append('location', filters.location)
      if (filters.jobType) params.append('jobType', filters.jobType)

      const response = await fetch(`/api/jobs?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      } else {
        toast.error('Failed to fetch jobs')
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      toast.error('Failed to load jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveJob = (jobId: string) => {
    setSavedJobs(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    )
    toast.success(savedJobs.includes(jobId) ? 'Job removed from saved' : 'Job saved')
  }

  const handleViewJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setSelectedJob(job)
      setShowJobDialog(true)
    }
  }

  const handleApplyToJob = async () => {
    if (!selectedJob) return

    try {
      const userData = localStorage.getItem('user')
      if (!userData) {
        toast.error('Please login to apply')
        return
      }

      const user = JSON.parse(userData)

      // Check if already applied to this job
      const jobKey = `${selectedJob.company.toLowerCase()}-${selectedJob.title.toLowerCase()}`
      if (appliedJobs.has(jobKey)) {
        toast.error('You have already applied to this position')
        return
      }

      // Create application in tracker
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.email,
          jobTitle: selectedJob.title,
          company: selectedJob.company,
          location: selectedJob.location,
          salary: selectedJob.salary,
          jobType: selectedJob.jobType,
          description: selectedJob.description,
          status: 'Applied',
        }),
      })

      if (response.ok) {
        // Add to applied jobs set
        setAppliedJobs(prev => new Set(prev).add(jobKey))
        
        toast.success(`Added to your application tracker!`)
        
        // Open external apply link if available
        if (selectedJob.applyLink) {
          window.open(selectedJob.applyLink, '_blank')
        }
        
        setShowJobDialog(false)
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to track application')
      }
    } catch (error) {
      console.error('Apply error:', error)
      toast.error('Failed to process application')
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Opportunities</h1>
          <p className="mt-2 text-muted-foreground">Search and find your next perfect role</p>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <JobFilter onFilterChange={setFilters} />
          </div>

          <div className="md:col-span-3 space-y-4">
            {/* View toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading...' : `${jobs.length} opportunities found`}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  aria-label="Grid view"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Job Cards */}
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading jobs...
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No jobs found. Try adjusting your filters.
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : ''}`}>
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    {...job}
                    isSaved={savedJobs.includes(job.id)}
                    onSave={handleSaveJob}
                    onApply={handleViewJob}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Job Details Dialog */}
        <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
          <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedJob?.title}</DialogTitle>
              <DialogDescription className="text-base">
                {selectedJob?.company} • {selectedJob?.location}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto pr-2">
              {selectedJob && (
                <div className="space-y-4">
                  {/* Job Meta */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{selectedJob.jobType}</Badge>
                    {selectedJob.salary && (
                      <Badge variant="secondary">{selectedJob.salary}</Badge>
                    )}
                    <Badge variant="secondary">Posted {selectedJob.postedDays}d ago</Badge>
                    <Badge
                      className={`${
                        selectedJob.matchScore >= 85
                          ? 'bg-green-500/10 text-green-500'
                          : selectedJob.matchScore >= 70
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}
                    >
                      {selectedJob.matchScore}% match
                    </Badge>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="font-semibold mb-2">Job Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedJob.description}
                    </p>
                  </div>

                  {/* Requirements */}
                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {selectedJob.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Benefits */}
                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Benefits</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {selectedJob.benefits.map((benefit, idx) => (
                          <li key={idx}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (selectedJob) {
                    handleSaveJob(selectedJob.id)
                  }
                }}
                className="gap-2"
              >
                <Bookmark className="h-4 w-4" />
                {selectedJob && savedJobs.includes(selectedJob.id) ? 'Saved' : 'Save Job'}
              </Button>
              <Button onClick={handleApplyToJob} className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Apply Now
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
