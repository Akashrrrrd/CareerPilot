import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  phone?: string
  notificationSettings?: {
    appUpdates: boolean
    emailNotifs: boolean
    agentActivity: boolean
  }
  geminiApiKey?: string
  lastLoginAt?: Date
  loginCount: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      trim: true,
    },
    notificationSettings: {
      appUpdates: {
        type: Boolean,
        default: true,
      },
      emailNotifs: {
        type: Boolean,
        default: true,
      },
      agentActivity: {
        type: Boolean,
        default: true,
      },
    },
    geminiApiKey: {
      type: String,
      trim: true,
    },
    lastLoginAt: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Prevent model recompilation in development
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
