// src/app/api/v1/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformExpense } from '@/lib/transformers'
import { z } from 'zod'
import { TransactionSource } from '@/lib/types'

const expenseSchema = z.object({
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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const accountId = searchParams.get('accountId')
    const sourceType = searchParams.get('sourceType') as TransactionSource
    const recent = searchParams.get('recent') === 'true'

    const where = {
      userId: session.user.id,
      ...(accountId && { accountId }),
      ...(sourceType && { sourceType })
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        account: true,
        expenseSource: true
      },
      orderBy: recent ? { createdAt: 'desc' } : { date: 'desc' },
      ...(recent ? { take: limit } : {
        skip: (page - 1) * limit,
        take: limit
      })
    })

    const total = recent ? expenses.length : await prisma.expense.count({ where })
    
    if (recent) {
      return NextResponse.json({ expenses: expenses.map(transformExpense) })
    }

    return NextResponse.json({
      expenses: expenses.map(transformExpense),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
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
        expenseSourceId: validatedData.expenseSourceId || null,
        userId: session.user.id,
        iconUrl: validatedData.iconUrl || null,
        sourceType: validatedData.sourceType || TransactionSource.MANUAL,
        sourceId: validatedData.sourceId || null,
        splitwiseExpenseId: validatedData.splitwiseExpenseId || null,
        isSplitwiseLinked: validatedData.isSplitwiseLinked || false
      },
      include: {
        account: true,
        expenseSource: true
      }
    })
    
    return NextResponse.json(transformExpense(expense), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { expenseId, ...updateData } = body
    
    if (!expenseId) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 })
    }

    const updateSchema = expenseSchema.partial()
    const validatedData = updateSchema.parse(updateData)
    
    const existingExpense = await prisma.expense.findFirst({
      where: {
        expenseId,
        userId: session.user.id
      }
    })
    
    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    
    const expense = await prisma.expense.update({
      where: { expenseId },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        updatedAt: new Date()
      },
      include: {
        account: true,
        expenseSource: true
      }
    })
    
    return NextResponse.json(transformExpense(expense))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const expenseId = searchParams.get('expenseId')
    
    if (!expenseId) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 })
    }

    const expense = await prisma.expense.findFirst({
      where: {
        expenseId,
        userId: session.user.id
      }
    })
    
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    
    await prisma.expense.delete({
      where: { expenseId }
    })
    
    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
