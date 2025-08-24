// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth' // Adjust path to your authOptions
import { prisma } from '@/lib/prisma'
import { AIService } from '@/services/ai.service'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()
    
    // Replace Supabase auth with NextAuth
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate input
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' }, 
        { status: 400 }
      )
    }

    const aiService = new AIService()
    
    // Check if local LLM is healthy
    const isHealthy = await aiService.isLLMHealthy()
    if (!isHealthy) {
      return NextResponse.json({ 
        error: 'AI service is currently unavailable. Please check your Raspberry Pi LLM setup.',
        type: 'LLM_UNAVAILABLE'
      }, { status: 503 })
    }

    // Handle session creation or validation
    let chatSessionId = sessionId
    if (sessionId) {
      // Verify existing session belongs to user
      const existingSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: session.user.id
        }
      })
      
      if (!existingSession) {
        return NextResponse.json(
          { error: 'Chat session not found or access denied' }, 
          { status: 403 }
        )
      }
    } else {
      // Create new session if none provided
      const newSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          title: 'New Chat'
        }
      })
      chatSessionId = newSession.id
    }

    // Store user message in database
    await prisma.chatMessage.create({
      data: {
        content: message.trim(),
        role: 'USER',
        sessionId: chatSessionId
      }
    })

    // Get AI response using your existing service
    const aiResponse = await aiService.chatWithFinancialData(message, session.user.id)

    // Store AI response in database
    await prisma.chatMessage.create({
      data: {
        content: aiResponse,
        role: 'ASSISTANT',
        sessionId: chatSessionId
      }
    })

    return NextResponse.json({ 
      response: aiResponse,
      sessionId: chatSessionId // Include sessionId in response for new sessions
    })

  } catch (error) {
    console.error('Chat API error:', error)
    
    // Enhanced error handling
    if (error.code === 'P2002') { // Prisma unique constraint error
      return NextResponse.json(
        { error: 'Database constraint error', type: 'DB_ERROR' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: error.message.includes('LLM') 
          ? 'AI service temporarily unavailable' 
          : 'Failed to process chat message',
        type: error.message.includes('LLM') ? 'LLM_ERROR' : 'GENERAL_ERROR'
      }, 
      { status: 500 }
    )
  }
}
