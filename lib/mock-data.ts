// Mock data for demonstration purposes
// Replace with real database calls when integrated

export const mockUsers = [
  {
    id: '1',
    email: 'demo@careerpilot.ai',
    name: 'Demo User',
    createdAt: new Date('2024-01-01'),
  },
]

export const mockProfiles = [
  {
    id: '1',
    userId: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    headline: 'Senior Full Stack Developer | React & Node.js Expert',
    summary: 'Experienced developer with 8+ years building scalable web applications.',
    createdAt: new Date('2024-01-01'),
  },
]

export const mockExperience = [
  {
    id: '1',
    profileId: '1',
    company: 'Tech Corp',
    position: 'Senior Developer',
    startDate: '2021-01-01',
    endDate: null,
    description: 'Leading frontend development team, mentoring junior developers.',
    isCurrentRole: true,
  },
  {
    id: '2',
    profileId: '1',
    company: 'StartupXYZ',
    position: 'Full Stack Engineer',
    startDate: '2019-06-01',
    endDate: '2020-12-31',
    description: 'Built and maintained full-stack web applications using React and Node.js.',
    isCurrentRole: false,
  },
]

export const mockEducation = [
  {
    id: '1',
    profileId: '1',
    school: 'University of California',
    degree: 'Bachelor of Science',
    field: 'Computer Science',
    graduationYear: 2018,
  },
]

export const mockSkills = [
  { id: '1', profileId: '1', name: 'React', endorsements: 45 },
  { id: '2', profileId: '1', name: 'Node.js', endorsements: 38 },
  { id: '3', profileId: '1', name: 'TypeScript', endorsements: 32 },
  { id: '4', profileId: '1', name: 'PostgreSQL', endorsements: 28 },
  { id: '5', profileId: '1', name: 'AWS', endorsements: 22 },
]

export const mockApplications = [
  {
    id: '1',
    userId: '1',
    jobId: '1',
    jobTitle: 'Senior React Developer',
    company: 'Tech Corp',
    status: 'applied',
    appliedDate: new Date('2024-02-28'),
    salary: '$150k - $200k',
    matchScore: 92,
  },
  {
    id: '2',
    userId: '1',
    jobId: '2',
    jobTitle: 'Full Stack Engineer',
    company: 'StartupXYZ',
    status: 'interviewing',
    appliedDate: new Date('2024-02-20'),
    salary: '$120k - $160k',
    matchScore: 88,
    interviewDate: new Date('2024-03-10'),
  },
  {
    id: '3',
    userId: '1',
    jobId: '3',
    jobTitle: 'Frontend Developer',
    company: 'Design Studio',
    status: 'applied',
    appliedDate: new Date('2024-02-15'),
    salary: '$100k - $140k',
    matchScore: 85,
  },
  {
    id: '4',
    userId: '1',
    jobId: '5',
    jobTitle: 'Senior Developer',
    company: 'Enterprise Co',
    status: 'rejected',
    appliedDate: new Date('2024-01-30'),
    salary: '$180k - $220k',
    matchScore: 72,
  },
  {
    id: '5',
    userId: '1',
    jobId: '6',
    jobTitle: 'Product Engineer',
    company: 'Tech Innovators',
    status: 'offered',
    appliedDate: new Date('2024-02-10'),
    salary: '$130k - $170k',
    matchScore: 81,
    offerDate: new Date('2024-03-01'),
  },
]

export const mockChatSessions = [
  {
    id: '1',
    userId: '1',
    title: 'Resume Review',
    createdAt: new Date('2024-02-25'),
  },
  {
    id: '2',
    userId: '1',
    title: 'Interview Prep',
    createdAt: new Date('2024-02-20'),
  },
]

export const mockChatMessages = [
  {
    id: '1',
    sessionId: '1',
    role: 'user',
    content: 'How can I improve my resume?',
    createdAt: new Date('2024-02-25T10:00:00'),
  },
  {
    id: '2',
    sessionId: '1',
    role: 'assistant',
    content: 'Your resume is strong! Here are some suggestions: 1) Add more quantifiable metrics, 2) Highlight your leadership experience, 3) Include relevant certifications.',
    createdAt: new Date('2024-02-25T10:01:00'),
  },
]
