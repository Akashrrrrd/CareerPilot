'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageBubble } from './message-bubble'
import { Loader2, Send, Zap, Lightbulb, BookOpen, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const suggestedActions = [
  {
    icon: Zap,
    title: 'Quick Tips',
    description: 'Give me interview preparation tips',
  },
  {
    icon: Lightbulb,
    title: 'Job Advice',
    description: 'Give me personalized job search advice',
  },
  {
    icon: BookOpen,
    title: 'Profile Review',
    description: 'Review my job application profile and suggest improvements',
  },
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const [geminiApiKey, setGeminiApiKey] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Load user data and fetch chat history
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      const userEmail = user.email || user.id
      setUserId(userEmail)
      fetchChatHistory(userEmail)
    }
  }, [])

  const fetchChatHistory = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/chat?userId=${encodeURIComponent(userEmail)}`)
      const data = await response.json()

      if (response.ok && data.messages) {
        setMessages(data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })))
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error)
      toast.error('Failed to load chat history')
    }
  }

  const fetchUserSettings = async () => {
    try {
      const storedUser = localStorage.getItem('user')
      if (!storedUser) return ''

      const user = JSON.parse(storedUser)
      const response = await fetch(`/api/user/settings?userId=${encodeURIComponent(user.email || user.id)}`)
      const data = await response.json()

      console.log('[Chat] User settings response:', data)

      if (response.ok && data.geminiApiKey) {
        return data.geminiApiKey
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error)
    }
    return ''
  }

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || !userId) return

    // Add user message immediately
    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get user's Gemini API key from settings
      const apiKey = await fetchUserSettings()

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          message: messageText,
          geminiApiKey: apiKey,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Add AI response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message.content,
        timestamp: new Date(data.message.timestamp),
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message')
      // Remove the user message if failed
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearHistory = async () => {
    if (!userId) return

    try {
      const response = await fetch(`/api/chat?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to clear chat history')
      }

      setMessages([])
      toast.success('Chat history cleared')
      
      // Fetch fresh history (will create new welcome message)
      await fetchChatHistory(userId)
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear chat history')
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Chat Area */}
      <div className="md:col-span-2">
        <Card className="bg-card h-[600px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>AI Assistant</CardTitle>
              <CardDescription>Chat with your job search assistant powered by Gemini</CardDescription>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear chat history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your chat messages. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory}>Clear History</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1 space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={index}
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                    />
                  ))}
                  {isLoading && (
                    <div className="flex gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">AI is thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border pt-4 space-y-3">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSendMessage()
                    }
                  }}
                  placeholder="Ask me anything about your job search..."
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suggested Actions */}
      <div className="space-y-4">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.title}
                  onClick={() => handleSendMessage(action.description)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{action.title}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-base">Chat Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Messages</span>
              <span className="font-medium">{messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium">Gemini 1.5 Flash</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
