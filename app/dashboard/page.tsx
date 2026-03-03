'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { StatsCard } from '@/components/dashboard/stats-card'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { Briefcase, CheckCircle2, Clock, Users } from 'lucide-react'

const trendData = [
  { name: 'Week 1', value: 5 },
  { name: 'Week 2', value: 12 },
  { name: 'Week 3', value: 8 },
  { name: 'Week 4', value: 15 },
  { name: 'Week 5', value: 22 },
  { name: 'Week 6', value: 28 },
  { name: 'Week 7', value: 35 },
]

export default function DashboardPage() {
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
            value="42"
            subtitle="This month"
            icon={Briefcase}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Interview Invites"
            value="8"
            subtitle="This month"
            icon={Users}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Success Rate"
            value="19%"
            subtitle="Response rate"
            icon={CheckCircle2}
            trend={{ value: 2, isPositive: true }}
          />
          <StatsCard
            title="Pending"
            value="12"
            subtitle="Awaiting response"
            icon={Clock}
            trend={{ value: 3, isPositive: false }}
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
                <span className="text-sm font-medium text-foreground">28</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span className="text-sm text-muted-foreground">Interviewing</span>
                </div>
                <span className="text-sm font-medium text-foreground">8</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm text-muted-foreground">Accepted</span>
                </div>
                <span className="text-sm font-medium text-foreground">2</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">Rejected</span>
                </div>
                <span className="text-sm font-medium text-foreground">4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </MainLayout>
  )
}
