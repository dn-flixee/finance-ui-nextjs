// src/app/api/v1/incomes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformIncome } from '@/lib/transformers'
import { z } from 'zod'
import { TransactionSource } from '@/lib/types'

const incomeSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  accountId: z.string().min(1),
  incomeSourceId: z.string().min(1).optional(),
  iconUrl: z.string().url().optional(),
  sourceType: z.nativeEnum(TransactionSource).optional(),
  sourceId: z.string().optional()
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

    const incomes = await prisma.income.findMany({
      where,
      include: {
        account: true,
        incomeSource: true
      },
      orderBy: recent ? { createdAt: 'desc' } : { date: 'desc' },
      ...(recent ? { take: limit } : {
        skip: (page - 1) * limit,
        take: limit
      })
    })

    const total = recent ? incomes.length : await prisma.income.count({ where })

    if (recent) {
      return NextResponse.json({ incomes: incomes.map(transformIncome) })
    }

    return NextResponse.json({
      incomes: incomes.map(transformIncome),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching incomes:', error)
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
    const validatedData = incomeSchema.parse(body)

    const income = await prisma.income.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        accountId: validatedData.accountId,
        incomeSourceId: validatedData.incomeSourceId || null,
        userId: session.user.id,
        iconUrl: validatedData.iconUrl || null,
        sourceType: validatedData.sourceType || TransactionSource.MANUAL,
        sourceId: validatedData.sourceId || null
      },
      include: {
        account: true,
        incomeSource: true
      }
    })

    return NextResponse.json(transformIncome(income), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Error creating income:', error)
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
    const { incomeId, ...updateData } = body
    
    if (!incomeId) {
      return NextResponse.json({ error: 'Income ID is required' }, { status: 400 })
    }

    const updateSchema = incomeSchema.partial()
    const validatedData = updateSchema.parse(updateData)
    
    const existingIncome = await prisma.income.findFirst({
      where: {
        incomeId,
        userId: session.user.id
      }
    })
    
    if (!existingIncome) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }
    
    const income = await prisma.income.update({
      where: { incomeId },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        updatedAt: new Date()
      },
      include: {
        account: true,
        incomeSource: true
      }
    })
    
    return NextResponse.json(transformIncome(income))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Error updating income:', error)
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
    const incomeId = searchParams.get('incomeId')
    
    if (!incomeId) {
      return NextResponse.json({ error: 'Income ID is required' }, { status: 400 })
    }

    const income = await prisma.income.findFirst({
      where: {
        incomeId,
        userId: session.user.id
      }
    })
    
    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }
    
    await prisma.income.delete({
      where: { incomeId }
    })
    
    return NextResponse.json({ message: 'Income deleted successfully' })
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
