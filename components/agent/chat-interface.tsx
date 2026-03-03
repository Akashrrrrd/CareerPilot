'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageBubble } from './message-bubble'
import { Loader2, Send, Zap, Lightbulb, BookOpen } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
}

const suggestedActions = [
  {
    icon: Zap,
    title: 'Quick Tips',
    description: 'Get interview preparation tips',
  },
  {
    icon: Lightbulb,
    title: 'Job Advice',
    description: 'Get personalized job search advice',
  },
  {
    icon: BookOpen,
    title: 'Profile Review',
    description: 'Review my job application profiles',
  },
]

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'agent',
      content: 'Hello! I\'m your CareerPilot AI assistant. I\'m here to help you with your job search, profile building, and application strategies. How can I assist you today?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate agent response
    await new Promise(resolve => setTimeout(resolve, 1500))

    const agentResponses = [
      'That\'s a great question! Based on your profile, I\'d recommend focusing on highlighting your leadership experience in your cover letters.',
      'I\'d suggest updating your profile summary to emphasize your recent achievements. This will help you match better with similar roles.',
      'Have you considered tailoring your resume for each application? I\'ve found that customized resumes get 3x more responses.',
      'Your match score with remote positions is quite high. Would you like me to show you more remote job opportunities?',
      'I recommend scheduling follow-ups 2 weeks after applying. Would you like me to set up reminders for your pending applications?',
    ]

    const agentMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'agent',
      content: agentResponses[Math.floor(Math.random() * agentResponses.length)],
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, agentMessage])
    setIsLoading(false)
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Chat Area */}
      <div className="md:col-span-2">
        <Card className="bg-card h-96 flex flex-col">
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>Chat with your job search assistant</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1 space-y-4 mb-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No messages yet. Start a conversation!
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
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
                  placeholder="Ask me anything..."
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
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors"
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
              <span className="text-muted-foreground">Session time</span>
              <span className="font-medium">2m 34s</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
