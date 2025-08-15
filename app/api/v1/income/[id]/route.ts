import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateIncomeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  amount: z.number().positive().optional(),
  date: z.string().datetime().or(z.date()).optional(),
  accountName: z.string().optional(),
  incomeSourceName: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateIncomeSchema.parse(body)
    
    // Build update data
    const updateData: any = {}
    
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.amount) updateData.amount = validatedData.amount
    if (validatedData.date) updateData.date = new Date(validatedData.date)
    
    if (validatedData.accountName) {
      const account = await prisma.financeAccount.findFirst({
        where: { 
          name: validatedData.accountName,
          userId: session.user.id 
        }
      })
      if (account) updateData.accountId = account.id
    }
    
    if (validatedData.incomeSourceName) {
      const incomeSource = await prisma.incomeSource.findFirst({
        where: { 
          name: validatedData.incomeSourceName,
          userId: session.user.id 
        }
      })
      if (incomeSource) updateData.incomeSourceId = incomeSource.id
    }
    
    const income = await prisma.income.update({
      where: { 
        incomeId: parseInt(params.id),
        userId: session.user.id
      },
      data: updateData,
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

    return NextResponse.json(transformedIncome)
  } catch (error) {
    console.error('Error updating income:', error)
    return NextResponse.json(
      { error: 'Failed to update income' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.income.delete({
      where: { 
        incomeId: parseInt(params.id),
        userId: session.user.id
      }
    })

    return NextResponse.json({ message: 'Income deleted successfully' })
  } catch (error) {
    console.error('Error deleting income:', error)
    return NextResponse.json(
      { error: 'Failed to delete income' },
      { status: 500 }
    )
  }
}
