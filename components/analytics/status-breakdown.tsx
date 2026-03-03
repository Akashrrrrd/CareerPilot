'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
]

interface StatusBreakdownProps {
  period?: string
}

export function StatusBreakdown({ period = 'all' }: StatusBreakdownProps) {
  const [data, setData] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    fetchStatusData()
  }, [period])

  const fetchStatusData = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/analytics?userId=${encodeURIComponent(user.email)}&metric=by-status&period=${period}`)
      
      if (response.ok) {
        const result = await response.json()
        const statusData = [
          { name: 'Applied', value: result.data.applied || 0 },
          { name: 'Interviewing', value: result.data.interviewing || 0 },
          { name: 'Offers', value: result.data.offers || 0 },
          { name: 'Rejected', value: result.data.rejected || 0 },
          { name: 'Accepted', value: result.data.accepted || 0 },
        ].filter(item => item.value > 0) // Only show statuses with data

        setData(statusData)
      }
    } catch (error) {
      console.error('Failed to fetch status breakdown:', error)
    }
  }

  if (data.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Application Status Breakdown</CardTitle>
          <CardDescription>Distribution of your applications by status</CardDescription>
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
        <CardTitle>Application Status Breakdown</CardTitle>
        <CardDescription>Distribution of your applications by status</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
