'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthLayout } from '@/components/layout/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Validation
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields')
        setIsLoading(false)
        return
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match')
        setIsLoading(false)
        return
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters')
        setIsLoading(false)
        return
      }

      if (!agreedToTerms) {
        setError('You must agree to the terms and conditions')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Signup failed')
        setIsLoading(false)
        return
      }

      // Store user session
      localStorage.setItem('user', JSON.stringify(data.user))
      
      toast({
        title: "Account created successfully",
        description: `Welcome to CareerPilot, ${data.user.name}!`,
      })

      router.push('/dashboard')
    } catch (err) {
      setError('Signup failed. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout 
      title="Get Started"
      description="Create your CareerPilot account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            disabled={isLoading}
          />
          <label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I agree to the{' '}
            <Dialog>
              <DialogTrigger asChild>
                <button type="button" className="text-primary hover:underline">
                  Terms & Conditions
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                  <DialogTitle>Terms & Conditions 🚀</DialogTitle>
                  <DialogDescription>
                    The fun legal stuff (yes, we made T&Cs actually readable!)
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[60vh] pr-4">
                  <div className="space-y-4 text-sm">
                    <section>
                      <h3 className="font-semibold mb-2">1. Welcome to the Future! 🎉</h3>
                      <p className="text-muted-foreground">
                        By using CareerPilot AI, you're joining the coolest AI-powered job hunting revolution. We promise to help you land your dream job (but we can't promise you'll enjoy the interview process 😅).
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold mb-2">2. What You Get 🎁</h3>
                      <p className="text-muted-foreground">
                        Access to our Gemini-powered AI agent that actually understands your career goals. It's like having a career coach who never sleeps, never judges your 3 AM job applications, and definitely won't steal your lunch from the office fridge.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold mb-2">3. Your Data is Safe 🔒</h3>
                      <p className="text-muted-foreground">
                        We store your data on Google Cloud (because we're fancy like that). Your resume, applications, and career dreams are encrypted and protected. We won't sell your data to anyone - not even for a really good pizza.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold mb-2">4. The AI Disclaimer 🤖</h3>
                      <p className="text-muted-foreground">
                        Our AI is powered by Google's Gemini model and is pretty smart, but it's not a human career counselor (yet). If it suggests you become an astronaut when you're afraid of heights, use your judgment. We're working on making it smarter every day!
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold mb-2">5. The Hackathon Special 🏆</h3>
                      <p className="text-muted-foreground">
                        This project was built for the Gemini Live Agent Challenge with ❤️ and lots of coffee. We're using cutting-edge tech: Gemini multimodal AI, Google Cloud Run, MongoDB Atlas, and Next.js. Pretty cool, right?
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold mb-2">6. Be Cool, Don't Break Stuff 😎</h3>
                      <p className="text-muted-foreground">
                        Don't try to hack us, spam the system, or use CareerPilot for anything illegal. We're all about good vibes and helping people find jobs. Let's keep it that way!
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold mb-2">7. Job Applications 101 📝</h3>
                      <p className="text-muted-foreground">
                        We help you apply to jobs and track your applications, but we can't guarantee you'll get hired (we wish we could!). The final decision is up to the employers. But hey, we'll make you look good trying!
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold mb-2">8. No Guarantees (But We Try Hard!) 💪</h3>
                      <p className="text-muted-foreground">
                        We're not liable if things don't go as planned. Technology is amazing but not perfect. If our AI suggests a typo in your resume or the server has a bad day, we're sorry! We're constantly improving.
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold mb-2">9. We Might Update This 📱</h3>
                      <p className="text-muted-foreground">
                        As we add more cool features (and win this hackathon 🤞), we might update these terms. We'll let you know if anything major changes. No sneaky business, promise!
                      </p>
                    </section>

                    <section>
                      <h3 className="font-semibold mb-2">10. Questions? We're Here! 💬</h3>
                      <p className="text-muted-foreground">
                        Got questions, feedback, or just want to say hi? Reach out at support@careerpilot.ai. We actually read our emails (shocking, we know).
                      </p>
                    </section>

                    <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm font-semibold mb-2">🎯 Built for Gemini Live Agent Challenge</p>
                      <p className="text-xs text-muted-foreground">
                        This project showcases Gemini's multimodal capabilities, Google Cloud infrastructure, and the future of AI-powered career assistance. We're redefining how people interact with job search tools - making it smarter, faster, and way more fun!
                      </p>
                    </div>

                    <p className="text-muted-foreground italic mt-6 text-center">
                      Last updated: March 3, 2026 | Made with 💙 and lots of ☕
                    </p>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </label>
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
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
