'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
import { StatusBadge } from './status-badge'
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

interface Application {
  _id: string
  jobTitle: string
  company: string
  status: string
  appliedDate: string
  followUpDate?: string
  notes?: string
  location?: string
  salary?: string
  description?: string
  jobType?: string
}

interface ApplicationsTableProps {
  statusFilter?: string
  refreshKey?: number
  onRefresh?: () => void
}

export function ApplicationsTable({ statusFilter = 'all', refreshKey, onRefresh }: ApplicationsTableProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Application>>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchApplications()
  }, [refreshKey])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        console.log('No user found in localStorage')
        setLoading(false)
        return
      }

      const user = JSON.parse(storedUser)
      console.log('Fetching applications for user:', user.email)
      
      const response = await fetch(`/api/applications?userId=${encodeURIComponent(user.email)}`)
      console.log('Applications response status:', response.status)
      
      const data = await response.json()
      console.log('Applications data:', data)

      if (response.ok) {
        setApplications(data.applications || [])
      } else {
        console.error('Failed to fetch applications:', data)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (app: Application) => {
    setSelectedApp(app)
    setShowViewDialog(true)
  }

  const handleEdit = (app: Application) => {
    setSelectedApp(app)
    // Create a fresh copy of the application data for editing
    setEditForm({
      status: app.status,
      followUpDate: app.followUpDate,
      notes: app.notes || '',
    })
    setShowEditDialog(true)
  }

  const handleDelete = (app: Application) => {
    setSelectedApp(app)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!selectedApp) return

    try {
      const response = await fetch(`/api/applications?id=${selectedApp._id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Application deleted',
          description: 'The application has been removed',
        })
        fetchApplications()
        if (onRefresh) onRefresh()
      } else {
        throw new Error('Failed to delete')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete application',
        variant: 'destructive',
      })
    } finally {
      setShowDeleteDialog(false)
      setSelectedApp(null)
    }
  }

  const saveEdit = async () => {
    if (!selectedApp) return

    try {
      console.log('Saving application update:', {
        id: selectedApp._id,
        updates: editForm
      })

      const response = await fetch('/api/applications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedApp._id,
          ...editForm,
        }),
      })

      const data = await response.json()
      console.log('Update response:', data)

      if (response.ok) {
        toast({
          title: 'Application updated',
          description: 'Changes have been saved',
        })
        setShowEditDialog(false)
        setSelectedApp(null)
        fetchApplications()
        if (onRefresh) onRefresh()
      } else {
        throw new Error(data.error || 'Failed to update')
      }
    } catch (error: any) {
      console.error('Update error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update application',
        variant: 'destructive',
      })
    }
  }

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === 'all') return true
    return app.status === statusFilter
  })

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>
  }

  if (filteredApplications.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No applications found. Click "New Application" to add one.
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {filteredApplications.map((app) => (
          <Card key={app._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{app.jobTitle}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{app.company}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {app.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {app.location}
                      </div>
                    )}
                    {app.salary && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {app.salary}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Applied: {new Date(app.appliedDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleView(app)}
                    className="bg-muted/50 hover:bg-muted"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(app)}
                    className="bg-muted/50 hover:bg-muted"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(app)}
                    className="bg-muted/50 hover:bg-muted text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedApp?.jobTitle}</DialogTitle>
            <DialogDescription>{selectedApp?.company}</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            <div>
              <Label>Status</Label>
              <div className="mt-1">
                <StatusBadge status={selectedApp?.status || ''} />
              </div>
            </div>
            {selectedApp?.location && (
              <div>
                <Label>Location</Label>
                <p className="mt-1 text-sm">{selectedApp.location}</p>
              </div>
            )}
            {selectedApp?.salary && (
              <div>
                <Label>Salary</Label>
                <p className="mt-1 text-sm">{selectedApp.salary}</p>
              </div>
            )}
            {selectedApp?.jobType && (
              <div>
                <Label>Job Type</Label>
                <p className="mt-1 text-sm">{selectedApp.jobType}</p>
              </div>
            )}
            {selectedApp?.description && (
              <div>
                <Label>Description</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{selectedApp.description}</p>
              </div>
            )}
            {selectedApp?.notes && (
              <div>
                <Label>Notes</Label>
                <p className="mt-1 text-sm whitespace-pre-wrap">{selectedApp.notes}</p>
              </div>
            )}
            {selectedApp?.followUpDate && (
              <div>
                <Label>Follow-up Date</Label>
                <p className="mt-1 text-sm">
                  {new Date(selectedApp.followUpDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Application</DialogTitle>
            <DialogDescription>
              {selectedApp?.jobTitle} at {selectedApp?.company}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status *</Label>
              <Select
                value={editForm.status || 'Applied'}
                onValueChange={(value) => {
                  console.log('Status changed to:', value)
                  setEditForm({ ...editForm, status: value })
                }}
              >
                <SelectTrigger id="edit-status" className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="Applied">Applied</SelectItem>
                  <SelectItem value="Interviewing">Interviewing</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Update the current status of your application
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-followup">Follow-up Date</Label>
              <Input
                id="edit-followup"
                type="date"
                value={editForm.followUpDate ? new Date(editForm.followUpDate).toISOString().split('T')[0] : ''}
                onChange={(e) => {
                  console.log('Follow-up date changed to:', e.target.value)
                  setEditForm({ ...editForm, followUpDate: e.target.value })
                }}
              />
              <p className="text-xs text-muted-foreground">
                Set a reminder date to follow up on this application
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes || ''}
                onChange={(e) => {
                  console.log('Notes changed, length:', e.target.value.length)
                  setEditForm({ ...editForm, notes: e.target.value })
                }}
                rows={5}
                placeholder="Add notes about interviews, contacts, feedback, or next steps..."
              />
              <p className="text-xs text-muted-foreground">
                Keep track of interview details, feedback, or any important information
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the application for {selectedApp?.jobTitle} at{' '}
              {selectedApp?.company}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
