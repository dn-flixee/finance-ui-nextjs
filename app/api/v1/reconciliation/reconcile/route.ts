// src/app/api/v1/reconciliation/reconcile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ReconciliationService } from '@/services/reconciliation.service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { expenseId, splitwiseId } = await request.json()

    if (!expenseId || !splitwiseId) {
      return NextResponse.json(
        { error: 'expenseId and splitwiseId are required' },
        { status: 400 }
      )
    }

    const service = new ReconciliationService()
    const result = await service.reconcileExpense(expenseId, splitwiseId, session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Expense successfully reconciled with Splitwise',
      ...result
    })
  } catch (error: any) {
    console.error('Reconciliation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to reconcile expense' },
      { status: 500 }
    )
  }
}
