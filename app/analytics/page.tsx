'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { AnalyticsStats } from '@/components/analytics/analytics-stats'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { StatusBreakdown } from '@/components/analytics/status-breakdown'
import { FunnelChart } from '@/components/analytics/funnel-chart'
import { ResponseRateChart } from '@/components/analytics/response-rate-chart'
import { Button } from '@/components/ui/button'
import { Calendar, Download } from 'lucide-react'
import { useState } from 'react'

const trendData = [
  { name: 'Week 1', value: 8 },
  { name: 'Week 2', value: 12 },
  { name: 'Week 3', value: 10 },
  { name: 'Week 4', value: 15 },
  { name: 'Week 5', value: 22 },
  { name: 'Week 6', value: 28 },
  { name: 'Week 7', value: 35 },
]

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="mt-2 text-muted-foreground">Your comprehensive job search metrics</p>
          </div>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={period === p ? 'default' : 'outline'}
              onClick={() => setPeriod(p)}
              className="gap-1 capitalize"
            >
              <Calendar className="h-4 w-4" />
              {p}
            </Button>
          ))}
        </div>

        {/* Stats Cards */}
        <AnalyticsStats period={period} />

        {/* Charts Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <TrendChart
            title="Application Trends"
            description="Applications submitted over time"
            data={trendData}
          />
          <StatusBreakdown />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FunnelChart />
          <ResponseRateChart />
        </div>
      </div>
    </MainLayout>
  )
}
