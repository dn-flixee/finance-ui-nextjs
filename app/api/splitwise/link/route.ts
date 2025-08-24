// src/app/api/splitwise/link/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Update the Splitwise expense to mark it as linked
    const updatedExpense = await prisma.splitwiseExpense.update({
      where: {
        splitwiseId: splitwiseId,
        userId: session.user.id // Ensure user owns this expense
      },
      data: {
        linkedExpenseId: expenseId || null,
        isLinked: !!expenseId
      }
    })

    // If linking to an existing expense, update that expense too
    if (expenseId) {
      await prisma.expense.update({
        where: {
          expenseId: expenseId,
          userId: session.user.id // Ensure user owns this expense
        },
        data: {
          splitwiseExpenseId: splitwiseId,
          isSplitwiseLinked: true,
          sourceType: 'SPLITWISE'
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      expense: updatedExpense 
    })

  } catch (error) {
    console.error('Splitwise link error:', error)
    return NextResponse.json(
      { error: 'Failed to link Splitwise expense' }, 
      { status: 500 }
    )
  }
}
