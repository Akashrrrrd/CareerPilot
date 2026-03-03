import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IApplication extends Document {
  userId: string // User email address
  jobTitle: string
  company: string
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected'
  location: string
  salary?: string
  jobType: string
  appliedDate: Date
  followUpDate?: Date
  description?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Applied', 'Interviewing', 'Offer', 'Rejected'],
      default: 'Applied',
    },
    location: {
      type: String,
      required: true,
    },
    salary: String,
    jobType: {
      type: String,
      required: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    followUpDate: Date,
    description: String,
    notes: String,
  },
  {
    timestamps: true,
  }
)

const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)

export default Application
