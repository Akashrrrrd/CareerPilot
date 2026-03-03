import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Application from '@/lib/models/Application'

// GET all applications for a user
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

    const applications = await Application.find({ userId }).sort({ createdAt: -1 })

    return NextResponse.json({ applications }, { status: 200 })
  } catch (error: any) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST create new application
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()
    const { userId, jobTitle, company, status, location, salary, jobType, followUpDate, description, notes } = data

    if (!userId || !jobTitle || !company || !location || !jobType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const application = await Application.create({
      userId,
      jobTitle,
      company,
      status: status || 'Applied',
      location,
      salary,
      jobType,
      followUpDate,
      description,
      notes,
    })

    return NextResponse.json(
      { message: 'Application created successfully', application },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create application error:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}

// PUT update application
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()
    const { id, ...updateData } = data

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    const application = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Application updated successfully', application },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

// DELETE application
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    const application = await Application.findByIdAndDelete(id)

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Application deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Delete application error:', error)
    return NextResponse.json(
      { error: 'Failed to delete application' },
      { status: 500 }
    )
  }
}
