import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformExpense } from '@/lib/transformers'
import { z } from 'zod'

const expenseSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  accountName: z.string().min(1),
  expenseSourceName: z.string().min(1)
})

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
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
    const body = await request.json()
    const validatedData = expenseSchema.parse(body)
    
    // Find account and expense source
    const account = await prisma.account.findUnique({
      where: { name: validatedData.accountName }
    })
    
    const expenseSource = await prisma.expenseSource.findUnique({
      where: { name: validatedData.expenseSourceName }
    })
    
    if (!account || !expenseSource) {
      return NextResponse.json(
        { error: 'Account or ExpenseSource not found' },
        { status: 404 }
      )
    }
    
    const expense = await prisma.expense.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        accountId: account.accountId,
        expenseSourceId: expenseSource.expenseSourceId
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