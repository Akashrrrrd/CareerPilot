import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Profile from '@/lib/models/Profile'

// GET user profile
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    let profile = await Profile.findOne({ userId })

    // Create default profile if doesn't exist
    if (!profile) {
      profile = await Profile.create({
        userId,
        profileName: '',
        headline: '',
        summary: '',
        experience: [],
        education: [],
        skills: [],
      })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error: any) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// POST/PUT update profile
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()
    const { userId, ...profileData } = data

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const profile = await Profile.findOneAndUpdate(
      { userId },
      profileData,
      { new: true, upsert: true }
    )

    return NextResponse.json(
      { message: 'Profile updated successfully', profile },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
