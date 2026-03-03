import { NextRequest, NextResponse } from 'next/server'

// GET jobs from Google Jobs via SerpAPI
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || 'software developer'
    const location = searchParams.get('location') || 'United States'
    const jobType = searchParams.get('jobType')

    const SERPAPI_KEY = process.env.SERPAPI_KEY

    if (!SERPAPI_KEY) {
      console.error('SERPAPI_KEY not configured')
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Fetch multiple pages to get 15-20 jobs minimum
    const allJobs: any[] = []
    const pagesToFetch = 2 // Fetch 2 pages (10 jobs each = 20 total)

    for (let page = 0; page < pagesToFetch; page++) {
      const serpApiUrl = new URL('https://serpapi.com/search.json')
      serpApiUrl.searchParams.append('engine', 'google_jobs')
      serpApiUrl.searchParams.append('q', search)
      serpApiUrl.searchParams.append('location', location)
      serpApiUrl.searchParams.append('api_key', SERPAPI_KEY)
      serpApiUrl.searchParams.append('hl', 'en')
      serpApiUrl.searchParams.append('gl', 'us')
      serpApiUrl.searchParams.append('no_cache', 'false') // Allow cached results for faster response
      if (page > 0) {
        serpApiUrl.searchParams.append('start', (page * 10).toString())
      }

      console.log(`Fetching jobs page ${page + 1} from SerpAPI`)

      try {
        const response = await fetch(serpApiUrl.toString())
        
        if (!response.ok) {
          console.error(`SerpAPI error on page ${page + 1}:`, response.status)
          break // Stop fetching if we hit an error
        }

        const data = await response.json()
        
        if (data.jobs_results && data.jobs_results.length > 0) {
          allJobs.push(...data.jobs_results)
          console.log(`Page ${page + 1}: ${data.jobs_results.length} jobs fetched`)
        } else {
          console.log(`Page ${page + 1}: No more jobs available`)
          break // Stop if no more jobs
        }
      } catch (error) {
        console.error(`Error fetching page ${page + 1}:`, error)
        break
      }
    }

    console.log(`Total jobs fetched: ${allJobs.length}`)

    if (allJobs.length === 0) {
      return NextResponse.json({ jobs: [] }, { status: 200 })
    }

    // Transform Google Jobs data to our format
    const jobs = allJobs.map((job: any, index: number) => {
      // Calculate days ago from posted date
      let postedDays = 0
      if (job.detected_extensions?.posted_at) {
        const postedText = job.detected_extensions.posted_at.toLowerCase()
        if (postedText.includes('hour')) {
          postedDays = 0
        } else if (postedText.includes('day')) {
          const match = postedText.match(/(\d+)/)
          postedDays = match ? parseInt(match[1]) : 1
        } else if (postedText.includes('week')) {
          const match = postedText.match(/(\d+)/)
          postedDays = match ? parseInt(match[1]) * 7 : 7
        } else if (postedText.includes('month')) {
          const match = postedText.match(/(\d+)/)
          postedDays = match ? parseInt(match[1]) * 30 : 30
        }
      }

      // Calculate match score based on multiple factors
      let matchScore = 60 // Base score
      
      // Recency bonus (max 20 points)
      if (postedDays === 0) matchScore += 20 // Posted today
      else if (postedDays <= 2) matchScore += 15 // Within 2 days
      else if (postedDays <= 7) matchScore += 10 // Within a week
      else if (postedDays <= 14) matchScore += 5 // Within 2 weeks
      
      // Job completeness bonus (max 15 points)
      if (job.detected_extensions?.salary) matchScore += 5 // Has salary info
      if (job.description && job.description.length > 200) matchScore += 5 // Detailed description
      if (job.job_highlights?.Qualifications && job.job_highlights.Qualifications.length > 0) matchScore += 3 // Has requirements
      if (job.job_highlights?.Benefits && job.job_highlights.Benefits.length > 0) matchScore += 2 // Has benefits
      
      // Company reputation (max 5 points)
      if (job.extensions && job.extensions.length > 2) matchScore += 5 // More job details/extensions
      
      // Add some randomization for variety (±5 points)
      matchScore += Math.floor(Math.random() * 11) - 5

      // Filter by job type if specified
      const jobTypeFromExtensions = job.detected_extensions?.schedule_type || 'Full-time'
      if (jobType && jobType !== 'all' && !jobTypeFromExtensions.toLowerCase().includes(jobType.toLowerCase())) {
        return null
      }

      return {
        id: job.job_id || `job-${index}`,
        title: job.title || 'Untitled Position',
        company: job.company_name || 'Company',
        location: job.location || location,
        salary: job.detected_extensions?.salary || undefined,
        description: job.description || job.snippet || 'No description available',
        jobType: jobTypeFromExtensions,
        postedDays,
        matchScore: Math.min(matchScore, 99),
        thumbnail: job.thumbnail,
        applyLink: job.apply_options?.[0]?.link || job.share_url,
        requirements: job.job_highlights?.Qualifications || [],
        benefits: job.job_highlights?.Benefits || [],
      }
    }).filter(Boolean) // Remove null entries from filtering

    console.log(`Returning ${jobs.length} jobs after filtering`)

    return NextResponse.json({ jobs }, { status: 200 })
  } catch (error: any) {
    console.error('Get jobs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error.message },
      { status: 500 }
    )
  }
}
