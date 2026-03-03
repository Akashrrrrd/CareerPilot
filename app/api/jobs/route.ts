import { NextRequest, NextResponse } from 'next/server'
import type { ApiResponse, Job } from '@/lib/types'

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    salary: '$150k - $200k',
    description: 'Looking for an experienced React developer to lead our frontend team.',
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
    description: 'Join our fast-growing startup as a full-stack engineer.',
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
    description: 'Creative frontend role focusing on user experience.',
    jobType: 'Full-time',
    postedDays: 5,
    matchScore: 85,
  },
  {
    id: '4',
    title: 'JavaScript Engineer',
    company: 'WebDev Inc',
    location: 'Remote',
    description: 'Work with Node.js and React to build modern web applications.',
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
    description: 'Lead a team of developers in building enterprise-scale solutions.',
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
    description: 'Shape product development with your engineering expertise.',
    jobType: 'Full-time',
    postedDays: 4,
    matchScore: 81,
  },
]

export async function GET(request: NextRequest) {
  try {
    const jobId = request.nextUrl.searchParams.get('id')
    const search = request.nextUrl.searchParams.get('search')
    const location = request.nextUrl.searchParams.get('location')

    if (jobId) {
      const job = mockJobs.find(j => j.id === jobId)

      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }

      const response: ApiResponse<Job> = { data: job }
      return NextResponse.json(response)
    }

    let filteredJobs = mockJobs

    if (search) {
      const searchLower = search.toLowerCase()
      filteredJobs = filteredJobs.filter(j =>
        j.title.toLowerCase().includes(searchLower) ||
        j.company.toLowerCase().includes(searchLower) ||
        (j.description && j.description.toLowerCase().includes(searchLower))
      )
    }

    if (location) {
      const locationLower = location.toLowerCase()
      filteredJobs = filteredJobs.filter(j =>
        j.location && j.location.toLowerCase().includes(locationLower)
      )
    }

    const response: ApiResponse<Job[]> = { data: filteredJobs }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, company, location, salary, description, jobType } = await request.json()

    if (!title || !company) {
      return NextResponse.json(
        { error: 'Title and company required' },
        { status: 400 }
      )
    }

    const newJob: Job = {
      id: Date.now().toString(),
      title,
      company,
      location,
      salary,
      description,
      jobType,
    }

    const response: ApiResponse<Job> = {
      data: newJob,
      message: 'Job created successfully',
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
