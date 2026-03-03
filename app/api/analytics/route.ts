import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Application from '@/lib/models/Application'
import type { ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const userId = request.nextUrl.searchParams.get('userId')
    const metric = request.nextUrl.searchParams.get('metric')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get all applications for the user from MongoDB
    let applications = []
    try {
      applications = await Application.find({ userId }).lean()
    } catch (dbError) {
      console.error('Database query error:', dbError)
      // Return empty data if no applications found
      applications = []
    }

    // Calculate metrics
    const totalApplications = applications.length
    const interviewing = applications.filter(a => a.status === 'Interviewing').length
    const offers = applications.filter(a => a.status === 'Offer').length
    const rejected = applications.filter(a => a.status === 'Rejected').length
    const applied = applications.filter(a => a.status === 'Applied').length
    const accepted = applications.filter(a => a.status === 'Accepted').length

    const responseRate = totalApplications > 0 
      ? Math.round(((interviewing + offers + rejected + accepted) / totalApplications) * 100)
      : 0

    const conversionRate = (interviewing + offers + accepted) > 0 
      ? Math.round((offers + accepted) / (interviewing + offers + accepted) * 100)
      : 0

    // Calculate average days to response
    const avgDaysToResponse = totalApplications > 0
      ? Math.round(
          applications.reduce((sum, app) => {
            if (app.status !== 'Applied' && app.followUpDate) {
              const responseDate = new Date(app.followUpDate)
              const appliedDate = new Date(app.createdAt)
              const daysDiff = Math.floor(
                (responseDate.getTime() - appliedDate.getTime()) / (1000 * 60 * 60 * 24)
              )
              return sum + (daysDiff > 0 ? daysDiff : 0)
            }
            return sum
          }, 0) / Math.max(applications.filter(a => a.status !== 'Applied' && a.followUpDate).length, 1)
        )
      : 0

    if (metric === 'overview') {
      const response: ApiResponse<{
        totalApplications: number
        interviewing: number
        offers: number
        rejected: number
        applied: number
        accepted: number
        responseRate: number
        conversionRate: number
        avgDaysToResponse: number
      }> = {
        data: {
          totalApplications,
          interviewing,
          offers,
          rejected,
          applied,
          accepted,
          responseRate,
          conversionRate,
          avgDaysToResponse,
        },
      }
      return NextResponse.json(response)
    }

    if (metric === 'by-status') {
      const response: ApiResponse<{
        applied: number
        interviewing: number
        offers: number
        rejected: number
        accepted: number
      }> = {
        data: {
          applied,
          interviewing,
          offers,
          rejected,
          accepted,
        },
      }
      return NextResponse.json(response)
    }

    if (metric === 'funnel') {
      const response: ApiResponse<{
        applications: number
        responses: number
        interviews: number
        offers: number
      }> = {
        data: {
          applications: totalApplications,
          responses: interviewing + offers + rejected + accepted,
          interviews: interviewing,
          offers: offers + accepted,
        },
      }
      return NextResponse.json(response)
    }

    if (metric === 'trends') {
      // Get applications grouped by week for the last 7 weeks
      const sevenWeeksAgo = new Date()
      sevenWeeksAgo.setDate(sevenWeeksAgo.getDate() - 49) // 7 weeks

      const recentApps = applications.filter(app => 
        new Date(app.createdAt) >= sevenWeeksAgo
      )

      const weeklyData = []
      for (let i = 6; i >= 0; i--) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (i * 7))
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekEnd.getDate() + 7)

        const count = recentApps.filter(app => {
          const appDate = new Date(app.createdAt)
          return appDate >= weekStart && appDate < weekEnd
        }).length

        weeklyData.push({
          name: `Week ${7 - i}`,
          value: count
        })
      }

      const response: ApiResponse<{ name: string; value: number }[]> = {
        data: weeklyData
      }
      return NextResponse.json(response)
    }

    // Default: return overview
    const response: ApiResponse<{
      totalApplications: number
      interviewing: number
      offers: number
      rejected: number
      applied: number
      accepted: number
      responseRate: number
      conversionRate: number
      avgDaysToResponse: number
    }> = {
      data: {
        totalApplications,
        interviewing,
        offers,
        rejected,
        applied,
        accepted,
        responseRate,
        conversionRate,
        avgDaysToResponse,
      },
    }
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error fetching analytics:', error)
    console.error('Error stack:', error.stack)
    console.error('Error message:', error.message)
    return NextResponse.json({ 
      error: 'Failed to fetch analytics',
      details: error.message 
    }, { status: 500 })
  }
}
