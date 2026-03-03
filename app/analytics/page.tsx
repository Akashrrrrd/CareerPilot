'use client'

import { useEffect, useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { AnalyticsStats } from '@/components/analytics/analytics-stats'
import { TrendChart } from '@/components/dashboard/trend-chart'
import { StatusBreakdown } from '@/components/analytics/status-breakdown'
import { FunnelChart } from '@/components/analytics/funnel-chart'
import { ResponseRateChart } from '@/components/analytics/response-rate-chart'
import { Button } from '@/components/ui/button'
import { Calendar, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'all' | 'week' | 'month' | 'quarter' | 'year'>('all')
  const [trendData, setTrendData] = useState<{ name: string; value: number }[]>([])
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    // Get user ID from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setUserId(user.email)
      fetchTrendData(user.email, period)
    }
  }, [period]) // Re-fetch when period changes

  const fetchTrendData = async (email: string, selectedPeriod: string) => {
    try {
      const response = await fetch(`/api/analytics?userId=${encodeURIComponent(email)}&metric=trends&period=${selectedPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setTrendData(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch trend data:', error)
    }
  }

  const handleExportReport = async () => {
    try {
      if (!userId) {
        toast.error('User not found')
        return
      }

      // Fetch all analytics data
      const response = await fetch(`/api/analytics?userId=${encodeURIComponent(userId)}&metric=overview`)
      if (!response.ok) {
        toast.error('Failed to fetch analytics data')
        return
      }

      const data = await response.json()
      const analytics = data.data

      // Dynamically import xlsx
      const XLSX = await import('xlsx')

      // Create workbook
      const wb = XLSX.utils.book_new()

      // Overview sheet
      const overviewData = [
        ['CareerPilot Analytics Report'],
        ['Generated:', new Date().toLocaleString()],
        ['Period:', period],
        [],
        ['Metric', 'Value'],
        ['Total Applications', analytics.totalApplications || 0],
        ['Response Rate', `${analytics.responseRate || 0}%`],
        ['Interview Conversion', `${analytics.conversionRate || 0}%`],
        ['Average Days to Response', analytics.avgDaysToResponse || 0],
      ]

      const ws1 = XLSX.utils.aoa_to_sheet(overviewData)
      XLSX.utils.book_append_sheet(wb, ws1, 'Overview')

      // Status Breakdown sheet
      const statusData = [
        ['Status Breakdown'],
        [],
        ['Status', 'Count'],
        ['Applied', analytics.applied || 0],
        ['Interviewing', analytics.interviewing || 0],
        ['Offers', analytics.offers || 0],
        ['Rejected', analytics.rejected || 0],
        ['Accepted', analytics.accepted || 0],
      ]

      const ws2 = XLSX.utils.aoa_to_sheet(statusData)
      XLSX.utils.book_append_sheet(wb, ws2, 'Status Breakdown')

      // Generate Excel file
      XLSX.writeFile(wb, `careerpilot-analytics-${new Date().toISOString().split('T')[0]}.xlsx`)

      toast.success('Report exported successfully')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export report')
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="mt-2 text-muted-foreground">Your comprehensive job search metrics</p>
          </div>
          <Button className="gap-2" onClick={handleExportReport}>
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['all', 'week', 'month', 'quarter', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${
                period === p 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Calendar className="h-4 w-4" />
              {p}
            </button>
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
          <StatusBreakdown period={period} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FunnelChart period={period} />
          <ResponseRateChart period={period} />
        </div>
      </div>
    </MainLayout>
  )
}
