'use client'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and title */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Form content */}
        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground">
          © 2026 CareerPilot AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
