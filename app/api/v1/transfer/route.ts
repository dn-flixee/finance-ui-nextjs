import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformTransfer } from '@/lib/transformers'
import { z } from 'zod'
import { CornerDownLeft } from 'lucide-react'

const transferSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  fromAccountId: z.string().min(1),
  toAccountId: z.string().min(1)
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const transfers = await prisma.transfer.findMany({
      where: { userId: session.user.id },
      include: {
        fromAccount: true,
        toAccount: true
      },
      orderBy: { transferId: 'asc' }
    })
    console.log(transfers)
    return NextResponse.json(transfers.map(transformTransfer))
  } catch (error) {
    console.error('Error fetching transfers:', error)
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
    const validatedData = transferSchema.parse(body)

    console.log("dsa", validatedData)
    
    // Verify both accounts exist
    const fromAccount = await prisma.financeAccount.findUnique({
      where: { 
        accountId: validatedData.fromAccountId,
        userId: session.user.id 
      }
       
    })
    
    const toAccount = await prisma.financeAccount.findUnique({
      where: { 
        accountId: validatedData.toAccountId,
        userId: session.user.id 
      }
    })
    
    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { error: 'From Account or To Account not found' },
        { status: 404 }
      )
    }
    
    if (validatedData.fromAccountId === validatedData.toAccountId) {
      return NextResponse.json(
        { error: 'From Account and To Account cannot be the same' },
        { status: 400 }
      )
    }
    
    const transfer = await prisma.transfer.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        fromAccountId: validatedData.fromAccountId,
        toAccountId: validatedData.toAccountId,
        userId: session.user.id
      },
      include: {
        fromAccount: true,
        toAccount: true
      }
    })
    
    return NextResponse.json(transformTransfer(transfer), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating transfer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}