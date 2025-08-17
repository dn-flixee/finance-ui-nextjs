import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformExpense } from '@/lib/transformers'
import { z } from 'zod'

const expenseSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  accountId: z.string().min(1),
  expenseSourceId: z.string().min(1)
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

    const expenses = await prisma.expense.findMany({
      where: { userId: session.user.id },
      include: {
        account: true,
        expenseSource: true
      },
      orderBy: { expenseId: 'asc' }
    })
    
    return NextResponse.json(expenses.map(transformExpense))
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const validatedData = expenseSchema.parse(body)
    
    const expense = await prisma.expense.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        accountId: validatedData.accountId,
        expenseSourceId: validatedData.expenseSourceId,
        userId: session.user.id
      },
      include: {
        account: true,
        expenseSource: true
      }
    })
    
    return NextResponse.json(transformExpense(expense), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}