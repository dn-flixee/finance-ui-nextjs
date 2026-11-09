// src/app/api/splitwise/sync/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SplitwiseService } from '@/lib/integrations/splitwise'
import { ReconciliationService } from '@/services/reconciliation.service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const splitwiseService = new SplitwiseService()
    
    // Check if user has splitwiseUserId, if not fetch it
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { splitwiseUserId: true }
    })
    if (!user?.splitwiseUserId) {
      try {
        const swUser = await splitwiseService.getCurrentUser(session.user.id)
        if (swUser?.id) {
          await prisma.user.update({
            where: { id: session.user.id },
            data: { 
              splitwiseUserId: swUser.id.toString(),
              splitwiseUserEmail: swUser.email || undefined
            }
          })
        }
      } catch (err) {
        console.warn('Could not auto-populate splitwiseUserId:', err)
      }
    }

    const expenses = await splitwiseService.syncExpenses(session.user.id)
    const balances = await splitwiseService.getNetBalances(session.user.id)

    // Automatically reconcile matches with bank expenses
    const reconService = new ReconciliationService()
    const autoRecon = await reconService.autoReconcileAll(session.user.id)

    return NextResponse.json({ 
      success: true, 
      count: expenses.length,
      expenses,
      balances,
      autoReconciled: autoRecon.reconciledCount
    })

  } catch (error) {
    console.error('Splitwise sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync Splitwise expenses' }, 
      { status: 500 }
    )
  }
}
