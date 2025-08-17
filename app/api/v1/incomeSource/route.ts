import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformIncomeSource } from '@/lib/transformers'
import { z } from 'zod'

const incomeSourceSchema = z.object({
  name: z.string().min(1),
  goal: z.number().positive().optional()
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
        if (!session?.user) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

    const incomeSources = await prisma.incomeSource.findMany({
      where: { userId: session.user.id },
      orderBy: { incomeSourceId: 'asc' }
    })

    return NextResponse.json(incomeSources.map(transformIncomeSource))
  } catch (error) {
    console.error('Error fetching income sources:', error)
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
    const validatedData = incomeSourceSchema.parse(body)
    
    const incomeSource = await prisma.incomeSource.create({
      data: {
        name: validatedData.name,
        goal: validatedData.goal,
        userId: session.user.id
      }
    })
    
    return NextResponse.json(transformIncomeSource(incomeSource), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating income source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}