import { NextRequest, NextResponse } from 'next/server'
import { mockChatSessions, mockChatMessages } from '@/lib/mock-data'
import type { ApiResponse, ChatSession } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const sessionId = request.nextUrl.searchParams.get('sessionId')

    if (sessionId) {
      const session = mockChatSessions.find(s => s.id === sessionId)

      if (!session) {
        return NextResponse.json({ error: 'Chat session not found' }, { status: 404 })
      }

      const messages = mockChatMessages.filter(m => m.sessionId === sessionId)

      const sessionWithMessages = {
        ...session,
        messages: messages,
      }

      const response: ApiResponse<typeof sessionWithMessages> = { data: sessionWithMessages }
      return NextResponse.json(response)
    }

    if (userId) {
      const sessions = mockChatSessions.filter(s => s.userId === userId)
      const sessionsWithMessages = sessions.map(session => {
        const lastMessage = mockChatMessages
          .filter(m => m.sessionId === session.id)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        return {
          ...session,
          lastMessage: lastMessage || null,
        }
      })

      const response: ApiResponse<typeof sessionsWithMessages> = { data: sessionsWithMessages }
      return NextResponse.json(response)
    }

    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching chat sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch chat sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title } = await request.json()

    if (!userId || !title) {
      return NextResponse.json(
        { error: 'User ID and title required' },
        { status: 400 }
      )
    }

    const newSession: ChatSession = {
      id: Date.now().toString(),
      userId,
      title,
      createdAt: new Date(),
    }

    const response: ApiResponse<ChatSession> = {
      data: newSession,
      message: 'Chat session created successfully',
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating chat session:', error)
    return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 })
  }
}
