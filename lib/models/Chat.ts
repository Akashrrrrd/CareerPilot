import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface IChat extends Document {
  userId: string
  messages: IMessage[]
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const ChatSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    messages: {
      type: [MessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

const Chat: Model<IChat> =
  mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema)

export default Chat
