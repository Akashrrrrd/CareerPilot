import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, { color: string; label: string }> = {
  'Applied': { 
    color: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20', 
    label: 'Applied' 
  },
  'Interviewing': { 
    color: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-500/20', 
    label: 'Interviewing' 
  },
  'Offer': { 
    color: 'bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20', 
    label: 'Offer' 
  },
  'Rejected': { 
    color: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20', 
    label: 'Rejected' 
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig['Applied']
  
  return (
    <Badge variant="outline" className={`${config.color} ${className}`}>
      {config.label}
    </Badge>
  )
}
