import { NextRequest, NextResponse } from 'next/server'
import { screenshotCache } from '@/lib/agent/screenshot-cache'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing screenshot ID' }, { status: 400 })
  }

  const screenshotBase64 = screenshotCache.get(id)

  if (!screenshotBase64) {
    return NextResponse.json({ error: 'Screenshot not found or expired' }, { status: 404 })
  }

  // Return as data URL
  return NextResponse.json({
    url: `data:image/png;base64,${screenshotBase64}`,
  })
}
