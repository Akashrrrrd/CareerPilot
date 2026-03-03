'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, GripVertical } from 'lucide-react'
import { useState } from 'react'

interface Education {
  id: string
  school: string
  degree: string
  field: string
  gradDate: string
  description?: string
}

export function EducationSection() {
  const [educations, setEducations] = useState<Education[]>([
    {
      id: '1',
      school: 'State University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      gradDate: '2019-05',
      description: 'Graduated with honors. GPA: 3.8',
    },
  ])

  const handleDelete = (id: string) => {
    setEducations(educations.filter(edu => edu.id !== id))
  }

  const handleUpdate = (id: string, field: string, value: string) => {
    setEducations(educations.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    ))
  }

  return (
    <div className="space-y-4">
      {educations.map((education) => (
        <div key={education.id} className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-start gap-3">
            <GripVertical className="h-5 w-5 text-muted-foreground mt-1 cursor-grab" />
            <div className="flex-1 space-y-3">
              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">School/University</Label>
                  <Input
                    value={education.school}
                    onChange={(e) => handleUpdate(education.id, 'school', e.target.value)}
                    placeholder="e.g., State University"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Degree</Label>
                  <Input
                    value={education.degree}
                    onChange={(e) => handleUpdate(education.id, 'degree', e.target.value)}
                    placeholder="e.g., Bachelor of Science"
                  />
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Field of Study</Label>
                  <Input
                    value={education.field}
                    onChange={(e) => handleUpdate(education.id, 'field', e.target.value)}
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Graduation Date</Label>
                  <Input
                    type="month"
                    value={education.gradDate}
                    onChange={(e) => handleUpdate(education.id, 'gradDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Additional Information</Label>
                <textarea
                  value={education.description || ''}
                  onChange={(e) => handleUpdate(education.id, 'description', e.target.value)}
                  placeholder="e.g., GPA, honors, relevant coursework..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(education.id)}
              className="text-destructive hover:text-destructive mt-1"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
