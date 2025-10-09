import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !(session as { user?: { id?: string } }).user || !(session as { user?: { id?: string } }).user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const memos = await prisma.memo.findMany({
      where: {
        userId: (session as { user?: { id?: string } }).user?.id
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(memos)
  } catch (error) {
    console.error('Error fetching memos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const memo = await prisma.memo.create({
      data: {
        title,
        content,
        userId: (session as { user?: { id?: string } }).user?.id
      }
    })

    return NextResponse.json(memo, { status: 201 })
  } catch (error) {
    console.error('Error creating memo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

