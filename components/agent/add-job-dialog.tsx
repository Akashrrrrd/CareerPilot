'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AddJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onJobAdded?: () => void
}

export function AddJobDialog({ open, onOpenChange, onJobAdded }: AddJobDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    url: '',
    title: '',
    company: '',
  })
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.email) {
      toast.error('Please log in to add jobs')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/agent/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user.email,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Job added to queue successfully!')
        setFormData({ url: '', title: '', company: '' })
        onOpenChange(false)
        if (onJobAdded) {
          onJobAdded()
        }
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Job to Queue</DialogTitle>
          <DialogDescription>
            Enter the job details and URL. The AI agent will automatically apply using your profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Job URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://linkedin.com/jobs/view/..."
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              placeholder="Senior React Developer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              placeholder="Tech Corp"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Queue'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
