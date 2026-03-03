'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { ApplicationsTable } from '@/components/applications/applications-table'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Filter } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewAppDialog, setShowNewAppDialog] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [newApplication, setNewApplication] = useState({
    jobTitle: '',
    company: '',
    status: 'Applied',
    location: '',
    salary: '',
    jobType: '',
    description: '',
    notes: '',
    followUpDate: '',
  })
  const { toast } = useToast()

  const handleCreateApplication = async () => {
    if (!newApplication.jobTitle || !newApplication.company || !newApplication.location || !newApplication.jobType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        toast({
          title: 'Error',
          description: 'Please login first',
          variant: 'destructive',
        })
        return
      }

      const user = JSON.parse(storedUser)

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          ...newApplication,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create application')
      }

      toast({
        title: 'Application Created',
        description: `Added ${newApplication.jobTitle} at ${newApplication.company}`,
      })

      // Reset form
      setNewApplication({
        jobTitle: '',
        company: '',
        status: 'Applied',
        location: '',
        salary: '',
        jobType: '',
        description: '',
        notes: '',
        followUpDate: '',
      })
      setShowNewAppDialog(false)
      setRefreshKey(prev => prev + 1) // Trigger refresh
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create application',
        variant: 'destructive',
      })
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Application Tracker</h1>
            <p className="mt-2 text-muted-foreground">Track and manage all your job applications</p>
          </div>
          <Button className="gap-2" onClick={() => setShowNewAppDialog(true)}>
            <Plus className="h-4 w-4" />
            New Application
          </Button>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            key="All"
            size="sm"
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('all')}
            className="gap-1"
          >
            <Filter className="h-3 w-3" />
            All
          </Button>
          {['Applied', 'Interviewing', 'Offer', 'Rejected'].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Table */}
        <ApplicationsTable statusFilter={statusFilter} refreshKey={refreshKey} onRefresh={() => setRefreshKey(prev => prev + 1)} />

        {/* New Application Dialog */}
        <Dialog open={showNewAppDialog} onOpenChange={setShowNewAppDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Application</DialogTitle>
              <DialogDescription>Add a new job application to track</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new-jobTitle">Job Title *</Label>
                <Input
                  id="new-jobTitle"
                  placeholder="e.g. Senior React Developer"
                  value={newApplication.jobTitle}
                  onChange={(e) => setNewApplication({ ...newApplication, jobTitle: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-company">Company *</Label>
                <Input
                  id="new-company"
                  placeholder="e.g. Tech Corp"
                  value={newApplication.company}
                  onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-status">Status</Label>
                <Select
                  value={newApplication.status}
                  onValueChange={(value) =>
                    setNewApplication({ ...newApplication, status: value })
                  }
                >
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-location">Location *</Label>
                  <Input
                    id="new-location"
                    placeholder="e.g. San Francisco, CA"
                    value={newApplication.location}
                    onChange={(e) => setNewApplication({ ...newApplication, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-salary">Salary</Label>
                  <Input
                    id="new-salary"
                    placeholder="e.g. $120k - $160k"
                    value={newApplication.salary}
                    onChange={(e) => setNewApplication({ ...newApplication, salary: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="new-jobType">Job Type *</Label>
                  <Input
                    id="new-jobType"
                    placeholder="e.g. Full-time"
                    value={newApplication.jobType}
                    onChange={(e) => setNewApplication({ ...newApplication, jobType: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-followUpDate">Follow-up Date</Label>
                  <Input
                    id="new-followUpDate"
                    type="date"
                    value={newApplication.followUpDate}
                    onChange={(e) => setNewApplication({ ...newApplication, followUpDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-description">Job Description</Label>
                <Textarea
                  id="new-description"
                  placeholder="Describe the job role and requirements..."
                  value={newApplication.description}
                  onChange={(e) => setNewApplication({ ...newApplication, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-notes">Notes</Label>
                <Textarea
                  id="new-notes"
                  placeholder="Add any additional notes..."
                  value={newApplication.notes}
                  onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewAppDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateApplication}>
                Create Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
