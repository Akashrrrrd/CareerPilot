import { geminiVisionModel } from './gemini-client'
import type { PageAnalysis, UIElement, FormField } from './types'
import sharp from 'sharp'

export class VisionAnalyzer {
  /**
   * Analyze a screenshot using Gemini Vision to understand UI elements
   */
  async analyzeScreenshot(screenshotBuffer: Buffer): Promise<PageAnalysis> {
    try {
      // Optimize image for API
      const optimizedImage = await sharp(screenshotBuffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()

      const base64Image = optimizedImage.toString('base64')

      const prompt = `You are a UI analysis expert. Analyze this screenshot of a web page and provide a detailed JSON response.

Identify:
1. Page type (job_listing, application_form, login, multi_step, confirmation, unknown)
2. All interactive elements (buttons, inputs, selects, textareas, checkboxes, file uploads)
3. Form fields with their labels, types, and whether they're required
4. Next steps the user should take
5. Whether authentication is required

For each form field, try to map it to common profile data fields like:
- firstName, lastName, email, phone, location
- headline, summary, resumeUrl, coverLetterUrl
- linkedinUrl, portfolioUrl

Return ONLY valid JSON in this exact format:
{
  "pageType": "application_form",
  "title": "Page title",
  "description": "Brief description of what this page is for",
  "requiresAuth": false,
  "elements": [
    {
      "type": "input",
      "label": "Full Name",
      "placeholder": "Enter your name",
      "required": true,
      "position": { "x": 0, "y": 0, "width": 0, "height": 0 }
    }
  ],
  "formFields": [
    {
      "name": "fullName",
      "type": "text",
      "label": "Full Name",
      "required": true,
      "mappedTo": "firstName"
    }
  ],
  "nextSteps": ["Fill out the form", "Click Submit button"]
}`

      const result = await geminiVisionModel.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        { text: prompt },
      ])

      const response = result.response
      const text = response.text()

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Gemini response')
      }

      const jsonText = jsonMatch[1] || jsonMatch[0]
      const analysis: PageAnalysis = JSON.parse(jsonText)

      return analysis
    } catch (error) {
      console.error('Vision analysis error:', error)
      throw new Error(`Failed to analyze screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Analyze a specific UI element in detail
   */
  async analyzeElement(screenshotBuffer: Buffer, elementDescription: string): Promise<string> {
    try {
      const optimizedImage = await sharp(screenshotBuffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()

      const base64Image = optimizedImage.toString('base64')

      const prompt = `Focus on this specific element: "${elementDescription}"

Describe:
1. What type of element it is
2. Its current state (enabled/disabled, checked/unchecked, etc.)
3. What action should be taken with it
4. Any validation requirements

Be concise and specific.`

      const result = await geminiVisionModel.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        { text: prompt },
      ])

      return result.response.text()
    } catch (error) {
      console.error('Element analysis error:', error)
      throw new Error(`Failed to analyze element: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Verify if an action was successful by comparing before/after screenshots
   */
  async verifyAction(
    beforeBuffer: Buffer,
    afterBuffer: Buffer,
    expectedOutcome: string
  ): Promise<{ success: boolean; description: string }> {
    try {
      const beforeImage = await sharp(beforeBuffer).resize(960, 540).jpeg({ quality: 80 }).toBuffer()
      const afterImage = await sharp(afterBuffer).resize(960, 540).jpeg({ quality: 80 }).toBuffer()

      const base64Before = beforeImage.toString('base64')
      const base64After = afterImage.toString('base64')

      const prompt = `Compare these two screenshots (before and after an action).

Expected outcome: "${expectedOutcome}"

Did the action succeed? Respond with JSON:
{
  "success": true/false,
  "description": "What changed or why it failed"
}`

      const result = await geminiVisionModel.generateContent([
        { text: 'BEFORE:' },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Before,
          },
        },
        { text: 'AFTER:' },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64After,
          },
        },
        { text: prompt },
      ])

      const text = result.response.text()
      const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        return { success: false, description: 'Could not parse verification response' }
      }

      const jsonText = jsonMatch[1] || jsonMatch[0]
      return JSON.parse(jsonText)
    } catch (error) {
      console.error('Action verification error:', error)
      return { success: false, description: 'Verification failed' }
    }
  }

  /**
   * Detect if page requires CAPTCHA or other human verification
   */
  async detectCaptcha(screenshotBuffer: Buffer): Promise<boolean> {
    try {
      const optimizedImage = await sharp(screenshotBuffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()

      const base64Image = optimizedImage.toString('base64')

      const prompt = `Does this page contain a CAPTCHA, reCAPTCHA, or any human verification challenge?
      
Respond with only: YES or NO`

      const result = await geminiVisionModel.generateContent([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        { text: prompt },
      ])

      const response = result.response.text().trim().toUpperCase()
      return response.includes('YES')
    } catch (error) {
      console.error('CAPTCHA detection error:', error)
      return false
    }
  }
}

export const visionAnalyzer = new VisionAnalyzer()
