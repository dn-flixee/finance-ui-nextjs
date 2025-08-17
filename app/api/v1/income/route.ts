import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformIncome } from '@/lib/transformers'
import { z } from 'zod'

const createIncomeSchema = z.object({
  name: z.string().min(1).max(255),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  accountId: z.string(),
  incomeSourceId: z.string(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const incomes = await prisma.income.findMany({
      where: { userId: session.user.id },
      include: {
        account: true,
        incomeSource: true
      },
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(incomes.map(transformIncome))
  } catch (error) {
    console.error('Error fetching incomes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch incomes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createIncomeSchema.parse(body)
    
    const income = await prisma.income.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        accountId: validatedData.accountId,
        incomeSourceId: validatedData.incomeSourceId,
        userId: session.user.id
      },
      include: {
        account: true,
        incomeSource: true
      }
    })

    return NextResponse.json(transformIncome(income), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating income:', error)
    return NextResponse.json(
      { error: 'Failed to create income' },
      { status: 500 }
    )
  }
}
