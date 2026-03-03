'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, CheckCircle2, XCircle, Eye, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface StreamEvent {
  type: 'status' | 'progress' | 'log' | 'screenshot' | 'complete' | 'error'
  step: string
  message: string
  progress?: number
  screenshot?: string
  confidence?: number
  data?: any
}

interface LiveAgentViewProps {
  jobUrl: string
  jobTitle: string
  company: string
  profile: any
  onComplete?: () => void
  onError?: (error: string) => void
}

export function LiveAgentView({
  jobUrl,
  jobTitle,
  company,
  profile,
  onComplete,
  onError,
}: LiveAgentViewProps) {
  const [status, setStatus] = useState('Initializing...')
  const [currentStep, setCurrentStep] = useState('initializing')
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [screenshots, setScreenshots] = useState<Array<{ data: string; description: string }>>([])
  const [isComplete, setIsComplete] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(true)
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const startStream = async () => {
      try {
        const response = await fetch('/api/agent/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobUrl,
            jobTitle,
            company,
            profile,
          }),
        })

        if (!response.body) {
          throw new Error('No response body')
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6)) as StreamEvent

              handleStreamEvent(data)
            }
          }
        }
      } catch (error) {
        console.error('Stream error:', error)
        setHasError(true)
        setStatus('Connection error')
        onError?.(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    startStream()
  }, [jobUrl, jobTitle, company, profile])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleStreamEvent = (event: StreamEvent) => {
    switch (event.type) {
      case 'status':
        setStatus(event.message)
        setCurrentStep(event.step)
        if (event.progress !== undefined) {
          setProgress(event.progress)
        }
        addLog(event.message)
        if (isSpeaking) {
          speak(event.message)
        }
        break

      case 'log':
        addLog(event.message)
        break

      case 'screenshot':
        if (event.screenshot) {
          setScreenshots((prev) => [
            ...prev,
            { data: event.screenshot!, description: event.message },
          ])
        }
        break

      case 'complete':
        setIsComplete(true)
        setProgress(100)
        setStatus(event.message)
        addLog(event.message)
        if (isSpeaking) {
          speak(event.message)
        }
        if (event.screenshot) {
          setScreenshots((prev) => [
            ...prev,
            { data: event.screenshot!, description: event.message },
          ])
        }
        onComplete?.()
        break

      case 'error':
        setHasError(true)
        setStatus(event.message)
        addLog(`ERROR: ${event.message}`)
        onError?.(event.message)
        break
    }
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.1
      utterance.pitch = 1.0
      utterance.volume = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking)
    if (!isSpeaking) {
      window.speechSynthesis.cancel()
    }
  }

  const getStepIcon = () => {
    if (hasError) return <XCircle className="h-6 w-6 text-destructive" />
    if (isComplete) return <CheckCircle2 className="h-6 w-6 text-green-500" />
    return <Loader2 className="h-6 w-6 animate-spin text-primary" />
  }

  const getStepColor = () => {
    if (hasError) return 'text-destructive'
    if (isComplete) return 'text-green-500'
    return 'text-primary'
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {getStepIcon()}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`text-lg font-semibold ${getStepColor()}`}>{status}</h3>
                <Badge variant="outline" className="capitalize">
                  {currentStep.replace('_', ' ')}
                </Badge>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">{Math.round(progress)}% complete</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={toggleSpeech}
            className="gap-2"
          >
            {isSpeaking ? (
              <>
                <Volume2 className="h-4 w-4" />
                Mute
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4" />
                Unmuted
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Logs */}
      <Card className="p-6">
        <h3 className="font-semibold text-foreground mb-4">Activity Log</h3>
        <ScrollArea className="h-64 w-full rounded-md border border-border p-4">
          <div className="space-y-1 font-mono text-xs">
            {logs.map((log, i) => (
              <div
                key={i}
                className={`${
                  log.includes('ERROR')
                    ? 'text-destructive'
                    : log.includes('SUCCESS') || log.includes('Done')
                    ? 'text-green-500'
                    : 'text-muted-foreground'
                }`}
              >
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </ScrollArea>
      </Card>

      {/* Screenshots */}
      {screenshots.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Visual Progress</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {screenshots.map((screenshot, i) => (
              <div key={i} className="space-y-2">
                <p className="text-sm text-muted-foreground">{screenshot.description}</p>
                <div className="relative aspect-video rounded-lg border border-border overflow-hidden bg-muted">
                  <Image
                    src={`data:image/jpeg;base64,${screenshot.data}`}
                    alt={screenshot.description}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
