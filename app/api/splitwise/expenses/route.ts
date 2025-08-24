// src/app/api/splitwise/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expenses = await prisma.splitwiseExpense.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ expenses })

  } catch (error) {
    console.error('Fetch Splitwise expenses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Splitwise expenses' }, 
      { status: 500 }
    )
  }
}
