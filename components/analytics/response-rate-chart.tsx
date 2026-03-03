'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface ResponseRateChartProps {
  period?: string
}

export function ResponseRateChart({ period = 'all' }: ResponseRateChartProps) {
  const [data, setData] = useState<{ title: string; rate: number }[]>([])

  useEffect(() => {
    fetchResponseRateData()
  }, [period])

  const fetchResponseRateData = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/applications?userId=${encodeURIComponent(user.email)}`)
      
      if (response.ok) {
        const result = await response.json()
        const applications = result.applications || []

        // Group by job title and calculate response rates
        const titleStats: { [key: string]: { total: number; responded: number } } = {}

        applications.forEach((app: any) => {
          const title = app.jobTitle || 'Unknown'
          if (!titleStats[title]) {
            titleStats[title] = { total: 0, responded: 0 }
          }
          titleStats[title].total++
          if (app.status !== 'Applied') {
            titleStats[title].responded++
          }
        })

        // Convert to chart data
        const chartData = Object.entries(titleStats)
          .map(([title, stats]) => ({
            title: title.length > 20 ? title.substring(0, 20) + '...' : title,
            rate: stats.total > 0 ? Math.round((stats.responded / stats.total) * 100) : 0,
          }))
          .sort((a, b) => b.rate - a.rate)
          .slice(0, 5) // Top 5 job titles

        setData(chartData)
      }
    } catch (error) {
      console.error('Failed to fetch response rate data:', error)
    }
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Response Rate by Job Title</CardTitle>
          <CardDescription>Your average response rates for different job titles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No application data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle>Response Rate by Job Title</CardTitle>
        <CardDescription>Your average response rates for different job titles</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="title"
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '0.875rem' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value) => [`${value}%`, 'Response Rate']}
            />
            <Bar dataKey="rate" fill="hsl(var(--primary))">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
