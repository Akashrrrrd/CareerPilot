'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, Filter, X } from 'lucide-react'

interface JobFiltersType {
  keyword: string
  location: string
  jobType: string[]
}

interface JobFilterProps {
  onFilterChange?: (filters: { search: string; location: string; jobType: string }) => void
}

const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote']

export function JobFilter({ onFilterChange }: JobFilterProps) {
  const [filters, setFilters] = useState<JobFiltersType>({
    keyword: '',
    location: '',
    jobType: [],
  })

  // Debounce keyword and location changes
  useEffect(() => {
    const timer = setTimeout(() => {
      notifyParent(filters)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timer)
  }, [filters.keyword, filters.location])

  // Immediate update for job type changes
  useEffect(() => {
    if (filters.jobType.length > 0 || filters.keyword || filters.location) {
      notifyParent(filters)
    }
  }, [filters.jobType])

  const notifyParent = (currentFilters: JobFiltersType) => {
    onFilterChange?.({
      search: currentFilters.keyword || 'software developer', // Default search
      location: currentFilters.location || 'United States', // Default location
      jobType: currentFilters.jobType.length > 0 ? currentFilters.jobType[0] : '',
    })
  }

  const handleKeywordChange = (value: string) => {
    setFilters({ ...filters, keyword: value })
  }

  const handleLocationChange = (value: string) => {
    setFilters({ ...filters, location: value })
  }

  const handleJobTypeToggle = (type: string) => {
    const newJobTypes = filters.jobType.includes(type)
      ? filters.jobType.filter(t => t !== type)
      : [type] // Only allow one job type at a time
    setFilters({ ...filters, jobType: newJobTypes })
  }

  const handleReset = () => {
    const emptyFilters = {
      keyword: '',
      location: '',
      jobType: [],
    }
    setFilters(emptyFilters)
    notifyParent(emptyFilters)
  }

  const hasActiveFilters = filters.keyword || filters.location || filters.jobType.length > 0

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
          <Label className="text-xs font-semibold">Job Title / Keywords</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="e.g. Software Engineer"
              value={filters.keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              className="pl-8"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Leave empty for general search
          </p>
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">Location</Label>
          <Input
            placeholder="e.g. New York, Remote"
            value={filters.location}
            onChange={(e) => handleLocationChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            City, state, or "Remote"
          </p>
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

        {hasActiveFilters && (
          <div className="pt-2 text-xs text-muted-foreground">
            Filters applied automatically
          </div>
        )}
      </CardContent>
    </Card>
  )
}
