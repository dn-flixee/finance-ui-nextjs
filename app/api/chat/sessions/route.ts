// src/app/api/chat/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Create new chat session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title = 'New Chat' } = await request.json()

    const chatSession = await prisma.chatSession.create({
      data: {
        userId: session.user.id,
        title: title
      }
    })

    return NextResponse.json(chatSession, { status: 201 })

  } catch (error) {
    console.error('Create chat session error:', error)
    return NextResponse.json(
      { error: 'Failed to create chat session' }, 
      { status: 500 }
    )
  }
}

// Get user's chat sessions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatSessions = await prisma.chatSession.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        _count: {
          select: { messages: true }
        }
      }
    })

    return NextResponse.json(chatSessions)

  } catch (error) {
    console.error('Get chat sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chat sessions' }, 
      { status: 500 }
    )
  }
}
