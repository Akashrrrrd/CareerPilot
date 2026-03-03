import { Badge } from '@/components/ui/badge'

type ApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'rejected' | 'pending'

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

const statusColors: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  interviewing: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  offer: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
}

const statusLabels: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  interviewing: 'Interviewing',
  offer: 'Offer',
  rejected: 'Rejected',
  pending: 'Pending',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge variant="secondary" className={`${statusColors[status]} ${className}`}>
      {statusLabels[status]}
    </Badge>
  )
}
