import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/lib/models/User'

// GET user settings
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || searchParams.get('userId')

    console.log('GET /api/user/settings - Email:', email)

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email }).select('-password')

    if (!user) {
      console.error('User not found for email:', email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('User settings retrieved:', {
      name: user.name,
      phone: user.phone,
      geminiApiKey: user.geminiApiKey ? '***' : 'empty'
    })

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      notificationSettings: user.notificationSettings || {
        appUpdates: true,
        emailNotifs: true,
        agentActivity: true,
      },
      geminiApiKey: user.geminiApiKey || '',
    }, { status: 200 })
  } catch (error: any) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT update user settings
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()
    const { email, name, phone, notificationSettings, geminiApiKey } = data

    console.log('PUT /api/user/settings - Received data:', {
      email,
      name,
      phone,
      notificationSettings,
      geminiApiKey: geminiApiKey ? '***' : undefined
    })

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone
    if (notificationSettings !== undefined) updateData.notificationSettings = notificationSettings
    if (geminiApiKey !== undefined) updateData.geminiApiKey = geminiApiKey

    console.log('Update data to be saved:', {
      ...updateData,
      geminiApiKey: updateData.geminiApiKey ? '***' : undefined
    })

    const user = await User.findOneAndUpdate(
      { email },
      updateData,
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      console.error('User not found for email:', email)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('Settings updated successfully for user:', email)

    return NextResponse.json(
      { 
        message: 'Settings updated successfully',
        user: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          notificationSettings: user.notificationSettings,
          geminiApiKey: user.geminiApiKey,
        }
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
