'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { JobFilter } from '@/components/jobs/job-filter'
import { JobCard } from '@/components/jobs/job-card'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Grid, List } from 'lucide-react'

const mockJobs = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    salary: '$150k - $200k',
    description: 'Looking for an experienced React developer to lead our frontend team and build scalable web applications.',
    jobType: 'Full-time',
    postedDays: 2,
    matchScore: 92,
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$120k - $160k',
    description: 'Join our fast-growing startup as a full-stack engineer. Work on cutting-edge technologies and modern web architectures.',
    jobType: 'Full-time',
    postedDays: 1,
    matchScore: 88,
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'Design Studio',
    location: 'New York, NY',
    salary: '$100k - $140k',
    description: 'Creative frontend role focusing on user experience and modern UI design patterns. Strong attention to detail required.',
    jobType: 'Full-time',
    postedDays: 5,
    matchScore: 85,
  },
  {
    id: '4',
    title: 'JavaScript Engineer',
    company: 'WebDev Inc',
    location: 'Remote',
    description: 'Work with Node.js and React to build modern web applications. Help us shape the future of web technology.',
    jobType: 'Contract',
    postedDays: 3,
    matchScore: 78,
  },
  {
    id: '5',
    title: 'Senior Developer',
    company: 'Enterprise Co',
    location: 'Boston, MA',
    salary: '$180k - $220k',
    description: 'Lead a team of developers in building enterprise-scale solutions. Mentor junior developers and architect new systems.',
    jobType: 'Full-time',
    postedDays: 7,
    matchScore: 72,
  },
  {
    id: '6',
    title: 'Product Engineer',
    company: 'Tech Innovators',
    location: 'Austin, TX',
    salary: '$130k - $170k',
    description: 'Shape product development with your engineering expertise. Collaborate with product and design teams.',
    jobType: 'Full-time',
    postedDays: 4,
    matchScore: 81,
  },
]

export default function JobsPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [savedJobs, setSavedJobs] = useState<string[]>([])

  const handleSaveJob = (jobId: string) => {
    setSavedJobs(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    )
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
            <JobFilter />
          </div>

          <div className="md:col-span-3 space-y-4">
            {/* View toggle */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{mockJobs.length} opportunities found</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Job Cards */}
            <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : ''}`}>
              {mockJobs.map((job) => (
                <JobCard
                  key={job.id}
                  {...job}
                  isSaved={savedJobs.includes(job.id)}
                  onSave={handleSaveJob}
                  onApply={(id) => console.log('Applying to job:', id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
