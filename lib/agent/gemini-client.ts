import { GoogleGenerativeAI } from '@google/generative-ai'

// Lazy initialization - only check API key when actually used
let genAI: GoogleGenerativeAI | null = null

function getGenAI() {
  if (!genAI) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not set in environment variables')
    }
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  }
  return genAI
}

export const geminiModel = {
  generateContent: (...args: any[]) => getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' }).generateContent(...args),
  generateContentStream: (...args: any[]) => getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' }).generateContentStream(...args),
}

export const geminiVisionModel = {
  generateContent: (...args: any[]) => getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' }).generateContent(...args),
  generateContentStream: (...args: any[]) => getGenAI().getGenerativeModel({ model: 'gemini-2.0-flash-exp' }).generateContentStream(...args),
}

export { getGenAI as genAI }

