import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformExpense } from '@/lib/transformers'
import { z } from 'zod'

const expenseUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().datetime().or(z.date()).optional(),
  accountName: z.string().min(1).optional(),
  expenseSourceName: z.string().min(1).optional()
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
    const expenseId = parseInt(params.id)
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
    const expenseId = parseInt(params.id)
    const body = await request.json()
    const validatedData = expenseUpdateSchema.parse(body)
    
    let updateData: any = {}
    
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.amount) updateData.amount = validatedData.amount
    if (validatedData.date) updateData.date = new Date(validatedData.date)
    
    if (validatedData.accountName) {
      const account = await prisma.account.findUnique({
        where: { 
          name: validatedData.accountName,
          userId: session.user.id
        }
      })
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }
      updateData.accountId = account.accountId
    }
    
    if (validatedData.expenseSourceName) {
      const expenseSource = await prisma.expenseSource.findUnique({
        where: { 
          name: validatedData.expenseSourceName,
          userId: session.user.id
         }
      })
      if (!expenseSource) {
        return NextResponse.json({ error: 'ExpenseSource not found' }, { status: 404 })
      }
      updateData.expenseSourceId = expenseSource.expenseSourceId
    }
    
    const expense = await prisma.expense.update({
      where: { 
        expenseId: expenseId,
        userId: session.user.id },
      data: updateData,
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
    const expenseId = parseInt(params.id)
    
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