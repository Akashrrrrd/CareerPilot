// Type definitions for CareerPilot AI

export type ApplicationStatus = 'applied' | 'interviewing' | 'offer' | 'rejected' | 'accepted'
export type MessageRole = 'user' | 'assistant'

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export interface Profile {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  location?: string
  headline?: string
  summary?: string
  createdAt: Date
}

export interface Experience {
  id: string
  profileId: string
  company: string
  position: string
  startDate: string
  endDate?: string | null
  description?: string
  isCurrentRole: boolean
}

export interface Education {
  id: string
  profileId: string
  school: string
  degree: string
  field: string
  graduationYear: number
}

export interface Skill {
  id: string
  profileId: string
  name: string
  endorsements: number
}

export interface Job {
  id: string
  title: string
  company: string
  location?: string
  salary?: string
  description?: string
  jobType?: string
  postedDays?: number
  matchScore?: number
}

export interface Application {
  id: string
  userId: string
  jobId: string
  jobTitle: string
  company: string
  status: ApplicationStatus
  appliedDate: Date
  salary?: string
  matchScore?: number
  interviewDate?: Date
  offerDate?: Date
  notes?: string
}

export interface ChatSession {
  id: string
  userId: string
  title: string
  createdAt: Date
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: MessageRole
  content: string
  createdAt: Date
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
