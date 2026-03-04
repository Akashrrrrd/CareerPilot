import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Chat from '@/lib/models/Chat'
import { GoogleGenerativeAI } from '@google/generative-ai'

// GET chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    let chat = await Chat.findOne({ userId })

    // Create new chat if doesn't exist
    if (!chat) {
      chat = await Chat.create({
        userId,
        messages: [
          {
            role: 'assistant',
            content: "Hello! I'm your CareerPilot AI assistant. I'm here to help you with your job search, profile building, and application strategies. How can I assist you today?",
            timestamp: new Date(),
          },
        ],
      })
    }

    return NextResponse.json({ messages: chat.messages }, { status: 200 })
  } catch (error: any) {
    console.error('[Chat API GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    )
  }
}

// POST new message
export async function POST(request: NextRequest) {
  try {
    const { userId, message, geminiApiKey } = await request.json()

    console.log('[Chat API] Received request:', { userId, message, hasApiKey: !!geminiApiKey })

    if (!userId || !message) {
      return NextResponse.json(
        { error: 'User ID and message are required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get or create chat
    let chat = await Chat.findOne({ userId })
    if (!chat) {
      chat = await Chat.create({
        userId,
        messages: [],
      })
    }

    // Add user message
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    }
    chat.messages.push(userMessage)

    // Get AI response using Gemini
    let aiResponse = ''

    try {
      // Use user's API key if provided, otherwise use environment variable
      const apiKey = geminiApiKey || process.env.GEMINI_API_KEY

      console.log('[Chat API] Using API key:', apiKey ? 'Yes (length: ' + apiKey.length + ')' : 'No')

      if (!apiKey) {
        aiResponse = "I'm sorry, but no Gemini API key is configured. Please add your API key in Settings to enable AI chat functionality."
      } else {
        // Initialize the Google Generative AI client
        // gemini-pro: stable model for v1beta API
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        // Build conversation context (last 10 messages, excluding the one just added)
        const contextMessages = chat.messages.slice(-11, -1)
        const conversationContext = contextMessages
          .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n')

        const prompt = conversationContext
          ? `You are a helpful career assistant for CareerPilot. Help users with job search, resume building, interview preparation, and career advice.\n\nPrevious conversation:\n${conversationContext}\n\nUser: ${message}\n\nAssistant:`
          : `You are a helpful career assistant for CareerPilot. Help users with job search, resume building, interview preparation, and career advice.\n\nUser: ${message}\n\nAssistant:`

        console.log('[Chat API] Sending to Gemini with model: gemini-pro')

        const result = await model.generateContent(prompt)
        const response = result.response

        aiResponse = response.text()?.trim() || 'No response from AI'
        console.log('[Chat API] Gemini response received:', aiResponse.substring(0, 100))
      }
    } catch (error: any) {
      console.error('[Chat API] Gemini error:', error)
      console.error('[Chat API] Error details:', error.message)

      // User-friendly error messages based on error type
      if (error.message?.includes('404')) {
        aiResponse = "AI model not found. Please contact support."
      } else if (error.message?.includes('403') || error.message?.includes('API_KEY')) {
        aiResponse = "Invalid API key. Please check your Gemini API key in Settings."
      } else if (error.message?.includes('429')) {
        aiResponse = "Rate limit reached. You have sent too many messages. Please wait a minute and try again."
      } else {
        aiResponse = "I'm having trouble connecting to the AI service. Please check your API key in Settings or try again later."
      }
    }

    // Add AI response
    const assistantMessage = {
      role: 'assistant' as const,
      content: aiResponse,
      timestamp: new Date(),
    }
    chat.messages.push(assistantMessage)

    // Save to database
    await chat.save()

    return NextResponse.json(
      {
        message: assistantMessage,
        success: true,
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[Chat API POST] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send message', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE chat history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    await connectDB()

    await Chat.deleteOne({ userId })

    return NextResponse.json(
      { message: 'Chat history cleared successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[Chat API DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to clear chat history' },
      { status: 500 }
    )
  }
}