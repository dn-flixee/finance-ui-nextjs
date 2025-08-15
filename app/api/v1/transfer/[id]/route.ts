import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformTransfer } from '@/lib/transformers'
import { z } from 'zod'

const transferUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().datetime().or(z.date()).optional(),
  fromAccount: z.number().int().positive().optional(),
  toAccount: z.number().int().positive().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transferId = parseInt(params.id)
    const transfer = await prisma.transfer.findUnique({
      where: { transferId },
      include: {
        fromAccount: true,
        toAccount: true
      }
    })
    
    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
    }
    
    return NextResponse.json(transformTransfer(transfer))
  } catch (error) {
    console.error('Error fetching transfer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transferId = parseInt(params.id)
    const body = await request.json()
    const validatedData = transferUpdateSchema.parse(body)
    
    let updateData: any = {}
    
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.amount) updateData.amount = validatedData.amount
    if (validatedData.date) updateData.date = new Date(validatedData.date)
    if (validatedData.fromAccount) updateData.fromAccountId = validatedData.fromAccount
    if (validatedData.toAccount) updateData.toAccountId = validatedData.toAccount
    
    // Validate accounts exist if being updated
    if (validatedData.fromAccount) {
      const fromAccount = await prisma.account.findUnique({
        where: { accountId: validatedData.fromAccount }
      })
      if (!fromAccount) {
        return NextResponse.json({ error: 'From Account not found' }, { status: 404 })
      }
    }
    
    if (validatedData.toAccount) {
      const toAccount = await prisma.account.findUnique({
        where: { accountId: validatedData.toAccount }
      })
      if (!toAccount) {
        return NextResponse.json({ error: 'To Account not found' }, { status: 404 })
      }
    }
    
    if (validatedData.fromAccount && validatedData.toAccount && 
        validatedData.fromAccount === validatedData.toAccount) {
      return NextResponse.json(
        { error: 'From Account and To Account cannot be the same' },
        { status: 400 }
      )
    }
    
    const transfer = await prisma.transfer.update({
      where: { transferId },
      data: updateData,
      include: {
        fromAccount: true,
        toAccount: true
      }
    })
    
    return NextResponse.json(transformTransfer(transfer))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating transfer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transferId = parseInt(params.id)
    
    await prisma.transfer.delete({
      where: { transferId }
    })
    
    return NextResponse.json({ message: 'Transfer deleted Successfully' })
  } catch (error) {
    console.error('Error deleting transfer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}