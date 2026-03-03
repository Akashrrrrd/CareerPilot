import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProfile extends Document {
  userId: string
  profileName: string
  headline: string
  summary: string
  experience: Array<{
    id: string
    title: string
    company: string
    startDate: string
    endDate?: string
    isCurrent: boolean
    description: string
  }>
  education: Array<{
    id: string
    school: string
    degree: string
    field: string
    gradDate: string
    description?: string
  }>
  skills: string[]
  createdAt: Date
  updatedAt: Date
}

const ProfileSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    profileName: {
      type: String,
      default: '',
    },
    headline: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    experience: {
      type: [
        {
          id: String,
          title: String,
          company: String,
          startDate: String,
          endDate: String,
          isCurrent: Boolean,
          description: String,
        },
      ],
      default: [],
    },
    education: {
      type: [
        {
          id: String,
          school: String,
          degree: String,
          field: String,
          gradDate: String,
          description: String,
        },
      ],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Create index for userId but allow it to be created if it doesn't exist
ProfileSchema.index({ userId: 1 }, { unique: true, sparse: true })

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema)

export default Profile
