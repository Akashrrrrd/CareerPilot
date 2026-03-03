// Agent types for UI Navigator

export interface UIElement {
  type: 'input' | 'button' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'file' | 'link'
  label: string
  placeholder?: string
  value?: string
  required?: boolean
  position: {
    x: number
    y: number
    width: number
    height: number
  }
  selector?: string
}

export interface PageAnalysis {
  pageType: 'job_listing' | 'application_form' | 'login' | 'multi_step' | 'confirmation' | 'unknown'
  title: string
  description: string
  elements: UIElement[]
  nextSteps: string[]
  requiresAuth: boolean
  formFields: FormField[]
}

export interface FormField {
  name: string
  type: string
  label: string
  required: boolean
  options?: string[]
  mappedTo?: keyof ProfileData
}

export interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  location: string
  headline: string
  summary: string
  resumeUrl?: string
  coverLetterUrl?: string
  linkedinUrl?: string
  portfolioUrl?: string
  experience: ExperienceData[]
  education: EducationData[]
  skills: string[]
}

export interface ExperienceData {
  company: string
  position: string
  startDate: string
  endDate?: string
  description: string
  isCurrentRole: boolean
}

export interface EducationData {
  school: string
  degree: string
  field: string
  graduationYear: number
}

export interface AgentAction {
  type: 'click' | 'type' | 'select' | 'upload' | 'wait' | 'navigate' | 'scroll' | 'submit'
  target?: string
  value?: string
  description: string
  screenshot?: string
}

export interface ApplicationJob {
  id: string
  url: string
  title: string
  company: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  profileId: string
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  screenshots: string[]
  actions: AgentAction[]
}

export interface AgentSession {
  id: string
  jobId: string
  status: 'running' | 'paused' | 'completed' | 'failed'
  currentStep: number
  totalSteps: number
  logs: AgentLog[]
  startTime: Date
  endTime?: Date
}

export interface AgentLog {
  timestamp: Date
  level: 'info' | 'warning' | 'error' | 'success'
  message: string
  screenshot?: string
  action?: AgentAction
}
