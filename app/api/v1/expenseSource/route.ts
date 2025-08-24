// src/app/api/v1/expense-sources/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformExpenseSource } from '@/lib/transformers'
import { z } from 'zod'

const expenseSourceSchema = z.object({
  name: z.string().min(1),
  budget: z.number().positive()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const expenseSources = await prisma.expenseSource.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { expenses: true }
        },
        expenses: {
          select: { amount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      expenseSources: expenseSources.map(transformExpenseSource)
    })
  } catch (error) {
    console.error('Error fetching expense sources:', error)
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
    const validatedData = expenseSourceSchema.parse(body)

    const expenseSource = await prisma.expenseSource.create({
      data: {
        ...validatedData,
        userId: session.user.id
      }
    })

    return NextResponse.json(transformExpenseSource(expenseSource), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Error creating expense source:', error)
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
    const { expenseSourceId, ...updateData } = body

    if (!expenseSourceId) {
      return NextResponse.json({ error: 'Expense Source ID is required' }, { status: 400 })
    }

    const updateSchema = expenseSourceSchema.partial()
    const validatedData = updateSchema.parse(updateData)

    const existingSource = await prisma.expenseSource.findFirst({
      where: { expenseSourceId, userId: session.user.id }
    })

    if (!existingSource) {
      return NextResponse.json({ error: 'Expense source not found' }, { status: 404 })
    }

    const expenseSource = await prisma.expenseSource.update({
      where: { expenseSourceId },
      data: { ...validatedData, updatedAt: new Date() }
    })

    return NextResponse.json(transformExpenseSource(expenseSource))
  } catch (error) {
    console.error('Error updating expense source:', error)
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
    const expenseSourceId = searchParams.get('expenseSourceId')

    if (!expenseSourceId) {
      return NextResponse.json({ error: 'Expense Source ID is required' }, { status: 400 })
    }

    const source = await prisma.expenseSource.findFirst({
      where: { expenseSourceId, userId: session.user.id }
    })

    if (!source) {
      return NextResponse.json({ error: 'Expense source not found' }, { status: 404 })
    }

    await prisma.expenseSource.delete({ where: { expenseSourceId } })
    return NextResponse.json({ message: 'Expense source deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
