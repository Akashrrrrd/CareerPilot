'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { ProfileForm } from '@/components/profile/profile-form'

export default function ProfilePage() {
  return (
    <MainLayout>
      <ProfileForm />
    </MainLayout>
  )
}
