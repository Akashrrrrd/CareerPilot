'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExperienceSection } from './experience-section'
import { EducationSection } from './education-section'
import { SkillsSection } from './skills-section'
import { Save } from 'lucide-react'
import { toast } from 'sonner'

interface Experience {
  id: string
  title: string
  company: string
  startDate: string
  endDate: string
  isCurrent: boolean
  description: string
}

interface Education {
  id: string
  school: string
  degree: string
  field: string
  gradDate: string
  description?: string
}

export function ProfileForm() {
  const [isSaving, setIsSaving] = useState(false)
  const [userName, setUserName] = useState('')
  const [profileName, setProfileName] = useState('')
  const [headline, setHeadline] = useState('')
  const [summary, setSummary] = useState('')
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [educations, setEducations] = useState<Education[]>([])
  const [skills, setSkills] = useState<string[]>([])

  useEffect(() => {
    // Load user data from localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setUserName(user.name || '')
      
      // Fetch profile from MongoDB
      fetchProfile(user.email || user.id)
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/profile?userId=${encodeURIComponent(userId)}`)
      const data = await response.json()

      if (response.ok && data.profile) {
        setProfileName(data.profile.profileName || '')
        setHeadline(data.profile.headline || '')
        setSummary(data.profile.summary || '')
        setExperiences(data.profile.experience || [])
        setEducations(data.profile.education || [])
        setSkills(data.profile.skills || [])
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast.error('Failed to load profile')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) {
        toast.error('Please login first')
        setIsSaving(false)
        return
      }

      const user = JSON.parse(storedUser)
      const userId = user.email || user.id

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          profileName,
          headline,
          summary,
          experience: experiences,
          education: educations,
          skills,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save profile')
      }

      toast.success('Profile saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Builder</h1>
          <p className="mt-2 text-muted-foreground">Create and manage your professional profile</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      {/* Basic Info Card */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your profile name and headline</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-name">Your Name</Label>
            <Input
              id="user-name"
              value={userName}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">This is your account name</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="profile-name">Profile Name</Label>
            <Input
              id="profile-name"
              placeholder="e.g., Software Engineer, Product Manager"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Give your profile a meaningful name</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              placeholder="e.g., Full Stack Developer with 5 years experience"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">This appears in job matches</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Professional Summary</Label>
            <textarea
              id="summary"
              placeholder="Write a brief summary of your professional background and goals..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground">{summary.length}/500 characters</p>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Sections */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Experience & Education</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="experience" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="experience" className="space-y-4">
              <ExperienceSection 
                experiences={experiences}
                setExperiences={setExperiences}
              />
            </TabsContent>

            <TabsContent value="education" className="space-y-4">
              <EducationSection 
                educations={educations}
                setEducations={setEducations}
              />
            </TabsContent>

            <TabsContent value="skills" className="space-y-4">
              <SkillsSection 
                skills={skills}
                setSkills={setSkills}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
