// src/app/api/v1/reconciliation/unreconcile/route.ts
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

    const { expenseId } = await request.json()

    if (!expenseId) {
      return NextResponse.json(
        { error: 'expenseId is required' },
        { status: 400 }
      )
    }

    const service = new ReconciliationService()
    const result = await service.unreconcileExpense(expenseId, session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Expense unlinked and unreconciled',
      expense: result
    })
  } catch (error: any) {
    console.error('Unreconciliation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to unreconcile expense' },
      { status: 500 }
    )
  }
}
