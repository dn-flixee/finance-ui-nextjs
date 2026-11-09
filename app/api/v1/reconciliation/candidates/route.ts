// src/app/api/v1/reconciliation/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ReconciliationService } from '@/services/reconciliation.service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const expenseId = searchParams.get('expenseId')
    const incomeId = searchParams.get('incomeId')

    const service = new ReconciliationService()

    if (expenseId) {
      const candidates = await service.findCandidatesForExpense(expenseId, session.user.id)
      return NextResponse.json({ candidates })
    }

    if (incomeId) {
      const candidates = await service.findSettlementCandidatesForIncome(incomeId, session.user.id)
      return NextResponse.json({ candidates })
    }

    return NextResponse.json(
      { error: 'Provide either expenseId or incomeId parameter' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Reconciliation candidates error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to find candidates' },
      { status: 500 }
    )
  }
}
