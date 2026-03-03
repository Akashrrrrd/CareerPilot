'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
]

interface FunnelChartProps {
  period?: string
}

export function FunnelChart({ period = 'all' }: FunnelChartProps) {
  const [data, setData] = useState<{ stage: string; count: number; conversion: number }[]>([])

  useEffect(() => {
    fetchFunnelData()
  }, [period])

  const fetchFunnelData = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) return

      const user = JSON.parse(userData)
      const response = await fetch(`/api/analytics?userId=${encodeURIComponent(user.email)}&metric=funnel&period=${period}`)
      
      if (response.ok) {
        const result = await response.json()
        const total = result.data.applications || 1 // Avoid division by zero
        
        const funnelData = [
          { 
            stage: 'Applied', 
            count: result.data.applications || 0, 
            conversion: 100 
          },
          { 
            stage: 'Responses', 
            count: result.data.responses || 0, 
            conversion: total > 0 ? Math.round((result.data.responses / total) * 100) : 0 
          },
          { 
            stage: 'Interviews', 
            count: result.data.interviews || 0, 
            conversion: total > 0 ? Math.round((result.data.interviews / total) * 100) : 0 
          },
          { 
            stage: 'Offers', 
            count: result.data.offers || 0, 
            conversion: total > 0 ? Math.round((result.data.offers / total) * 100) : 0 
          },
        ]

        setData(funnelData)
      }
    } catch (error) {
      console.error('Failed to fetch funnel data:', error)
    }
  }

  if (data.length === 0 || data[0].count === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Your application conversion rates by stage</CardDescription>
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
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>Your application conversion rates by stage</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
            <YAxis
              dataKey="stage"
              type="category"
              stroke="hsl(var(--muted-foreground))"
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value) => [value, 'Count']}
            />
            <Bar dataKey="count" fill="hsl(var(--primary))">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Conversion Rates */}
        <div className="mt-6 space-y-2">
          <h4 className="font-semibold text-sm text-foreground">Conversion Rates</h4>
          {data.map((item) => (
            <div key={item.stage} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.stage}</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${item.conversion}%` }}
                  />
                </div>
                <span className="font-medium text-foreground w-12">{item.conversion}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
