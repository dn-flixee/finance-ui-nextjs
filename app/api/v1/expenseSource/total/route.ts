import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { expenseSourceId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const expenseSourceId = parseInt(params.expenseSourceId)
    
    const result = await prisma.expense.aggregate({
      where: { 
        expenseSourceId:expenseSourceId,
        userId: session.user.id
       },
      _sum: {
        amount: true
      }
    })
    
    return NextResponse.json({ total: result._sum.amount || 0 })
  } catch (error) {
    console.error('Error fetching expense total:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}