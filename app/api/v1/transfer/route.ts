import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformTransfer } from '@/lib/transformers'
import { z } from 'zod'

const transferSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  fromAccount: z.number().int().positive(),
  toAccount: z.number().int().positive()
})

export async function GET() {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        fromAccount: true,
        toAccount: true
      },
      orderBy: { transferId: 'asc' }
    })
    
    return NextResponse.json(transfers.map(transformTransfer))
  } catch (error) {
    console.error('Error fetching transfers:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = transferSchema.parse(body)
    
    // Verify both accounts exist
    const fromAccount = await prisma.account.findUnique({
      where: { accountId: validatedData.fromAccount }
    })
    
    const toAccount = await prisma.account.findUnique({
      where: { accountId: validatedData.toAccount }
    })
    
    if (!fromAccount || !toAccount) {
      return NextResponse.json(
        { error: 'From Account or To Account not found' },
        { status: 404 }
      )
    }
    
    if (validatedData.fromAccount === validatedData.toAccount) {
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
        fromAccountId: validatedData.fromAccount,
        toAccountId: validatedData.toAccount
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