'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface AnalyticsStatsProps {
  period?: 'week' | 'month' | 'quarter' | 'year'
}

export function AnalyticsStats({ period = 'month' }: AnalyticsStatsProps) {
  const [stats, setStats] = useState({
    totalApplications: 0,
    responseRate: 0,
    conversionRate: 0,
    avgDaysToResponse: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/analytics?userId=${encodeURIComponent(user.email)}&metric=overview`)
      
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalApplications: data.data.totalApplications || 0,
          responseRate: data.data.responseRate || 0,
          conversionRate: data.data.conversionRate || 0,
          avgDaysToResponse: data.data.avgDaysToResponse || 0,
        })
      }
    } catch (error) {
      console.error('Failed to fetch analytics stats:', error)
    }
  }

  const statsData = [
    {
      title: 'Applications Submitted',
      value: stats.totalApplications.toString(),
      change: '+0%',
      positive: true,
      previous: 'Total applications',
    },
    {
      title: 'Response Rate',
      value: `${stats.responseRate}%`,
      change: '+0%',
      positive: true,
      previous: 'Of total applications',
    },
    {
      title: 'Interview Conversion',
      value: `${stats.conversionRate}%`,
      change: '+0%',
      positive: true,
      previous: 'Of responses received',
    },
    {
      title: 'Average Time to Response',
      value: stats.avgDaysToResponse > 0 ? `${stats.avgDaysToResponse} days` : 'N/A',
      change: '+0 days',
      positive: true,
      previous: 'Average response time',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title} className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Badge
                variant={stat.positive ? 'default' : 'destructive'}
                className="gap-1"
              >
                {stat.positive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {stat.change}
              </Badge>
              <span className="text-muted-foreground">{stat.previous}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
