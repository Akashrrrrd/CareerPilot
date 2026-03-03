import { NextRequest, NextResponse } from 'next/server'
import { VisionAnalyzer } from '@/lib/agent/vision-analyzer'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const screenshot = formData.get('screenshot') as File

    if (!screenshot) {
      return NextResponse.json({ error: 'Screenshot file required' }, { status: 400 })
    }

    // Convert file to buffer
    const arrayBuffer = await screenshot.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Analyze with Gemini Vision
    const analyzer = new VisionAnalyzer()
    const analysis = await analyzer.analyzeScreenshot(buffer)

    return NextResponse.json({
      success: true,
      analysis,
    })
  } catch (error) {
    console.error('Screenshot analysis error:', error)
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
