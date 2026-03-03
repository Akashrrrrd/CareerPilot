import { NextRequest, NextResponse } from 'next/server'
import { mockApplications } from '@/lib/mock-data'
import type { ApiResponse } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const metric = request.nextUrl.searchParams.get('metric')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      )
    }

    // Get all applications for the user
    const applications = mockApplications.filter(a => a.userId === userId)

    // Calculate metrics
    const totalApplications = applications.length
    const interviewing = applications.filter(a => a.status === 'interviewing').length
    const offers = applications.filter(a => a.status === 'offer').length
    const rejected = applications.filter(a => a.status === 'rejected').length
    const applied = applications.filter(a => a.status === 'applied').length
    const accepted = applications.filter(a => a.status === 'accepted').length

    const responseRate = totalApplications > 0 
      ? Math.round(((interviewing + offers + rejected + accepted) / totalApplications) * 100)
      : 0

    const conversionRate = (interviewing + offers + accepted) > 0 
      ? Math.round((offers + accepted) / (interviewing + offers + accepted) * 100)
      : 0

    const avgDaysToResponse = totalApplications > 0
      ? Math.round(
          applications.reduce((sum, app) => {
            if (app.status !== 'applied') {
              const responseDate = app.interviewDate || app.offerDate || app.appliedDate
              const daysDiff = Math.floor(
                (responseDate.getTime() - app.appliedDate.getTime()) / (1000 * 60 * 60 * 24)
              )
              return sum + daysDiff
            }
            return sum
          }, 0) / applications.filter(a => a.status !== 'applied').length
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
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
