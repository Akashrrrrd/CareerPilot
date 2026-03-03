'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Eye, Edit, Trash2, Calendar, MapPin, DollarSign } from 'lucide-react'
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
import { Input } from '@/components/ui/input'

interface Activity {
  id: string
  jobTitle: string
  company: string
  status: 'applied' | 'interviewing' | 'offer' | 'rejected'
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

const statusColors = {
  applied: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
  interviewing: 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
  rejected: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  offer: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
}

export function RecentActivity({ activities = [] }: RecentActivityProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [editActivity, setEditActivity] = useState<Activity | null>(null)
  const [editStatus, setEditStatus] = useState<string>('')
  const [editNotes, setEditNotes] = useState<string>('')
  const [editFollowUpDate, setEditFollowUpDate] = useState<string>('')
  const [deleteActivity, setDeleteActivity] = useState<Activity | null>(null)
  const [localActivities, setLocalActivities] = useState(activities)
  const { toast } = useToast()

  const handleView = (activity: Activity) => {
    setSelectedActivity(activity)
  }

  const handleEdit = (activity: Activity) => {
    setEditActivity(activity)
    setEditStatus(activity.status.charAt(0).toUpperCase() + activity.status.slice(1))
    setEditNotes('')
    setEditFollowUpDate('')
  }

  const handleSaveEdit = async () => {
    if (!editActivity) return

    try {
      const userEmail = localStorage.getItem('userEmail')
      if (!userEmail) {
        toast({
          title: 'Error',
          description: 'User not authenticated',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editActivity.id,
          userId: userEmail,
          status: editStatus,
          notes: editNotes || undefined,
          followUpDate: editFollowUpDate || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update application')
      }

      // Update local state
      const updatedActivity = {
        ...editActivity,
        status: editStatus.toLowerCase() as 'applied' | 'interviewing' | 'offer' | 'rejected',
      }
      
      setLocalActivities(localActivities.map((a) => 
        a.id === editActivity.id ? updatedActivity : a
      ))

      toast({
        title: 'Application Updated',
        description: `Updated ${editActivity.jobTitle} at ${editActivity.company}`,
      })
      setEditActivity(null)
    } catch (error) {
      console.error('Error updating application:', error)
      toast({
        title: 'Error',
        description: 'Failed to update application',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = (activity: Activity) => {
    setDeleteActivity(activity)
  }

  const confirmDelete = async () => {
    if (!deleteActivity) return

    try {
      const userEmail = localStorage.getItem('userEmail')
      if (!userEmail) {
        toast({
          title: 'Error',
          description: 'User not authenticated',
          variant: 'destructive',
        })
        return
      }

      const response = await fetch(`/api/applications?id=${deleteActivity.id}&userId=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete application')
      }

      setLocalActivities(localActivities.filter((a) => a.id !== deleteActivity.id))
      toast({
        title: 'Application Deleted',
        description: `${deleteActivity.jobTitle} at ${deleteActivity.company} has been deleted`,
      })
      setDeleteActivity(null)
    } catch (error) {
      console.error('Error deleting application:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete application',
        variant: 'destructive',
      })
    }
  }

  if (localActivities.length === 0) {
    return (
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your latest job applications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No applications yet. Start applying to jobs!
          </div>
        </CardContent>
      </Card>
    )
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
                    onClick={() => handleDelete(activity)}
                    title="Delete application"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={!!selectedActivity} onOpenChange={() => setSelectedActivity(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedActivity?.jobTitle}</DialogTitle>
            <DialogDescription>{selectedActivity?.company}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto flex-1">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteActivity} onOpenChange={() => setDeleteActivity(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the application for {deleteActivity?.jobTitle} at {deleteActivity?.company}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Application Dialog */}
      <Dialog open={!!editActivity} onOpenChange={() => setEditActivity(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>Update your application status and notes</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Job Title</Label>
              <div className="text-sm text-muted-foreground">{editActivity?.jobTitle}</div>
            </div>
            <div className="grid gap-2">
              <Label>Company</Label>
              <div className="text-sm text-muted-foreground">{editActivity?.company}</div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interviewing">Interviewing</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="followUpDate">Follow-up Date (Optional)</Label>
              <Input
                id="followUpDate"
                type="date"
                value={editFollowUpDate}
                onChange={(e) => setEditFollowUpDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={4}
                placeholder="Add any notes about this application..."
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
