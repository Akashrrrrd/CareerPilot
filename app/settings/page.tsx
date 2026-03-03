'use client'

import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Bell, Lock, User, Palette, Globe } from 'lucide-react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // User data
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  
  // Notification settings
  const [appUpdates, setAppUpdates] = useState(true)
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [agentActivity, setAgentActivity] = useState(true)
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  
  // API key
  const [geminiKey, setGeminiKey] = useState('')
  const [isSavingApiKey, setIsSavingApiKey] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Load user data from localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      const user = JSON.parse(userData)
      setEmail(user.email || '')
      
      // Fetch full settings from MongoDB
      fetchUserSettings(user.email)
    }
  }, [])

  const fetchUserSettings = async (email: string) => {
    try {
      console.log('Fetching settings for email:', email)
      const response = await fetch(`/api/user/settings?email=${encodeURIComponent(email)}`)
      console.log('Settings response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Settings data received:', {
          name: data.name,
          phone: data.phone,
          geminiApiKey: data.geminiApiKey ? '***' : 'empty'
        })
        
        setName(data.name || '')
        setPhone(data.phone || '')
        setAppUpdates(data.notificationSettings?.appUpdates ?? true)
        setEmailNotifs(data.notificationSettings?.emailNotifs ?? true)
        setAgentActivity(data.notificationSettings?.agentActivity ?? true)
        setGeminiKey(data.geminiApiKey || '')
        
        // Update localStorage with fresh data
        const userData = localStorage.getItem('user')
        if (userData) {
          const user = JSON.parse(userData)
          user.name = data.name
          user.phone = data.phone
          localStorage.setItem('user', JSON.stringify(user))
        }
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch settings:', errorData)
      }
    } catch (error) {
      console.error('Failed to fetch user settings:', error)
      toast.error('Failed to load settings')
    }
  }

  const handleSaveAccount = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) {
        toast.error('User not found')
        return
      }

      const user = JSON.parse(userData)
      
      console.log('Saving account settings:', { email: user.email, name, phone })
      
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name,
          phone,
        })
      })

      const data = await response.json()
      console.log('Save account response:', data)

      if (response.ok) {
        // Update localStorage
        user.name = name
        user.phone = phone
        localStorage.setItem('user', JSON.stringify(user))
        toast.success('Account settings updated successfully')
      } else {
        toast.error(data.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Save account error:', error)
      toast.error('Failed to update account settings')
    }
  }

  const handleSaveNotifications = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) {
        toast.error('User not found')
        return
      }

      const user = JSON.parse(userData)
      const settings = {
        appUpdates,
        emailNotifs,
        agentActivity
      }

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          notificationSettings: settings,
        })
      })

      if (response.ok) {
        toast.success('Notification preferences saved')
      } else {
        toast.error('Failed to save notification preferences')
      }
    } catch (error) {
      console.error('Save notifications error:', error)
      toast.error('Failed to save notification preferences')
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setIsChangingPassword(true)

    try {
      const userData = localStorage.getItem('user')
      if (!userData) {
        setPasswordError('User not found')
        setIsChangingPassword(false)
        return
      }

      const user = JSON.parse(userData)
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword,
          newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordError('')
      } else {
        setPasswordError(data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Password change error:', error)
      setPasswordError('Failed to change password. Please try again.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSaveApiKey = async () => {
    setIsSavingApiKey(true)
    try {
      if (!geminiKey) {
        toast.error('Please enter a valid API key')
        setIsSavingApiKey(false)
        return
      }

      const userData = localStorage.getItem('user')
      if (!userData) {
        toast.error('User not found')
        setIsSavingApiKey(false)
        return
      }

      const user = JSON.parse(userData)

      console.log('Saving API key for email:', user.email)

      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          geminiApiKey: geminiKey,
        })
      })

      const data = await response.json()
      console.log('Save API key response:', data)

      if (response.ok) {
        toast.success('API key saved successfully')
      } else {
        toast.error(data.error || 'Failed to save API key')
      }
    } catch (error) {
      console.error('Save API key error:', error)
      toast.error('Failed to save API key')
    } finally {
      setIsSavingApiKey(false)
    }
  }

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  if (!mounted) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        {/* Account Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Account Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <Button onClick={handleSaveAccount}>Save Account Settings</Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Application Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when your applications are processed
                </p>
              </div>
              <Switch 
                checked={appUpdates}
                onCheckedChange={(checked) => {
                  setAppUpdates(checked)
                  handleSaveNotifications()
                }}
                className="ml-4"
                style={{ minWidth: '32px', minHeight: '18px' }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your job applications
                </p>
              </div>
              <Switch 
                checked={emailNotifs}
                onCheckedChange={(checked) => {
                  setEmailNotifs(checked)
                  handleSaveNotifications()
                }}
                className="ml-4"
                style={{ minWidth: '32px', minHeight: '18px' }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Agent Activity</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when the AI agent completes tasks
                </p>
              </div>
              <Switch 
                checked={agentActivity}
                onCheckedChange={(checked) => {
                  setAgentActivity(checked)
                  handleSaveNotifications()
                }}
                className="ml-4"
                style={{ minWidth: '32px', minHeight: '18px' }}
              />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme across the application
                </p>
              </div>
              <Switch 
                checked={theme === 'dark'}
                onCheckedChange={handleThemeToggle}
                className="ml-4"
                style={{ minWidth: '32px', minHeight: '18px' }}
              />
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Privacy & Security</h2>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password" 
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? 'Changing Password...' : 'Change Password'}
            </Button>
            {passwordError && (
              <div className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 rounded-lg p-4 mt-2">
                <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="flex-1">{passwordError}</span>
              </div>
            )}
          </div>
        </Card>

        {/* API Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">API Configuration</h2>
          </div>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="gemini-key">Gemini API Key</Label>
              <Input 
                id="gemini-key" 
                type="password" 
                placeholder="AIza••••••••••••••••"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your Gemini API key for AI agent functionality
              </p>
            </div>
            <Button variant="outline" onClick={handleSaveApiKey} disabled={isSavingApiKey}>
              {isSavingApiKey ? 'Saving...' : 'Save API Key'}
            </Button>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
