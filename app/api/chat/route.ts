import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AIService } from '@/services/ai.service'

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json()
    
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const response = await aiService.chatWithFinancialData(message, user.id)

    return NextResponse.json({ response })

  } catch (error) {
    console.error('Chat API error:', error)
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