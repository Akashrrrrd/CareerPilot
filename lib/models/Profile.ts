import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId
  profileName: string
  headline: string
  summary: string
  experience: Array<{
    title: string
    company: string
    startDate: Date
    endDate?: Date
    current: boolean
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    startDate: Date
    endDate?: Date
    current: boolean
    description: string
  }>
  skills: string[]
  createdAt: Date
  updatedAt: Date
}

const ProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    experience: [
      {
        title: String,
        company: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],
    skills: [String],
  },
  {
    timestamps: true,
  }
)

const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema)

export default Profile
