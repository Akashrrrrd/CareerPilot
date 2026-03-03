import { NextRequest } from 'next/server'
import { StreamingAgent } from '@/lib/agent/streaming-agent'
import type { ApplicationJob, ProfileData } from '@/lib/agent/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()

  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const body = await request.json()
        const { jobUrl, jobTitle, company, profile } = body

        if (!jobUrl || !jobTitle || !company || !profile) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                message: 'Missing required fields',
              })}\n\n`
            )
          )
          controller.close()
          return
        }

        // Create job object
        const job: ApplicationJob = {
          id: `job_${Date.now()}`,
          url: jobUrl,
          title: jobTitle,
          company: company,
          status: 'in_progress',
          profileId: profile.id || 'default',
          createdAt: new Date(),
          screenshots: [],
          actions: [],
        }

        // Create streaming agent
        const agent = new StreamingAgent()

        // Listen to agent events and stream them
        agent.on('update', (event) => {
          const data = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(data))
        })

        // Process application
        try {
          await agent.processApplicationWithStreaming(job, profile as ProfileData)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                step: 'error',
                message: errorMessage,
              })}\n\n`
            )
          )
        }

        // Close the stream
        controller.close()
      } catch (error) {
        console.error('Stream error:', error)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              message: 'Stream failed',
            })}\n\n`
          )
        )
        controller.close()
      }
    },
  })

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
