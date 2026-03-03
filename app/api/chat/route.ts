import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Chat from '@/lib/models/Chat'
import { GoogleGenAI } from '@google/genai'

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
        // Initialize the Google GenAI client
        const ai = new GoogleGenAI({ apiKey })

        // Build conversation context
        const conversationContext = chat.messages.slice(-10).map(msg => 
          `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n')

        const prompt = conversationContext 
          ? `You are a helpful career assistant. Previous conversation:\n${conversationContext}\n\nUser: ${message}\n\nAssistant:`
          : `You are a helpful career assistant. User: ${message}\n\nAssistant:`

        console.log('[Chat API] Sending to Gemini with model: gemini-1.5-flash-latest')

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash-latest',
          contents: prompt,
        })

        aiResponse = response.text || 'No response from AI'
        console.log('[Chat API] Gemini response received:', aiResponse.substring(0, 100))
      }
    } catch (error: any) {
      console.error('[Chat API] Gemini error:', error)
      console.error('[Chat API] Error details:', error.message, error.stack)
      aiResponse = "I apologize, but I'm having trouble connecting to the AI service. Please check your API key in Settings or try again later. Error: " + error.message
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
        success: true 
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
