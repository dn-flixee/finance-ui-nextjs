import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformIncome } from '@/lib/transformers'
import { z } from 'zod'

const incomeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().datetime().or(z.date()).optional(),
  accountName: z.string().min(1).optional(),
  incomeSourceName: z.string().min(1).optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incomeId = parseInt(params.id)
    const income = await prisma.income.findUnique({
      where: { incomeId },
      include: {
        account: true,
        incomeSource: true
      }
    })
    
    if (!income) {
      return NextResponse.json({ error: 'Income not found' }, { status: 404 })
    }
    
    return NextResponse.json(transformIncome(income))
  } catch (error) {
    console.error('Error fetching income:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incomeId = parseInt(params.id)
    const body = await request.json()
    const validatedData = incomeUpdateSchema.parse(body)
    
    let updateData: any = {}
    
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.amount) updateData.amount = validatedData.amount
    if (validatedData.date) updateData.date = new Date(validatedData.date)
    
    if (validatedData.accountName) {
      const account = await prisma.account.findUnique({
        where: { name: validatedData.accountName }
      })
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 })
      }
      updateData.accountId = account.accountId
    }
    
    if (validatedData.incomeSourceName) {
      const incomeSource = await prisma.incomeSource.findUnique({
        where: { name: validatedData.incomeSourceName }
      })
      if (!incomeSource) {
        return NextResponse.json({ error: 'Income Source not found' }, { status: 404 })
      }
      updateData.incomeSourceId = incomeSource.incomeSourceId
    }
    
    const income = await prisma.income.update({
      where: { incomeId },
      data: updateData,
      include: {
        account: true,
        incomeSource: true
      }
    })
    
    return NextResponse.json(transformIncome(income))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating income:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const incomeId = parseInt(params.id)
    
    await prisma.income.delete({
      where: { incomeId }
    })
    
    return NextResponse.json({ message: 'Income deleted Successfully' })
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}