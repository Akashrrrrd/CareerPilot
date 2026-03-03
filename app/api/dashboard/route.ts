import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Application from '@/lib/models/Application'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('[Dashboard API] Request received for userId:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Fetch all applications for the user
    const applications = await Application.find({ userId }).sort({ appliedDate: -1 })
    console.log('[Dashboard API] Found applications:', applications.length)

    // Calculate stats
    const totalApplications = applications.length
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const thisMonthApplications = applications.filter(app => {
      const appDate = new Date(app.appliedDate)
      return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear
    })

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    const lastMonthApplications = applications.filter(app => {
      const appDate = new Date(app.appliedDate)
      return appDate.getMonth() === lastMonth && appDate.getFullYear() === lastMonthYear
    })

    const thisMonthCount = thisMonthApplications.length
    const lastMonthCount = lastMonthApplications.length
    const applicationsTrend = lastMonthCount > 0 
      ? Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : thisMonthCount > 0 ? 100 : 0

    // Interview invites (Interviewing + Offer status)
    const interviewingCount = applications.filter(app => 
      app.status === 'Interviewing' || app.status === 'Offer'
    ).length
    
    const thisMonthInterviewing = thisMonthApplications.filter(app => 
      app.status === 'Interviewing' || app.status === 'Offer'
    ).length
    
    const lastMonthInterviewing = lastMonthApplications.filter(app => 
      app.status === 'Interviewing' || app.status === 'Offer'
    ).length
    
    const interviewTrend = lastMonthInterviewing > 0
      ? Math.round(((thisMonthInterviewing - lastMonthInterviewing) / lastMonthInterviewing) * 100)
      : thisMonthInterviewing > 0 ? 100 : 0

    // Success rate (response rate)
    const respondedApplications = applications.filter(app => 
      app.status !== 'Applied'
    ).length
    const successRate = totalApplications > 0 
      ? Math.round((respondedApplications / totalApplications) * 100)
      : 0

    const lastMonthResponded = lastMonthApplications.filter(app => 
      app.status !== 'Applied'
    ).length
    const lastMonthRate = lastMonthApplications.length > 0
      ? Math.round((lastMonthResponded / lastMonthApplications.length) * 100)
      : 0
    const successRateTrend = successRate - lastMonthRate

    // Pending applications
    const pendingCount = applications.filter(app => app.status === 'Applied').length
    const lastMonthPending = lastMonthApplications.filter(app => app.status === 'Applied').length
    const pendingTrend = lastMonthPending > 0
      ? Math.round(((pendingCount - lastMonthPending) / lastMonthPending) * 100)
      : pendingCount > 0 ? 100 : 0

    // Status breakdown
    const statusBreakdown = {
      Applied: applications.filter(app => app.status === 'Applied').length,
      Interviewing: applications.filter(app => app.status === 'Interviewing').length,
      Offer: applications.filter(app => app.status === 'Offer').length,
      Rejected: applications.filter(app => app.status === 'Rejected').length,
    }

    // Trend data (last 7 weeks)
    const trendData = []
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i * 7))
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)
      
      const weekApplications = applications.filter(app => {
        const appDate = new Date(app.appliedDate)
        return appDate >= weekStart && appDate < weekEnd
      }).length
      
      trendData.push({
        name: `Week ${7 - i}`,
        value: weekApplications
      })
    }

    // Recent activity (last 5 applications)
    const recentActivity = applications.slice(0, 5).map(app => {
      const appliedDate = new Date(app.appliedDate)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - appliedDate.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      
      let timeAgo = ''
      if (diffDays === 0) {
        if (diffHours === 0) {
          timeAgo = 'Just now'
        } else if (diffHours === 1) {
          timeAgo = '1 hour ago'
        } else {
          timeAgo = `${diffHours} hours ago`
        }
      } else if (diffDays === 1) {
        timeAgo = '1 day ago'
      } else {
        timeAgo = `${diffDays} days ago`
      }

      return {
        id: app._id.toString(),
        jobTitle: app.jobTitle,
        company: app.company,
        status: app.status.toLowerCase(),
        appliedDate: timeAgo,
        matchScore: app.matchScore,
        location: app.location,
        salary: app.salary,
        description: app.description,
        jobType: app.jobType,
      }
    })

    const response = {
      stats: {
        totalApplications: thisMonthCount,
        totalApplicationsTrend: applicationsTrend,
        interviewInvites: thisMonthInterviewing,
        interviewInvitesTrend: interviewTrend,
        successRate,
        successRateTrend,
        pending: pendingCount,
        pendingTrend,
      },
      statusBreakdown,
      trendData,
      recentActivity,
    }

    console.log('[Dashboard API] Returning response:', JSON.stringify(response, null, 2))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
