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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const expenseSources = await prisma.expenseSource.findMany({
      where: { userId: session.user.id },
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const validatedData = expenseSourceSchema.parse(body)
    
    const expenseSource = await prisma.expenseSource.create({
      data: {
        name: validatedData.name,
        budget: validatedData.budget,
        userId: session.user.id
      }
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