import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createIncomeSchema = z.object({
  name: z.string().min(1).max(255),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  accountName: z.string(),
  incomeSourceName: z.string(),
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

    // Transform to match frontend expectations
    const transformedIncomes = incomes.map(income => ({
      incomeId: income.incomeId,
      name: income.name,
      amount: income.amount,
      date: income.date,
      accountName: income.account.name,
      incomeSourceName: income.incomeSource.name
    }))

    return NextResponse.json(transformedIncomes)
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
    
    // Find account and income source by name for this user
    const account = await prisma.financeAccount.findFirst({
      where: { 
        name: validatedData.accountName,
        userId: session.user.id 
      }
    })
    
    const incomeSource = await prisma.incomeSource.findFirst({
      where: { 
        name: validatedData.incomeSourceName,
        userId: session.user.id 
      }
    })

    if (!account || !incomeSource) {
      return NextResponse.json(
        { error: 'Account or Income Source not found' },
        { status: 404 }
      )
    }

    const income = await prisma.income.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        accountId: account.id,
        incomeSourceId: incomeSource.id,
        userId: session.user.id
      },
      include: {
        account: true,
        incomeSource: true
      }
    })

    const transformedIncome = {
      incomeId: income.incomeId,
      name: income.name,
      amount: income.amount,
      date: income.date,
      accountName: income.account.name,
      incomeSourceName: income.incomeSource.name
    }

    return NextResponse.json(transformedIncome, { status: 201 })
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
