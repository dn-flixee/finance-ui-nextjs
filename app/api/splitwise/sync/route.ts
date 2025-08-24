// src/app/api/splitwise/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { SplitwiseService } from '@/lib/integrations/splitwise'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const splitwiseService = new SplitwiseService()
    const expenses = await splitwiseService.syncExpenses(session.user.id)

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
