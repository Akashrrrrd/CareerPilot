'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface SkillsSectionProps {
  skills: string[]
  setSkills: (skills: string[]) => void
}

export function SkillsSection({ skills, setSkills }: SkillsSectionProps) {
  const [newSkill, setNewSkill] = React.useState('')

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const suggestedSkills = ['Python', 'AWS', 'Docker', 'REST APIs', 'Agile', 'Communication', 'Leadership', 'Problem Solving']

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="new-skill">Add a Skill</Label>
        <div className="flex gap-2">
          <Input
            id="new-skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., JavaScript, Project Management"
          />
          <Button onClick={handleAddSkill} type="button">
            Add
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Your Skills ({skills.length})</Label>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="gap-1 text-xs cursor-pointer hover:bg-destructive/20 group"
              onClick={() => handleRemoveSkill(index)}
            >
              {skill}
              <X className="h-3 w-3 opacity-0 group-hover:opacity-100" />
            </Badge>
          ))}
        </div>
        {skills.length === 0 && (
          <p className="text-sm text-muted-foreground">Add skills to boost your profile visibility</p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-background p-4">
        <h4 className="font-medium text-foreground mb-2">Suggested Skills</h4>
        <div className="flex flex-wrap gap-2">
          {suggestedSkills.map((skill) => (
            <Badge
              key={skill}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 text-xs"
              onClick={() => {
                if (!skills.includes(skill)) {
                  setSkills([...skills, skill])
                }
              }}
            >
              + {skill}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
