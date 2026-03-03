import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, DollarSign, Clock, BookmarkPlus, ExternalLink } from 'lucide-react'

interface JobCardProps {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  description: string
  jobType: string
  postedDays: number
  matchScore: number
  applyLink?: string
  thumbnail?: string
  isSaved?: boolean
  onApply?: (id: string) => void
  onSave?: (id: string) => void
}

export function JobCard({
  id,
  title,
  company,
  location,
  salary,
  description,
  jobType,
  postedDays,
  matchScore,
  isSaved = false,
  onApply,
  onSave,
}: JobCardProps) {
  return (
    <Card className="bg-card hover:shadow-md transition-shadow cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{company}</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                onSave?.(id)
              }}
              className={`${isSaved ? 'text-primary' : ''}`}
            >
              <BookmarkPlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Meta information */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          {salary && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{salary}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{postedDays}d ago</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-foreground line-clamp-2">{description}</p>

        {/* Tags and Match Score */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge variant="outline">{jobType}</Badge>
          <Badge
            variant="secondary"
            className={`${
              matchScore >= 85
                ? 'bg-green-500/10 text-green-500'
                : matchScore >= 70
                ? 'bg-blue-500/10 text-blue-500'
                : 'bg-yellow-500/10 text-yellow-500'
            }`}
          >
            {matchScore}% match
          </Badge>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            className="w-full gap-2"
            onClick={() => onApply?.(id)}
          >
            <span>View Job</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
