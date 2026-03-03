import { NextRequest, NextResponse } from 'next/server'
import { mockUsers } from '@/lib/mock-data'
import type { ApiResponse, User } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('id')

    if (userId) {
      const user = mockUsers.find(u => u.id === userId)

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      const response: ApiResponse<User> = { data: user }
      return NextResponse.json(response)
    }

    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name required' },
        { status: 400 }
      )
    }

    // Check if user exists in mock data
    const existingUser = mockUsers.find(u => u.email === email)

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    // Create new mock user
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date(),
    }

    const response: ApiResponse<User> = {
      data: newUser,
      message: 'User created successfully',
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
