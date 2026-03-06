/**
 * Gemini AI Client
 * 
 * Supports both:
 * 1. API Key (for development/demo) - Get from https://aistudio.google.com/apikey
 * 2. Vertex AI (for production on Google Cloud)
 * 
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai'

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const USE_VERTEX_AI = process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true'

// Lazy initialization
let genAI: GoogleGenAI | null = null

/**
 * Get or initialize the GoogleGenAI client
 */
function getGenAI(): GoogleGenAI {
  if (!genAI) {
    if (USE_VERTEX_AI) {
      // Production: Use Vertex AI on Google Cloud
      if (!GOOGLE_CLOUD_PROJECT) {
        throw new Error('GOOGLE_CLOUD_PROJECT is required when using Vertex AI')
      }
      
      console.log('🔵 Using Vertex AI:', GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION)
      
      genAI = new GoogleGenAI({
        vertexai: true,
        project: GOOGLE_CLOUD_PROJECT,
        location: GOOGLE_CLOUD_LOCATION,
      })
    } else {
      // Development: Use API Key
      if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is required. Get one from https://aistudio.google.com/apikey')
      }
      
      console.log('🟢 Using Gemini API Key')
      
      genAI = new GoogleGenAI({
        vertexai: false,
        apiKey: GEMINI_API_KEY,
      })
    }
  }
  
  return genAI
}

/**
 * Gemini 2.5 Flash model for text generation
 */
export const geminiModel = {
  generateContent: async (prompt: string | any) => {
    const ai = getGenAI()
    return await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
  },
  
  generateContentStream: async (prompt: string | any) => {
    const ai = getGenAI()
    return await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
  },
}

/**
 * Gemini 2.5 Flash model for vision (multimodal)
 */
export const geminiVisionModel = {
  generateContent: async (prompt: string | any) => {
    const ai = getGenAI()
    return await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
  },
  
  generateContentStream: async (prompt: string | any) => {
    const ai = getGenAI()
    return await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })
  },
}

/**
 * Export the client for direct access if needed
 */
export { getGenAI as genAI }

