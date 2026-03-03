'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        setIsLoading(false)
        return
      }

      // Store user session
      localStorage.setItem('user', JSON.stringify(data.user))
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.name}!`,
      })

      router.push('/dashboard')
    } catch (err) {
      setError('Login failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Welcome Back"
      description="Sign in to your CareerPilot account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>

        <div className="text-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="link" className="text-xs text-muted-foreground h-auto p-0">
                Terms & Conditions
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Terms & Conditions</DialogTitle>
                <DialogDescription>
                  Please read our terms and conditions carefully
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[60vh] pr-4">
                <div className="space-y-4 text-sm">
                  <section>
                    <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
                    <p className="text-muted-foreground">
                      By accessing and using CareerPilot AI, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2">2. Use License</h3>
                    <p className="text-muted-foreground">
                      Permission is granted to temporarily use CareerPilot AI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2">3. User Account</h3>
                    <p className="text-muted-foreground">
                      You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2">4. Privacy Policy</h3>
                    <p className="text-muted-foreground">
                      Your use of CareerPilot AI is also governed by our Privacy Policy. We collect and use your personal information to provide and improve our services. Your data is stored securely and will not be shared with third parties without your consent.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2">5. AI-Generated Content</h3>
                    <p className="text-muted-foreground">
                      CareerPilot AI uses artificial intelligence to provide job recommendations and career advice. While we strive for accuracy, AI-generated content should be used as guidance only and not as professional career counseling.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2">6. Job Applications</h3>
                    <p className="text-muted-foreground">
                      CareerPilot AI facilitates job applications but does not guarantee employment. We are not responsible for the hiring decisions of third-party employers.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2">7. Prohibited Uses</h3>
                    <p className="text-muted-foreground">
                      You may not use CareerPilot AI for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction when using our service.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2">8. Limitation of Liability</h3>
                    <p className="text-muted-foreground">
                      CareerPilot AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2">9. Changes to Terms</h3>
                    <p className="text-muted-foreground">
                      We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the platform.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-semibold mb-2">10. Contact Information</h3>
                    <p className="text-muted-foreground">
                      If you have any questions about these Terms & Conditions, please contact us at support@careerpilot.ai
                    </p>
                  </section>

                  <p className="text-muted-foreground italic mt-6">
                    Last updated: March 3, 2026
                  </p>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </form>
    </AuthLayout>
  )
}
