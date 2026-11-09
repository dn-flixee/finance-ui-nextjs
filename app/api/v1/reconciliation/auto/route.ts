// src/app/api/v1/reconciliation/auto/route.ts
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

    const service = new ReconciliationService()
    const result = await service.autoReconcileAll(session.user.id)

    return NextResponse.json({
      success: true,
      message: `Auto-reconciled ${result.reconciledCount} transactions.`,
      ...result
    })
  } catch (error: any) {
    console.error('Auto-reconciliation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to auto-reconcile' },
      { status: 500 }
    )
  }
}
