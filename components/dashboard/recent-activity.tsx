'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Edit, Archive, Calendar, MapPin, DollarSign } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface Activity {
  id: string
  jobTitle: string
  company: string
  status: 'applied' | 'interviewing' | 'rejected' | 'accepted'
  appliedDate: string
  matchScore?: number
  location?: string
  salary?: string
  description?: string
  jobType?: string
}

interface RecentActivityProps {
  activities?: Activity[]
}

const defaultActivities: Activity[] = [
  {
    id: '1',
    jobTitle: 'Senior React Developer',
    company: 'Tech Corp',
    status: 'applied',
    appliedDate: '2 hours ago',
    matchScore: 92,
    location: 'San Francisco, CA',
    salary: '$120k - $160k',
    description: 'We are looking for an experienced React developer to join our team and build amazing user interfaces.',
    jobType: 'Full-time',
  },
  {
    id: '2',
    jobTitle: 'Full Stack Engineer',
    company: 'StartupXYZ',
    status: 'interviewing',
    appliedDate: '1 day ago',
    matchScore: 88,
    location: 'Remote',
    salary: '$100k - $140k',
    description: 'Join our fast-growing startup and work on cutting-edge technologies.',
    jobType: 'Full-time',
  },
  {
    id: '3',
    jobTitle: 'Frontend Developer',
    company: 'Design Studio',
    status: 'applied',
    appliedDate: '3 days ago',
    matchScore: 85,
    location: 'New York, NY',
    salary: '$90k - $130k',
    description: 'Create beautiful and responsive web applications for our clients.',
    jobType: 'Contract',
  },
]

const statusColors = {
  applied: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  interviewing: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  rejected: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  accepted: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
}

export function RecentActivity({ activities = defaultActivities }: RecentActivityProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [editActivity, setEditActivity] = useState<Activity | null>(null)
  const [archiveActivity, setArchiveActivity] = useState<Activity | null>(null)
  const [localActivities, setLocalActivities] = useState(activities)
  const { toast } = useToast()
  const router = useRouter()

  const handleView = (activity: Activity) => {
    setSelectedActivity(activity)
  }

  const handleEdit = (activity: Activity) => {
    setEditActivity(activity)
  }

  const handleSaveEdit = () => {
    if (editActivity) {
      setLocalActivities(localActivities.map((a) => 
        a.id === editActivity.id ? editActivity : a
      ))
      toast({
        title: 'Application Updated',
        description: `Updated ${editActivity.jobTitle} at ${editActivity.company}`,
      })
      setEditActivity(null)
    }
  }

  const handleArchive = (activity: Activity) => {
    setArchiveActivity(activity)
  }

  const confirmArchive = () => {
    if (archiveActivity) {
      setLocalActivities(localActivities.filter((a) => a.id !== archiveActivity.id))
      toast({
        title: 'Application Archived',
        description: `${archiveActivity.jobTitle} at ${archiveActivity.company} has been archived`,
      })
      setArchiveActivity(null)
    }
  }

  return (
    <>
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your latest job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {localActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground">{activity.jobTitle}</h4>
                    <Badge variant="secondary" className={statusColors[activity.status]}>
                      {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.company}</p>
                  <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{activity.appliedDate}</span>
                    {activity.matchScore && (
                      <span className="text-primary font-medium">
                        {activity.matchScore}% match
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-muted/50 hover:bg-muted"
                    onClick={() => handleView(activity)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-muted/50 hover:bg-muted"
                    onClick={() => handleEdit(activity)}
                    title="Edit application"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-muted/50 hover:bg-muted hover:text-red-500"
                    onClick={() => handleArchive(activity)}
                    title="Archive application"
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedActivity?.jobTitle}</DialogTitle>
            <DialogDescription>{selectedActivity?.company}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Badge variant="secondary" className={selectedActivity ? statusColors[selectedActivity.status] : ''}>
                {selectedActivity?.status.charAt(0).toUpperCase() + selectedActivity?.status.slice(1)}
              </Badge>
              {selectedActivity?.matchScore && (
                <span className="text-sm text-primary font-medium">
                  {selectedActivity.matchScore}% match
                </span>
              )}
            </div>

            <div className="grid gap-3">
              {selectedActivity?.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedActivity.location}</span>
                </div>
              )}
              {selectedActivity?.salary && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedActivity.salary}</span>
                </div>
              )}
              {selectedActivity?.jobType && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedActivity.jobType}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Applied {selectedActivity?.appliedDate}</span>
              </div>
            </div>

            {selectedActivity?.description && (
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium mb-2">Job Description</h4>
                <p className="text-sm text-muted-foreground">{selectedActivity.description}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedActivity(null)}>
              Close
            </Button>
            <Button onClick={() => {
              handleEdit(selectedActivity!)
              setSelectedActivity(null)
            }}>
              Edit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={!!archiveActivity} onOpenChange={() => setArchiveActivity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive the application for {archiveActivity?.jobTitle} at {archiveActivity?.company}? 
              This action can be undone from the archived applications page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Application Dialog */}
      <Dialog open={!!editActivity} onOpenChange={() => setEditActivity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>Update your application details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={editActivity?.jobTitle || ''}
                onChange={(e) => setEditActivity(editActivity ? { ...editActivity, jobTitle: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={editActivity?.company || ''}
                onChange={(e) => setEditActivity(editActivity ? { ...editActivity, company: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editActivity?.status}
                onValueChange={(value: 'applied' | 'interviewing' | 'rejected' | 'accepted') =>
                  setEditActivity(editActivity ? { ...editActivity, status: value } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editActivity?.location || ''}
                  onChange={(e) => setEditActivity(editActivity ? { ...editActivity, location: e.target.value } : null)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  value={editActivity?.salary || ''}
                  onChange={(e) => setEditActivity(editActivity ? { ...editActivity, salary: e.target.value } : null)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jobType">Job Type</Label>
              <Input
                id="jobType"
                value={editActivity?.jobType || ''}
                onChange={(e) => setEditActivity(editActivity ? { ...editActivity, jobType: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editActivity?.description || ''}
                onChange={(e) => setEditActivity(editActivity ? { ...editActivity, description: e.target.value } : null)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditActivity(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
