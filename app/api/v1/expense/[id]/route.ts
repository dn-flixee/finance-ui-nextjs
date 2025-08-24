import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformExpense } from '@/lib/transformers'
import { z } from 'zod'
import { TransactionSource } from '@/lib/types'

const expenseUpdateSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  accountId: z.string().min(1),
  expenseSourceId: z.string().min(1).optional(), 
  iconUrl: z.string().url().optional(), 
  sourceType: z.nativeEnum(TransactionSource).optional(), 
  sourceId: z.string().optional(), 
  splitwiseExpenseId: z.string().optional(), 
  isSplitwiseLinked: z.boolean().optional() 
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const expenseId = params.id
    const expense = await prisma.expense.findUnique({
      where: { 
        expenseId: expenseId,
        userId: session.user.id },
      include: {
        account: true,
        expenseSource: true
      }
    })
    
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    
    return NextResponse.json(transformExpense(expense))
  } catch (error) {
    console.error('Error fetching expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const expenseId = params.id
    const body = await request.json()
    const validatedData = expenseUpdateSchema.parse(body)
    
    const expense = await prisma.expense.update({
      where: { 
        expenseId: expenseId,
        userId: session.user.id },
      data: validatedData,
      include: {
        account: true,
        expenseSource: true
      }
    })
    
    return NextResponse.json(transformExpense(expense))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const expenseId = params.id
    
    await prisma.expense.delete({
      where: { 
        expenseId: expenseId,
        userId: session.user.id
     }
    })
    
    return NextResponse.json({ message: 'Expense deleted Successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}