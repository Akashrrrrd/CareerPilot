#!/usr/bin/env tsx
/**
 * Standalone runner for testing the agent
 * Usage: npm run agent
 */

import { ApplicationAgent } from './application-agent'
import type { ApplicationJob, ProfileData } from './types'

const mockProfile: ProfileData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  headline: 'Senior Full Stack Developer | React & Node.js Expert',
  summary:
    'Experienced software engineer with 8+ years building scalable web applications. Passionate about clean code, user experience, and modern web technologies.',
  resumeUrl: './resume.pdf',
  coverLetterUrl: './cover-letter.pdf',
  linkedinUrl: 'https://linkedin.com/in/johndoe',
  portfolioUrl: 'https://johndoe.dev',
  experience: [
    {
      company: 'Tech Corp',
      position: 'Senior Full Stack Developer',
      startDate: '2021-01-01',
      endDate: undefined,
      description:
        'Leading frontend development team, architecting scalable React applications, mentoring junior developers.',
      isCurrentRole: true,
    },
    {
      company: 'StartupXYZ',
      position: 'Full Stack Engineer',
      startDate: '2019-06-01',
      endDate: '2020-12-31',
      description:
        'Built and maintained full-stack web applications using React, Node.js, and PostgreSQL.',
      isCurrentRole: false,
    },
  ],
  education: [
    {
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      graduationYear: 2018,
    },
  ],
  skills: [
    'React',
    'Node.js',
    'TypeScript',
    'PostgreSQL',
    'AWS',
    'Docker',
    'GraphQL',
    'Next.js',
  ],
}

const mockJob: ApplicationJob = {
  id: 'test_job_1',
  url: process.argv[2] || 'https://www.linkedin.com/jobs/view/3847234567',
  title: 'Senior React Developer',
  company: 'Tech Corp',
  status: 'queued',
  profileId: 'profile_1',
  createdAt: new Date(),
  screenshots: [],
  actions: [],
}

async function main() {
  console.log('🤖 CareerPilot AI Agent - Test Runner\n')
  console.log('Job:', mockJob.title, 'at', mockJob.company)
  console.log('URL:', mockJob.url)
  console.log('\nStarting application process...\n')

  const agent = new ApplicationAgent()

  try {
    const session = await agent.processApplication(mockJob, mockProfile)

    console.log('\n✅ Application completed!')
    console.log('\nSession Summary:')
    console.log('- Status:', session.status)
    console.log('- Steps:', session.currentStep, '/', session.totalSteps)
    console.log('- Duration:', session.endTime && session.startTime 
      ? `${Math.round((session.endTime.getTime() - session.startTime.getTime()) / 1000)}s`
      : 'N/A')
    console.log('\nLogs:')
    session.logs.forEach((log, i) => {
      const icon = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        success: '✅',
      }[log.level]
      console.log(`${i + 1}. ${icon} ${log.message}`)
    })
  } catch (error) {
    console.error('\n❌ Application failed:', error)
    process.exit(1)
  }
}

main()
