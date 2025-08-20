import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AIService } from '@/services/ai.service'

export async function POST(request: NextRequest) {
  try {
    const { description, amount } = await request.json()
    
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const aiService = new AIService()
    
    // Check LLM health first
    const isHealthy = await aiService.isLLMHealthy()
    if (!isHealthy) {
      // Fallback to simple rule-based classification
      const category = simpleClassification(description, amount)
      return NextResponse.json({ 
        category, 
        method: 'rule-based',
        note: 'AI service unavailable, used fallback classification' 
      })
    }

    const category = await aiService.classifyTransaction(description, amount)
    
    return NextResponse.json({ 
      category, 
      method: 'ai-powered' 
    })

  } catch (error) {
    console.error('Classification error:', error)
    
    // Fallback classification
    const { description, amount } = await request.json()
    const category = simpleClassification(description, amount)
    
    return NextResponse.json({ 
      category, 
      method: 'fallback',
      error: 'AI classification failed, used fallback'
    })
  }
}

function simpleClassification(description: string, amount: number): string {
  const desc = description.toLowerCase()
  
  if (desc.includes('grocery') || desc.includes('food') || desc.includes('restaurant')) return 'Food'
  if (desc.includes('gas') || desc.includes('uber') || desc.includes('taxi')) return 'Transportation'
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('movie')) return 'Entertainment'
  if (desc.includes('amazon') || desc.includes('shop') || desc.includes('store')) return 'Shopping'
  if (desc.includes('electric') || desc.includes('water') || desc.includes('internet')) return 'Bills'
  if (desc.includes('doctor') || desc.includes('pharmacy') || desc.includes('medical')) return 'Healthcare'
  if (amount < 0) return 'Income'
  
  return 'Other'
}