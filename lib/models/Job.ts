import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IJob extends Document {
  title: string
  company: string
  location: string
  salary?: string
  description: string
  jobType: string
  requirements?: string[]
  benefits?: string[]
  applicationUrl?: string
  postedDate: Date
  expiryDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      required: true,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      default: 'Full-time',
    },
    requirements: [String],
    benefits: [String],
    applicationUrl: String,
    postedDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Index for search performance
JobSchema.index({ title: 'text', company: 'text', description: 'text' })
JobSchema.index({ location: 1 })
JobSchema.index({ jobType: 1 })
JobSchema.index({ isActive: 1, postedDate: -1 })

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema)

export default Job
