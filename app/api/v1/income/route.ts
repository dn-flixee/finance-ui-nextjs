// src/app/api/v1/incomes/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
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
      return NextResponse.json({ incomes })
    }

    return NextResponse.json({
      incomes,
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

    return NextResponse.json(income, { status: 201 })
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

// PUT and DELETE methods similar to expenses...
