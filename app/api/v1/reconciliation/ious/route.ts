// src/app/api/v1/reconciliation/ious/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IOUStatus } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as IOUStatus | null

    const where: any = { userId: session.user.id }
    if (status) {
      where.status = status
    }

    const ious = await prisma.pendingIOU.findMany({
      where,
      include: {
        expense: {
          select: {
            name: true,
            date: true,
            amount: true
          }
        },
        settlements: {
          orderBy: { settledAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalPendingAmount = ious
      .filter(i => i.status !== IOUStatus.SETTLED && i.status !== IOUStatus.WRITTEN_OFF)
      .reduce((sum, i) => sum + (i.amount - i.settledAmount), 0)

    return NextResponse.json({
      ious,
      totalPendingAmount
    })
  } catch (error: any) {
    console.error('Fetch IOUs error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch pending IOUs' },
      { status: 500 }
    )
  }
}
