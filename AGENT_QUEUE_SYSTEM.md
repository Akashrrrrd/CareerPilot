# Agent Queue System

## Overview
The Agent Queue is CareerPilot's flagship feature that allows users to queue job applications and let the AI agent automatically apply to them using Gemini's multimodal capabilities.

## Features

### 1. Job Queue Management
- Add jobs to queue with URL, title, and company name
- View all queued, in-progress, completed, and failed jobs
- Delete jobs from queue
- Real-time status updates

### 2. Job Statuses
- **Queued**: Job is waiting to be processed
- **In Progress**: AI agent is currently applying
- **Completed**: Application submitted successfully
- **Failed**: Application failed with error message

### 3. AI-Powered Application
- Uses Gemini Vision to understand job application pages visually
- Automatically fills forms using user profile data
- Works on any job board (no API integration needed)
- Captures screenshots during the process
- Logs all actions taken

## Database Schema

### AgentJob Model
```typescript
{
  userId: string,           // User email
  url: string,             // Job application URL
  title: string,           // Job title
  company: string,         // Company name
  status: string,          // queued | in_progress | completed | failed
  createdAt: Date,         // Auto-generated
  startedAt: Date,         // When processing started
  completedAt: Date,       // When processing finished
  error: string,           // Error message if failed
  screenshots: string[],   // Screenshots captured during process
  actions: AgentAction[]   // Actions performed by agent
}
```

### AgentAction Schema
```typescript
{
  type: string,            // click | type | select | upload | wait | navigate | scroll | submit
  target: string,          // Element selector or description
  value: string,           // Value entered (for type/select actions)
  description: string,     // Human-readable description
  screenshot: string       // Screenshot URL
}
```

## API Endpoints

### GET `/api/agent/queue?userId={email}`
Fetch all agent jobs for a user
- Returns: `{ success: true, jobs: [], total: number }`

### POST `/api/agent/queue`
Add a new job to the queue
```json
{
  "userId": "user@example.com",
  "url": "https://linkedin.com/jobs/view/123",
  "title": "Senior React Developer",
  "company": "Tech Corp"
}
```

### PUT `/api/agent/queue`
Update job status and details
```json
{
  "jobId": "job_id",
  "status": "completed",
  "completedAt": "2026-03-03T10:00:00Z",
  "screenshots": ["url1", "url2"],
  "actions": [...]
}
```

### DELETE `/api/agent/queue?id={jobId}&userId={email}`
Remove a job from the queue

## How It Works

### 1. User Adds Job
- User clicks "Add Job to Queue"
- Enters job URL, title, and company
- Job is saved to MongoDB with status "queued"

### 2. User Starts Processing
- User clicks "Start" button on a queued job
- Status changes to "in_progress"
- System fetches user profile from MongoDB

### 3. AI Agent Processes Application
- Calls `/api/agent/apply` with job details and profile
- Gemini Vision analyzes the job application page
- Agent automatically fills forms and submits
- Captures screenshots and logs actions

### 4. Completion
- Status updates to "completed" or "failed"
- Screenshots and actions are saved
- User can view results

## Integration with Other Features

### Profile Data
- Agent uses data from user's profile (name, email, experience, education, skills)
- Automatically maps profile fields to application form fields

### Application Tracker
- Completed applications can be added to the Application Tracker
- Tracks application status and follow-ups

### Notifications
- User receives notifications when jobs are completed or failed
- Real-time updates on agent progress

## Technical Implementation

### Frontend (components/agent/agent-queue.tsx)
- Fetches jobs from API on component mount
- Displays jobs in cards with status badges
- Handles start, delete, and view actions
- Updates UI in real-time during processing

### Backend (app/api/agent/queue/route.ts)
- CRUD operations for agent jobs
- Stores all data in MongoDB
- Per-user data isolation

### AI Agent (app/api/agent/apply/route.ts)
- Uses Gemini multimodal to analyze pages
- Executes actions based on AI analysis
- Returns success/failure with details

## Future Enhancements
- Batch processing (process multiple jobs automatically)
- Scheduling (apply at specific times)
- Smart retry logic for failed applications
- Video recording of application process
- Application success rate analytics
- Resume/cover letter customization per job
- Browser automation with Puppeteer/Playwright
- Multi-step application support
- Login credential management

## Hackathon Highlights
This feature showcases:
- **Gemini Multimodal**: Visual understanding of web pages
- **Google Cloud**: Hosted on Cloud Run
- **MongoDB Atlas**: Scalable data storage
- **Real-time Updates**: Live status tracking
- **User-Centric Design**: Simple, intuitive interface
