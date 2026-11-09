// src/app/api/v1/splitwise/balances/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { SplitwiseService } from '@/lib/integrations/splitwise'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const splitwiseService = new SplitwiseService()
    const balances = await splitwiseService.getNetBalances(session.user.id)

    return NextResponse.json(balances)
  } catch (error: any) {
    console.error('Fetch Splitwise balances error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Splitwise balances' },
      { status: 500 }
    )
  }
}
