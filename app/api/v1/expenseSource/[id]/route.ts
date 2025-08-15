import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformExpenseSource } from '@/lib/transformers'
import { z } from 'zod'

const expenseSourceUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  budget: z.number().positive().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseSourceId = parseInt(params.id)
    const expenseSource = await prisma.expenseSource.findUnique({
      where: { expenseSourceId }
    })
    
    if (!expenseSource) {
      return NextResponse.json({ error: 'Expense Source not found' }, { status: 404 })
    }
    
    return NextResponse.json(transformExpenseSource(expenseSource))
  } catch (error) {
    console.error('Error fetching expense source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseSourceId = parseInt(params.id)
    const body = await request.json()
    const validatedData = expenseSourceUpdateSchema.parse(body)
    
    const expenseSource = await prisma.expenseSource.update({
      where: { expenseSourceId },
      data: validatedData
    })
    
    return NextResponse.json(transformExpenseSource(expenseSource))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating expense source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const expenseSourceId = parseInt(params.id)
    
    await prisma.expenseSource.delete({
      where: { expenseSourceId }
    })
    
    return NextResponse.json({ message: 'Expense Source deleted Successfully' })
  } catch (error) {
    console.error('Error deleting expense source:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}