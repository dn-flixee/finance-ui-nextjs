import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformIncome } from '@/lib/transformers'
import { z } from 'zod'

const incomeSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  accountName: z.string().min(1),
  incomeSourceName: z.string().min(1)
})

export async function GET() {
  try {
    const incomes = await prisma.income.findMany({
      include: {
        account: true,
        incomeSource: true
      },
      orderBy: { incomeId: 'asc' }
    })
    
    return NextResponse.json(incomes.map(transformIncome))
  } catch (error) {
    console.error('Error fetching incomes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = incomeSchema.parse(body)
    
    const account = await prisma.account.findUnique({
      where: { name: validatedData.accountName }
    })
    
    const incomeSource = await prisma.incomeSource.findUnique({
      where: { name: validatedData.incomeSourceName }
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
        accountId: account.accountId,
        incomeSourceId: incomeSource.incomeSourceId
      },
      include: {
        account: true,
        incomeSource: true
      }
    })
    
    return NextResponse.json(transformIncome(income), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating income:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}