// src/app/api/v1/income-sources/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformIncomeSource } from '@/lib/transformers'
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
        },
        incomes: {
          select: { amount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ 
      incomeSources: incomeSources.map(transformIncomeSource)
    })
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

    return NextResponse.json(transformIncomeSource(incomeSource), { status: 201 })
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

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { incomeSourceId, ...updateData } = body

    if (!incomeSourceId) {
      return NextResponse.json({ error: 'Income Source ID is required' }, { status: 400 })
    }

    const updateSchema = incomeSourceSchema.partial()
    const validatedData = updateSchema.parse(updateData)

    const existingSource = await prisma.incomeSource.findFirst({
      where: { incomeSourceId, userId: session.user.id }
    })

    if (!existingSource) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 })
    }

    const incomeSource = await prisma.incomeSource.update({
      where: { incomeSourceId },
      data: { ...validatedData, updatedAt: new Date() }
    })

    return NextResponse.json(transformIncomeSource(incomeSource))
  } catch (error) {
    console.error('Error updating income source:', error)
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
    const incomeSourceId = searchParams.get('incomeSourceId')

    if (!incomeSourceId) {
      return NextResponse.json({ error: 'Income Source ID is required' }, { status: 400 })
    }

    const source = await prisma.incomeSource.findFirst({
      where: { incomeSourceId, userId: session.user.id }
    })

    if (!source) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 })
    }

    await prisma.incomeSource.delete({ where: { incomeSourceId } })
    return NextResponse.json({ message: 'Income source deleted successfully' })
  } catch (error) {
    console.error('Error deleting income source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
