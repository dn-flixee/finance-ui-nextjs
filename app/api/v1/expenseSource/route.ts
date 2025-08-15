import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformExpenseSource } from '@/lib/transformers'
import { z } from 'zod'

const expenseSourceSchema = z.object({
  name: z.string().min(1),
  budget: z.number().positive()
})

export async function GET() {
  try {
    const expenseSources = await prisma.expenseSource.findMany({
      orderBy: { expenseSourceId: 'asc' }
    })
    
    return NextResponse.json(expenseSources.map(transformExpenseSource))
  } catch (error) {
    console.error('Error fetching expense sources:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = expenseSourceSchema.parse(body)
    
    const expenseSource = await prisma.expenseSource.create({
      data: validatedData
    })
    
    return NextResponse.json(transformExpenseSource(expenseSource), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating expense source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}