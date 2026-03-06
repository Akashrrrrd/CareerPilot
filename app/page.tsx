'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // For hackathon judges - redirect to demo
    // In production, this would check authentication
    const isDemoMode = process.env.NODE_ENV === 'development' || true
    
    if (isDemoMode) {
      router.push('/demo')
    } else {
      // Check if user is logged in (mock check)
      const user = localStorage.getItem('user')
      
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    }
    
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading CareerPilot AI...</p>
        </div>
      </div>
    )
  }

  return null
}
