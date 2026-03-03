'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, GripVertical, Plus } from 'lucide-react'

interface Experience {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
}

interface ExperienceSectionProps {
  experiences: Experience[]
  setExperiences: (experiences: Experience[]) => void
}

export function ExperienceSection({ experiences, setExperiences }: ExperienceSectionProps) {
  const handleAdd = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
    }
    setExperiences([...experiences, newExperience])
  }

  const handleDelete = (id: string) => {
    setExperiences(experiences.filter(exp => exp.id !== id))
  }

  const handleUpdate = (id: string, field: keyof Experience, value: any) => {
    setExperiences(experiences.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    ))
  }

  return (
    <div className="space-y-4">
      {experiences.map((experience) => (
        <div key={experience.id} className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
            <div className="flex-1 space-y-3">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Job Title</Label>
                  <Input
                    value={experience.title}
                    onChange={(e) => handleUpdate(experience.id, 'title', e.target.value)}
                    placeholder="e.g., Senior React Developer"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Company</Label>
                  <Input
                    value={experience.company}
                    onChange={(e) => handleUpdate(experience.id, 'company', e.target.value)}
                    placeholder="e.g., Tech Corp"
                  />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Date</Label>
                  <Input
                    type="month"
                    value={experience.startDate}
                    onChange={(e) => handleUpdate(experience.id, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Date</Label>
                  <Input
                    type="month"
                    value={experience.endDate}
                    disabled={experience.isCurrent}
                    onChange={(e) => handleUpdate(experience.id, 'endDate', e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-xs cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={experience.isCurrent}
                      onChange={(e) => handleUpdate(experience.id, 'isCurrent', e.target.checked)}
                      className="rounded"
                    />
                    <span>Currently working</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Description</Label>
                <textarea
                  value={experience.description}
                  onChange={(e) => handleUpdate(experience.id, 'description', e.target.value)}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(experience.id)}
              className="text-destructive hover:text-destructive mt-1"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      
      {experiences.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No experience added yet. Click the button below to add your first experience.
        </div>
      )}
      
      <Button variant="outline" className="w-full gap-2" onClick={handleAdd}>
        <Plus className="h-4 w-4" />
        Add Experience
      </Button>
    </div>
  )
}
