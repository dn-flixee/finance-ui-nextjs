// src/app/api/chat/sessions/[sessionId]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    sessionId: string
  }
}

// Get messages for a chat session
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = params

    // Verify session belongs to user and get messages
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!chatSession) {
      return NextResponse.json(
        { error: 'Chat session not found or access denied' }, 
        { status: 403 }
      )
    }

    return NextResponse.json(chatSession.messages)

  } catch (error) {
    console.error('Get chat messages error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' }, 
      { status: 500 }
    )
  }
}
