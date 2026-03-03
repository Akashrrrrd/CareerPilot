import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface AnalyticsStatsProps {
  period?: 'week' | 'month' | 'quarter' | 'year'
}

export function AnalyticsStats({ period = 'month' }: AnalyticsStatsProps) {
  const stats = [
    {
      title: 'Applications Submitted',
      value: '42',
      change: '+12%',
      positive: true,
      previous: 'vs 37 last month',
    },
    {
      title: 'Response Rate',
      value: '19%',
      change: '+2%',
      positive: true,
      previous: 'vs 17% last month',
    },
    {
      title: 'Interview Conversion',
      value: '28%',
      change: '-3%',
      positive: false,
      previous: 'vs 31% last month',
    },
    {
      title: 'Average Time to Interview',
      value: '8.5 days',
      change: '-1 day',
      positive: true,
      previous: 'vs 9.5 days last month',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                <Badge
                  variant="outline"
                  className={`${
                    stat.positive
                      ? 'bg-green-500/10 text-green-500 border-green-500/20'
                      : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}
                >
                  {stat.positive ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stat.change}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{stat.previous}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
