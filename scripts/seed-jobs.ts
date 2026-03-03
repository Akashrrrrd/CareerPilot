// Run this script to seed initial job data
// Usage: npx ts-node scripts/seed-jobs.ts

import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-uri'

const jobsData = [
  {
    title: 'Senior React Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    salary: '$150k - $200k',
    description: 'Looking for an experienced React developer to lead our frontend team and build scalable web applications. You will work with modern technologies including Next.js, TypeScript, and Tailwind CSS.',
    jobType: 'Full-time',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'Team leadership'],
    benefits: ['Health insurance', '401k matching', 'Remote work options'],
    isActive: true,
  },
  {
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    salary: '$120k - $160k',
    description: 'Join our fast-growing startup as a full-stack engineer. Work on cutting-edge technologies and modern web architectures. Build features from database to UI.',
    jobType: 'Full-time',
    requirements: ['Node.js and React', 'MongoDB or PostgreSQL', '3+ years experience'],
    benefits: ['Equity options', 'Flexible hours', 'Learning budget'],
    isActive: true,
  },
  {
    title: 'Frontend Developer',
    company: 'Design Studio',
    location: 'New York, NY',
    salary: '$100k - $140k',
    description: 'Creative frontend role focusing on user experience and modern UI design patterns. Strong attention to detail required. Work closely with designers.',
    jobType: 'Full-time',
    requirements: ['HTML/CSS/JavaScript', 'React or Vue', 'Design sense'],
    benefits: ['Creative environment', 'Professional development', 'Gym membership'],
    isActive: true,
  },
  {
    title: 'JavaScript Engineer',
    company: 'WebDev Inc',
    location: 'Remote',
    salary: '$110k - $150k',
    description: 'Work with Node.js and React to build modern web applications. Help us shape the future of web technology. Contribute to open source projects.',
    jobType: 'Contract',
    requirements: ['Strong JavaScript skills', 'Node.js experience', 'API development'],
    benefits: ['Flexible contract', 'Remote first', 'Open source contributions'],
    isActive: true,
  },
  {
    title: 'Senior Software Engineer',
    company: 'Enterprise Co',
    location: 'Boston, MA',
    salary: '$180k - $220k',
    description: 'Lead a team of developers in building enterprise-scale solutions. Mentor junior developers and architect new systems. Drive technical decisions.',
    jobType: 'Full-time',
    requirements: ['8+ years experience', 'System architecture', 'Team leadership'],
    benefits: ['Comprehensive benefits', 'Stock options', 'Career growth'],
    isActive: true,
  },
  {
    title: 'Product Engineer',
    company: 'Tech Innovators',
    location: 'Austin, TX',
    salary: '$130k - $170k',
    description: 'Shape product development with your engineering expertise. Collaborate with product and design teams. Build features that delight users.',
    jobType: 'Full-time',
    requirements: ['Full-stack skills', 'Product mindset', 'User empathy'],
    benefits: ['Product ownership', 'Innovation time', 'Great culture'],
    isActive: true,
  },
  {
    title: 'Backend Developer',
    company: 'Cloud Systems',
    location: 'Seattle, WA',
    salary: '$140k - $180k',
    description: 'Build scalable backend systems and APIs. Work with microservices architecture and cloud infrastructure. Optimize performance and reliability.',
    jobType: 'Full-time',
    requirements: ['Node.js or Python', 'Database design', 'Cloud platforms'],
    benefits: ['Cloud certifications', 'Tech conferences', 'Work-life balance'],
    isActive: true,
  },
  {
    title: 'DevOps Engineer',
    company: 'Infrastructure Pro',
    location: 'Remote',
    salary: '$130k - $170k',
    description: 'Manage CI/CD pipelines and cloud infrastructure. Automate deployments and improve developer experience. Work with Kubernetes and Docker.',
    jobType: 'Full-time',
    requirements: ['CI/CD experience', 'Kubernetes', 'AWS or GCP'],
    benefits: ['Remote work', 'Latest tools', 'Learning opportunities'],
    isActive: true,
  },
]

async function seedJobs() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const JobSchema = new mongoose.Schema({
      title: String,
      company: String,
      location: String,
      salary: String,
      description: String,
      jobType: String,
      requirements: [String],
      benefits: [String],
      postedDate: { type: Date, default: Date.now },
      isActive: Boolean,
    }, { timestamps: true })

    const Job = mongoose.models.Job || mongoose.model('Job', JobSchema)

    // Clear existing jobs
    await Job.deleteMany({})
    console.log('Cleared existing jobs')

    // Insert new jobs
    await Job.insertMany(jobsData)
    console.log(`Seeded ${jobsData.length} jobs successfully!`)

    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  } catch (error) {
    console.error('Error seeding jobs:', error)
    process.exit(1)
  }
}

seedJobs()
