/**
 * WINNING FEATURE #1: Gemini Vision Integration
 * 
 * This is our SECRET WEAPON - Advanced multimodal AI that SEES and UNDERSTANDS
 * any job application form without needing DOM access or APIs.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export interface UIElement {
  type: 'input' | 'textarea' | 'select' | 'button' | 'checkbox' | 'radio' | 'file' | 'link'
  label: string
  placeholder?: string
  required: boolean
  position: { x: number; y: number }
  fieldName?: string
  options?: string[]
}

export interface PageAnalysis {
  elements: UIElement[]
  pageType: 'job_listing' | 'application_form' | 'multi_step_form' | 'confirmation' | 'login' | 'unknown'
  currentStep?: number
  totalSteps?: number
  nextAction: string
  confidence: number
}

export class GeminiVisionAgent {
  private model: any

  constructor() {
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent, accurate analysis
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    })
  }

  /**
   * Analyze a screenshot and extract UI elements
   * This is the CORE of our UI Navigator capability
   */
  async analyzeScreenshot(screenshotPath: string): Promise<PageAnalysis> {
    try {
      const imageData = fs.readFileSync(screenshotPath)
      const base64Image = imageData.toString('base64')

      const prompt = `You are an expert UI analyzer for job application automation. Analyze this screenshot and provide a detailed JSON response.

CRITICAL INSTRUCTIONS:
1. Identify ALL form fields, buttons, and interactive elements
2. Determine the field purpose (name, email, phone, resume upload, etc.)
3. Detect if this is a job listing page or application form
4. Identify multi-step forms and current progress
5. Suggest the next action to take

Return ONLY valid JSON in this exact format:
{
  "elements": [
    {
      "type": "input|textarea|select|button|checkbox|radio|file|link",
      "label": "Field label or button text",
      "placeholder": "Placeholder text if visible",
      "required": true|false,
      "position": {"x": 0, "y": 0},
      "fieldName": "firstName|lastName|email|phone|resume|coverLetter|linkedin|portfolio|experience|education|custom",
      "options": ["option1", "option2"] // for select/radio only
    }
  ],
  "pageType": "job_listing|application_form|multi_step_form|confirmation|login|unknown",
  "currentStep": 1,
  "totalSteps": 3,
  "nextAction": "Describe what action to take next",
  "confidence": 0.95
}

Focus on:
- "Apply" or "Easy Apply" buttons
- Form fields for personal info (name, email, phone)
- Resume/CV upload buttons
- Cover letter fields
- LinkedIn profile URLs
- Work experience sections
- Education fields
- Skills or certifications
- "Next" or "Submit" buttons
- Progress indicators

Be precise and thorough. This analysis will drive automated form filling.`

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image
          }
        }
      ])

      const response = await result.response
      const text = response.text()
      
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text
      
      const analysis: PageAnalysis = JSON.parse(jsonText)
      
      console.log('🔍 Gemini Vision Analysis:', {
        pageType: analysis.pageType,
        elementsFound: analysis.elements.length,
        confidence: analysis.confidence,
        nextAction: analysis.nextAction
      })

      return analysis
    } catch (error) {
      console.error('❌ Gemini Vision Error:', error)
      throw new Error(`Failed to analyze screenshot: ${error}`)
    }
  }

  /**
   * Intelligent field mapping - matches form fields to user profile data
   */
  async mapFieldToProfileData(
    fieldLabel: string, 
    fieldType: string, 
    userProfile: any
  ): Promise<string | null> {
    const prompt = `Given a form field and user profile, determine what data to fill in.

Field Label: "${fieldLabel}"
Field Type: ${fieldType}

User Profile:
${JSON.stringify(userProfile, null, 2)}

Return ONLY the exact value to fill in this field, or "null" if no matching data exists.
For dates, use format: MM/DD/YYYY
For phone, use format: (XXX) XXX-XXXX
Be precise and match the field's expected format.`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const value = response.text().trim()
      
      return value === 'null' ? null : value
    } catch (error) {
      console.error('Field mapping error:', error)
      return null
    }
  }

  /**
   * Answer screening questions intelligently
   */
  async answerScreeningQuestion(
    question: string,
    userProfile: any,
    jobDescription?: string
  ): Promise<string> {
    const prompt = `You are helping a job applicant answer a screening question.

Question: "${question}"

User Profile:
${JSON.stringify(userProfile, null, 2)}

${jobDescription ? `Job Description:\n${jobDescription}` : ''}

Provide a concise, professional answer that:
1. Is truthful based on the user's profile
2. Highlights relevant experience
3. Is 2-3 sentences maximum
4. Uses professional tone
5. Increases chances of getting an interview

Answer:`

    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      return response.text().trim()
    } catch (error) {
      console.error('Screening question error:', error)
      return 'I am very interested in this position and believe my experience aligns well with the requirements.'
    }
  }

  /**
   * Verify successful application submission
   */
  async verifySubmission(screenshotPath: string): Promise<{
    success: boolean
    confirmationNumber?: string
    message: string
  }> {
    try {
      const imageData = fs.readFileSync(screenshotPath)
      const base64Image = imageData.toString('base64')

      const prompt = `Analyze this screenshot to determine if a job application was successfully submitted.

Look for:
- "Application submitted" or "Thank you" messages
- Confirmation numbers or reference IDs
- Success indicators (checkmarks, green banners)
- "We'll be in touch" messages
- Email confirmation mentions

Return ONLY valid JSON:
{
  "success": true|false,
  "confirmationNumber": "ABC123" or null,
  "message": "Brief description of what you see"
}`

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image
          }
        }
      ])

      const response = await result.response
      const text = response.text()
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text
      
      return JSON.parse(jsonText)
    } catch (error) {
      console.error('Verification error:', error)
      return {
        success: false,
        message: 'Could not verify submission'
      }
    }
  }
}

export const geminiAgent = new GeminiVisionAgent()
