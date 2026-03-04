/**
 * DEMO STREAMING API - For Judges
 * 
 * Shows the agent working with a real LinkedIn job posting
 * Uses pre-captured screenshot for clean demonstration
 */

import { NextRequest } from 'next/server'
import { DemoStreamingAgent, StreamEvent } from '@/lib/agent/demo-streaming-agent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { jobUrl, jobTitle, company, userProfile } = await request.json()

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const agent = new DemoStreamingAgent()

      agent.setStreamCallback((event: StreamEvent) => {
        try {
          const safeEvent = JSON.parse(JSON.stringify(event))
          const data = `data: ${JSON.stringify(safeEvent)}\n\n`
          controller.enqueue(encoder.encode(data))
        } catch (e) {
          console.error('Failed to send event:', e)
        }
      })

      try {
        await agent.processApplicationDemo(jobUrl, jobTitle, company, userProfile)

        const completeEvent: StreamEvent = {
          type: 'success',
          timestamp: Date.now(),
          message: 'Demo completed successfully!',
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeEvent)}\n\n`))
      } catch (error) {
        const errorEvent: StreamEvent = {
          type: 'error',
          timestamp: Date.now(),
          message: error instanceof Error ? error.message : 'Unknown error',
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
