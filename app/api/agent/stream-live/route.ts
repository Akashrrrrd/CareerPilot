/**
 * WINNING FEATURE #1: Live Streaming API
 * 
 * Server-Sent Events (SSE) endpoint for real-time agent updates
 * Judges will see the agent working LIVE!
 */

import { NextRequest } from 'next/server'
import { LiveStreamingAgent, StreamEvent } from '@/lib/agent/live-streaming-agent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const { jobUrl, jobTitle, company, userProfile } = await request.json()

  // Create a readable stream for SSE
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const agent = new LiveStreamingAgent()

      // Set up the stream callback
      agent.setStreamCallback((event: StreamEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(data))
      })

      try {
        // Start the agent
        await agent.processApplicationLive(jobUrl, jobTitle, company, userProfile)

        // Send completion event
        const completeEvent: StreamEvent = {
          type: 'success',
          timestamp: Date.now(),
          message: 'Application process completed',
        }
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeEvent)}\n\n`))
      } catch (error) {
        // Send error event
        const errorEvent: StreamEvent = {
          type: 'error',
          timestamp: Date.now(),
          message: error instanceof Error ? error.message : 'Unknown error',
          data: { error },
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
