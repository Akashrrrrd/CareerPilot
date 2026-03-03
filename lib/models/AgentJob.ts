import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAgentAction {
  type: 'click' | 'type' | 'select' | 'upload' | 'wait' | 'navigate' | 'scroll' | 'submit'
  target?: string
  value?: string
  description: string
  screenshot?: string
}

export interface IAgentJob extends Document {
  userId: string
  url: string
  title: string
  company: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  error?: string
  screenshots: string[]
  actions: IAgentAction[]
}

const AgentActionSchema = new Schema({
  type: {
    type: String,
    enum: ['click', 'type', 'select', 'upload', 'wait', 'navigate', 'scroll', 'submit'],
    required: true,
  },
  target: String,
  value: String,
  description: {
    type: String,
    required: true,
  },
  screenshot: String,
})

const AgentJobSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'in_progress', 'completed', 'failed'],
      default: 'queued',
      index: true,
    },
    startedAt: Date,
    completedAt: Date,
    error: String,
    screenshots: [String],
    actions: [AgentActionSchema],
    instructions: String,
    strategy: Schema.Types.Mixed,
    applicationData: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
)

// Index for efficient queries
AgentJobSchema.index({ userId: 1, createdAt: -1 })
AgentJobSchema.index({ userId: 1, status: 1 })

const AgentJob: Model<IAgentJob> =
  mongoose.models.AgentJob || mongoose.model<IAgentJob>('AgentJob', AgentJobSchema)

export default AgentJob
