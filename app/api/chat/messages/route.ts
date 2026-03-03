import { NextRequest, NextResponse } from 'next/server'
import { mockChatMessages } from '@/lib/mock-data'
import type { ApiResponse, ChatMessage } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      )
    }

    const messages = mockChatMessages
      .filter(m => m.sessionId === sessionId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    const response: ApiResponse<ChatMessage[]> = { data: messages }
    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, role, content } = await request.json()

    if (!sessionId || !role || !content) {
      return NextResponse.json(
        { error: 'Session ID, role, and content required' },
        { status: 400 }
      )
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sessionId,
      role: role as 'user' | 'assistant',
      content,
      createdAt: new Date(),
    }

    const response: ApiResponse<ChatMessage> = {
      data: newMessage,
      message: 'Message created successfully',
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 })
  }
}
