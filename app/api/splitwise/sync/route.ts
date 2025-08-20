import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SplitwiseService } from '@/lib/integrations/splitwise'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const splitwiseService = new SplitwiseService()
    const expenses = await splitwiseService.syncExpenses(user.id)

    return NextResponse.json({ 
      success: true, 
      count: expenses.length,
      expenses 
    })

  } catch (error) {
    console.error('Splitwise sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync Splitwise expenses' }, 
      { status: 500 }
    )
  }
}
