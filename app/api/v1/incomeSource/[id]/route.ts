import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformIncomeSource } from '@/lib/transformers'
import { z } from 'zod'

const incomeSourceUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  goal: z.number().positive().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incomeSourceId = parseInt(params.id)
    const incomeSource = await prisma.incomeSource.findUnique({
      where: { incomeSourceId }
    })
    
    if (!incomeSource) {
      return NextResponse.json({ error: 'Income Source not found' }, { status: 404 })
    }
    
    return NextResponse.json(transformIncomeSource(incomeSource))
  } catch (error) {
    console.error('Error fetching income source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incomeSourceId = parseInt(params.id)
    const body = await request.json()
    const validatedData = incomeSourceUpdateSchema.parse(body)
    
    const incomeSource = await prisma.incomeSource.update({
      where: { incomeSourceId },
      data: validatedData
    })
    
    return NextResponse.json(transformIncomeSource(incomeSource))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating income source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incomeSourceId = parseInt(params.id)
    
    await prisma.incomeSource.delete({
      where: { incomeSourceId }
    })
    
    return NextResponse.json({ message: 'Income Source deleted Successfully' })
  } catch (error) {
    console.error('Error deleting income source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}