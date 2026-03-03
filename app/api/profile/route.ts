import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Profile from '@/lib/models/Profile'
import { notifyProfileUpdate } from '@/lib/notifications'

// GET user profile
export async function GET(request: NextRequest) {
  try {
    console.log('[Profile API GET] Starting...')
    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('[Profile API GET] userId:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('[Profile API GET] Finding profile for userId:', userId)
    let profile = await Profile.findOne({ userId })

    console.log('[Profile API GET] Profile found:', !!profile)

    // Create default profile if doesn't exist
    if (!profile) {
      console.log('[Profile API GET] Creating default profile')
      profile = await Profile.create({
        userId,
        profileName: '',
        headline: '',
        summary: '',
        experience: [],
        education: [],
        skills: [],
      })
      console.log('[Profile API GET] Default profile created')
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error: any) {
    console.error('[Profile API GET] Error:', error)
    console.error('[Profile API GET] Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to fetch profile', details: error.message },
      { status: 500 }
    )
  }
}

// POST/PUT update profile
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()
    console.log('[Profile API] Received data:', JSON.stringify(data, null, 2))
    
    const { userId, ...profileData } = data

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('[Profile API] Updating profile for userId:', userId)
    console.log('[Profile API] Profile data:', JSON.stringify(profileData, null, 2))

    const profile = await Profile.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    )

    console.log('[Profile API] Profile updated successfully')

    // Create notification for profile update
    try {
      await notifyProfileUpdate(userId)
      console.log('[Profile API] Notification created for profile update')
    } catch (notifError) {
      console.error('[Profile API] Failed to create notification:', notifError)
      // Don't fail the request if notification fails
    }

    return NextResponse.json(
      { message: 'Profile updated successfully', profile },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('[Profile API] Update profile error:', error)
    console.error('[Profile API] Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to update profile', details: error.message },
      { status: 500 }
    )
  }
}
