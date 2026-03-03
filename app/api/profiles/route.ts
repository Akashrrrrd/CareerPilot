import { NextRequest, NextResponse } from 'next/server'
import { mockProfiles, mockExperience, mockEducation, mockSkills } from '@/lib/mock-data'
import type { ApiResponse, Profile } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    const profileId = request.nextUrl.searchParams.get('id')

    if (profileId) {
      const profile = mockProfiles.find(p => p.id === profileId)

      if (!profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      }

      const experience = mockExperience.filter(e => e.profileId === profileId)
      const education = mockEducation.filter(e => e.profileId === profileId)
      const skills = mockSkills.filter(s => s.profileId === profileId)

      const profileWithDetails = {
        ...profile,
        experiences: experience,
        educations: education,
        skills: skills,
      }

      const response: ApiResponse<typeof profileWithDetails> = { data: profileWithDetails }
      return NextResponse.json(response)
    }

    if (userId) {
      const profiles = mockProfiles.filter(p => p.userId === userId)
      const response: ApiResponse<typeof profiles> = { data: profiles }
      return NextResponse.json(response)
    }

    return NextResponse.json({ error: 'User ID or Profile ID required' }, { status: 400 })
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, firstName, lastName, email, phone, location, headline, summary } = await request.json()

    if (!userId || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'User ID, first name, and last name required' },
        { status: 400 }
      )
    }

    const newProfile: Profile = {
      id: Date.now().toString(),
      userId,
      firstName,
      lastName,
      email,
      phone,
      location,
      headline,
      summary,
      createdAt: new Date(),
    }

    const response: ApiResponse<Profile> = {
      data: newProfile,
      message: 'Profile created successfully',
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating profile:', error)
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, firstName, lastName, email, phone, location, headline, summary } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID required' },
        { status: 400 }
      )
    }

    const profileIndex = mockProfiles.findIndex(p => p.id === id)
    if (profileIndex === -1) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const updatedProfile: Profile = {
      ...mockProfiles[profileIndex],
      firstName: firstName || mockProfiles[profileIndex].firstName,
      lastName: lastName || mockProfiles[profileIndex].lastName,
      email: email || mockProfiles[profileIndex].email,
      phone: phone !== undefined ? phone : mockProfiles[profileIndex].phone,
      location: location !== undefined ? location : mockProfiles[profileIndex].location,
      headline: headline !== undefined ? headline : mockProfiles[profileIndex].headline,
      summary: summary !== undefined ? summary : mockProfiles[profileIndex].summary,
    }

    const response: ApiResponse<Profile> = {
      data: updatedProfile,
      message: 'Profile updated successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Profile ID required' },
        { status: 400 }
      )
    }

    const profileExists = mockProfiles.find(p => p.id === id)
    if (!profileExists) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const response: ApiResponse<{ success: boolean }> = {
      data: { success: true },
      message: 'Profile deleted successfully',
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
  }
}
