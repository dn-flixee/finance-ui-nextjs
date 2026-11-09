// src/app/api/v1/reconciliation/settle/route.ts
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

    const { incomeId, iouId } = await request.json()

    if (!incomeId || !iouId) {
      return NextResponse.json(
        { error: 'incomeId and iouId are required' },
        { status: 400 }
      )
    }

    const service = new ReconciliationService()
    const result = await service.reconcileSettlement(incomeId, iouId, session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Settlement recorded successfully. Pending IOU adjusted.',
      ...result
    })
  } catch (error: any) {
    console.error('Settlement error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to record settlement' },
      { status: 500 }
    )
  }
}
