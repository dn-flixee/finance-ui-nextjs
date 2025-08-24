// src/app/api/v1/income-sources/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const incomeSourceSchema = z.object({
  name: z.string().min(1),
  goal: z.number().positive()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const incomeSources = await prisma.incomeSource.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { incomes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ incomeSources })
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
        ...validatedData,
        userId: session.user.id
      }
    })

    return NextResponse.json(incomeSource, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Error creating income source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}