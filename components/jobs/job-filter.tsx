'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, X } from 'lucide-react'

interface JobFiltersType {
  keyword: string
  location: string
  salaryMin: string
  salaryMax: string
  jobType: string[]
  experience: string[]
}

interface JobFilterProps {
  onFiltersChange?: (filters: JobFiltersType) => void
}

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Temporary']
const experienceLevels = ['Entry Level', 'Mid Level', 'Senior', 'Executive']

export function JobFilter({ onFiltersChange }: JobFilterProps) {
  const [filters, setFilters] = useState<JobFiltersType>({
    keyword: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    jobType: [],
    experience: [],
  })

  const handleFilterChange = (newFilters: JobFiltersType) => {
    setFilters(newFilters)
    onFiltersChange?.(newFilters)
  }

  const handleKeywordChange = (value: string) => {
    handleFilterChange({ ...filters, keyword: value })
  }

  const handleLocationChange = (value: string) => {
    handleFilterChange({ ...filters, location: value })
  }

  const handleJobTypeToggle = (type: string) => {
    const newJobTypes = filters.jobType.includes(type)
      ? filters.jobType.filter(t => t !== type)
      : [...filters.jobType, type]
    handleFilterChange({ ...filters, jobType: newJobTypes })
  }

  const handleExperienceToggle = (level: string) => {
    const newExperience = filters.experience.includes(level)
      ? filters.experience.filter(l => l !== level)
      : [...filters.experience, level]
    handleFilterChange({ ...filters, experience: newExperience })
  }

  const handleReset = () => {
    const emptyFilters = {
      keyword: '',
      location: '',
      salaryMin: '',
      salaryMax: '',
      jobType: [],
      experience: [],
    }
    setFilters(emptyFilters)
    onFiltersChange?.(emptyFilters)
  }

  const hasActiveFilters = filters.keyword || filters.location || filters.jobType.length > 0 || filters.experience.length > 0

  return (
    <Card className="bg-card sticky top-24 h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base">Filters</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReset}
              className="h-7 gap-1 text-xs"
            >
              <X className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Keyword Search */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Keywords</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Job title, skills..."
              value={filters.keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Location</Label>
          <Input
            placeholder="City, state, or remote"
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
          />
        </div>

        {/* Salary Range */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Salary Range</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.salaryMin}
              onChange={(e) => handleFilterChange({ ...filters, salaryMin: e.target.value })}
              className="text-xs"
            />
            <span className="flex items-center text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.salaryMax}
              onChange={(e) => handleFilterChange({ ...filters, salaryMax: e.target.value })}
              className="text-xs"
            />
          </div>
        </div>

        {/* Job Type */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Job Type</Label>
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`jobtype-${type}`}
                  checked={filters.jobType.includes(type)}
                  onCheckedChange={() => handleJobTypeToggle(type)}
                />
                <label
                  htmlFor={`jobtype-${type}`}
                  className="text-xs cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold">Experience</Label>
          <div className="space-y-2">
            {experienceLevels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`exp-${level}`}
                  checked={filters.experience.includes(level)}
                  onCheckedChange={() => handleExperienceToggle(level)}
                />
                <label
                  htmlFor={`exp-${level}`}
                  className="text-xs cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {level}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full" size="sm">
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  )
}
