// src/app/api/v1/splitwise/link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ReconciliationService } from '@/services/reconciliation.service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { splitwiseId, expenseId } = await request.json()

    if (!splitwiseId) {
      return NextResponse.json(
        { error: 'Splitwise ID is required' }, 
        { status: 400 }
      )
    }

    const reconciliationService = new ReconciliationService()

    if (expenseId) {
      // Run complete reconciliation and split logic
      const result = await reconciliationService.reconcileExpense(
        expenseId,
        splitwiseId,
        session.user.id
      )
      return NextResponse.json({
        success: true,
        message: 'Expense linked and reconciled with Splitwise',
        ...result
      })
    } else {
      // Find currently linked expense and unreconcile
      const swExpense = await prisma.splitwiseExpense.findFirst({
        where: { splitwiseId, userId: session.user.id }
      })
      if (swExpense?.linkedExpenseId) {
        await reconciliationService.unreconcileExpense(
          swExpense.linkedExpenseId,
          session.user.id
        )
      } else {
        await prisma.splitwiseExpense.updateMany({
          where: { splitwiseId, userId: session.user.id },
          data: { isLinked: false, linkedExpenseId: null }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Expense unlinked from Splitwise'
      })
    }
  } catch (error: any) {
    console.error('Splitwise link error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to link Splitwise expense' }, 
      { status: 500 }
    )
  }
}
