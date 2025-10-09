import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as { user?: { id?: string } }).user || !(session as { user?: { id?: string } }).user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const memo = await prisma.memo.findFirst({
      where: {
        id: id,
        userId: (session as { user?: { id?: string } }).user?.id
      }
    })

    if (!memo) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 })
    }

    return NextResponse.json(memo)
  } catch (error) {
    console.error('Error fetching memo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as { user?: { id?: string } }).user || !(session as { user?: { id?: string } }).user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const { id } = await params
    const memo = await prisma.memo.updateMany({
      where: {
        id: id,
        userId: (session as { user?: { id?: string } }).user?.id
      },
      data: {
        title,
        content
      }
    })

    if (memo.count === 0) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 })
    }

    const updatedMemo = await prisma.memo.findUnique({
      where: { id: params.id }
    })

    return NextResponse.json(updatedMemo)
  } catch (error) {
    console.error('Error updating memo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as { user?: { id?: string } }).user || !(session as { user?: { id?: string } }).user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const memo = await prisma.memo.deleteMany({
      where: {
        id: id,
        userId: (session as { user?: { id?: string } }).user?.id
      }
    })

    if (memo.count === 0) {
      return NextResponse.json({ error: 'Memo not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Memo deleted successfully' })
  } catch (error) {
    console.error('Error deleting memo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

