import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { expenseSourceId: string } }
) {
  try {
    const expenseSourceId = parseInt(params.expenseSourceId)
    
    const result = await prisma.expense.aggregate({
      where: { expenseSourceId },
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