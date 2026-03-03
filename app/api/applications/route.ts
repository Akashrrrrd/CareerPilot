import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Application from '@/lib/models/Application'
import { notifyApplicationStatusChange } from '@/lib/notifications'

// GET all applications for a user
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/applications - Starting request')
    await connectDB()
    console.log('Database connected')

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    console.log('GET /api/applications - userId:', userId)

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Querying applications for userId:', userId)
    const applications = await Application.find({ userId }).sort({ createdAt: -1 })
    console.log('Applications found:', applications.length)

    return NextResponse.json({ applications }, { status: 200 })
  } catch (error: any) {
    console.error('Get applications error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to fetch applications', details: error.message },
      { status: 500 }
    )
  }
}

// POST create new application
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/applications - Starting request')
    await connectDB()
    console.log('Database connected')

    const data = await request.json()
    console.log('POST /api/applications - Received data:', {
      userId: data.userId,
      jobTitle: data.jobTitle,
      company: data.company,
      location: data.location,
      jobType: data.jobType,
    })

    const { userId, jobTitle, company, status, location, salary, jobType, followUpDate, description, notes } = data

    if (!userId || !jobTitle || !company || !location || !jobType) {
      console.error('Missing required fields:', { userId, jobTitle, company, location, jobType })
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Creating application...')
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

    console.log('Application created successfully:', application._id)

    // Create notification for new application
    try {
      await notifyApplicationStatusChange(
        userId,
        company,
        status || 'Applied'
      )
      console.log('Notification created for new application')
    } catch (notifError) {
      console.error('Failed to create notification:', notifError)
      // Don't fail the request if notification fails
    }

    return NextResponse.json(
      { message: 'Application created successfully', application },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create application error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to create application', details: error.message },
      { status: 500 }
    )
  }
}

// PUT update application
export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/applications - Starting update')
    await connectDB()
    console.log('Database connected')

    const data = await request.json()
    const { id, ...updateData } = data

    console.log('PUT /api/applications - Update request:', {
      id,
      updateData
    })

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Get the old application to check if status changed
    const oldApplication = await Application.findById(id)
    
    if (!oldApplication) {
      console.error('Application not found for ID:', id)
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    console.log('Updating application with ID:', id)
    const application = await Application.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )

    console.log('Application updated successfully:', application._id)

    // Create notification if status changed
    if (updateData.status && updateData.status !== oldApplication.status) {
      try {
        await notifyApplicationStatusChange(
          application.userId,
          application.company,
          updateData.status
        )
        console.log('Notification created for status change')
      } catch (notifError) {
        console.error('Failed to create notification:', notifError)
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json(
      { message: 'Application updated successfully', application },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Update application error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to update application', details: error.message },
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
