'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Briefcase, CheckCircle2, Clock, Users } from 'lucide-react'

interface DashboardData {
  stats: {
    totalApplications: number
    totalApplicationsTrend: number
    interviewInvites: number
    interviewInvitesTrend: number
    successRate: number
    successRateTrend: number
    pending: number
    pendingTrend: number
  }
  statusBreakdown: {
    Applied: number
    Interviewing: number
    Offer: number
    Rejected: number
  }
  trendData: Array<{ name: string; value: number }>
  recentActivity: Array<any>
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
          console.error('No user found in localStorage')
          setLoading(false)
          return
        }

        const user = JSON.parse(storedUser)
        const userEmail = user.email || user.id

        if (!userEmail) {
          console.error('No user email found')
          setLoading(false)
          return
        }

        const response = await fetch(`/api/dashboard?userId=${encodeURIComponent(userEmail)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }

        const data = await response.json()
        setDashboardData(data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </MainLayout>
    )
  }

  if (!dashboardData) {
    return (
      <MainLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Your job application overview</p>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">No data available. Start applying to jobs to see your dashboard!</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  const { stats, statusBreakdown, trendData, recentActivity } = dashboardData

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Your job application overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard
            title="Total Applications"
            value={stats.totalApplications}
            subtitle="This month"
            icon={Briefcase}
            trend={{ value: stats.totalApplicationsTrend, isPositive: stats.totalApplicationsTrend >= 0 }}
          />
          <StatsCard
            title="Interview Invites"
            value={stats.interviewInvites}
            subtitle="This month"
            icon={Users}
            trend={{ value: stats.interviewInvitesTrend, isPositive: stats.interviewInvitesTrend >= 0 }}
          />
          <StatsCard
            title="Success Rate"
            value={`${stats.successRate}%`}
            subtitle="Response rate"
            icon={CheckCircle2}
            trend={{ value: stats.successRateTrend, isPositive: stats.successRateTrend >= 0 }}
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            subtitle="Awaiting response"
            icon={Clock}
            trend={{ value: stats.pendingTrend, isPositive: stats.pendingTrend <= 0 }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <TrendChart
            title="Application Trends"
            description="Your applications over the last 7 weeks"
            data={trendData}
          />
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Application Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-muted-foreground">Applied</span>
                </div>
                <span className="text-sm font-medium text-foreground">{statusBreakdown.Applied}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-muted-foreground">Interviewing</span>
                </div>
                <span className="text-sm font-medium text-foreground">{statusBreakdown.Interviewing}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Offer</span>
                </div>
                <span className="text-sm font-medium text-foreground">{statusBreakdown.Offer}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">Rejected</span>
                </div>
                <span className="text-sm font-medium text-foreground">{statusBreakdown.Rejected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={recentActivity} />
      </div>
    </MainLayout>
  )
}
