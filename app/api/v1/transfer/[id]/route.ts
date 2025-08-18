import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformTransfer } from '@/lib/transformers'
import { z } from 'zod'

const transferUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  date: z.string().datetime().or(z.date()).optional(),
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1)
})
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const transferId = params.id
    const transfer = await prisma.transfer.findUnique({
      where: { 
        transferId: transferId,
        userId: session.user.id 
      },
      include: {
        fromAccountId: true,
        toAccountId: true
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const transferId = params.id
    const body = await request.json()
    const validatedData = transferUpdateSchema.parse(body)
    
    let updateData: any = {}
    
    if (validatedData.name) updateData.name = validatedData.name
    if (validatedData.amount) updateData.amount = validatedData.amount
    if (validatedData.date) updateData.date = new Date(validatedData.date)
    if (validatedData.fromAccountId) updateData.fromAccountIdId = validatedData.fromAccountId
    if (validatedData.toAccountId) updateData.toAccountIdId = validatedData.toAccountId
    
    // Validate accounts exist if being updated
    if (validatedData.fromAccountId) {
      const fromAccountId = await prisma.financeAccount.findUnique({
        where: { 
          accountId: validatedData.fromAccountId,
          userId: session.user.id
         }
      })
      if (!fromAccountId) {
        return NextResponse.json({ error: 'From Account not found' }, { status: 404 })
      }
    }
    
    if (validatedData.toAccountId) {
      const toAccountId = await prisma.account.findUnique({
        where: { 
          accountId: validatedData.toAccountId,
          userId: session.user.id
       }
      })
      if (!toAccountId) {
        return NextResponse.json({ error: 'To Account not found' }, { status: 404 })
      }
    }
    
    if (validatedData.fromAccountId && validatedData.toAccountId && 
        validatedData.fromAccountId === validatedData.toAccountId) {
      return NextResponse.json(
        { error: 'From Account and To Account cannot be the same' },
        { status: 400 }
      )
    }
    
    const transfer = await prisma.transfer.update({
      where: { 
        transferId: transferId,
        userId: session.user.id
      },
      data: updateData,
      include: {
        fromAccountId: true,
        toAccountId: true
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
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const transferId = params.id
    
    await prisma.transfer.delete({
      where: { 
        transferId: transferId,
        userId: session.user.id }
    })
    
    return NextResponse.json({ message: 'Transfer deleted Successfully' })
  } catch (error) {
    console.error('Error deleting transfer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}