'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

const data = [
  { stage: 'Applied', count: 150, conversion: 100 },
  { stage: 'Interviews', count: 42, conversion: 28 },
  { stage: 'Offers', count: 8, conversion: 5.3 },
  { stage: 'Accepted', count: 2, conversion: 1.3 },
]

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
]

export function FunnelChart() {
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
            margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
            <YAxis
              dataKey="stage"
              type="category"
              stroke="hsl(var(--muted-foreground))"
              width={100}
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
