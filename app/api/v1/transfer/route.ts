// src/app/api/v1/transfers/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformTransfer } from '@/lib/transformers'
import { z } from 'zod'
import { TransactionSource } from '@/lib/types'

const transferSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()),
  fromAccountId: z.string().min(1).optional(),
  toAccountId: z.string().min(1).optional(),
  iconUrl: z.string().url().optional(),
  sourceType: z.nativeEnum(TransactionSource).optional(),
  sourceId: z.string().optional()
}).refine(data => data.fromAccountId || data.toAccountId, {
  message: "At least one of fromAccountId or toAccountId is required"
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const accountId = searchParams.get('accountId')

    const where = {
      userId: session.user.id,
      ...(accountId && {
        OR: [
          { fromAccountId: accountId },
          { toAccountId: accountId }
        ]
      })
    }

    const transfers = await prisma.transfer.findMany({
      where,
      include: {
        fromAccount: true,
        toAccount: true
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    const total = await prisma.transfer.count({ where })

    return NextResponse.json({
      transfers: transfers.map(transformTransfer),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
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

    // Validate accounts belong to user
    if (validatedData.fromAccountId) {
      const fromAccount = await prisma.financeAccount.findFirst({
        where: { accountId: validatedData.fromAccountId, userId: session.user.id }
      })
      if (!fromAccount) {
        return NextResponse.json({ error: 'From account not found' }, { status: 400 })
      }
    }

    if (validatedData.toAccountId) {
      const toAccount = await prisma.financeAccount.findFirst({
        where: { accountId: validatedData.toAccountId, userId: session.user.id }
      })
      if (!toAccount) {
        return NextResponse.json({ error: 'To account not found' }, { status: 400 })
      }
    }

    const transfer = await prisma.transfer.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        fromAccountId: validatedData.fromAccountId || null,
        toAccountId: validatedData.toAccountId || null,
        userId: session.user.id,
        iconUrl: validatedData.iconUrl || null,
        sourceType: validatedData.sourceType || TransactionSource.MANUAL,
        sourceId: validatedData.sourceId || null
      },
      include: {
        fromAccount: true,
        toAccount: true
      }
    })

    return NextResponse.json(transformTransfer(transfer), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Error creating transfer:', error)
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
    const { transferId, ...updateData } = body
    
    if (!transferId) {
      return NextResponse.json({ error: 'Transfer ID is required' }, { status: 400 })
    }

    const updateSchema = transferSchema.partial()
    const validatedData = updateSchema.parse(updateData)
    
    const existingTransfer = await prisma.transfer.findFirst({
      where: {
        transferId,
        userId: session.user.id
      }
    })
    
    if (!existingTransfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
    }
    
    const transfer = await prisma.transfer.update({
      where: { transferId },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        updatedAt: new Date()
      },
      include: {
        fromAccount: true,
        toAccount: true
      }
    })
    
    return NextResponse.json(transformTransfer(transfer))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Error updating transfer:', error)
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
    const transferId = searchParams.get('transferId')
    
    if (!transferId) {
      return NextResponse.json({ error: 'Transfer ID is required' }, { status: 400 })
    }

    const transfer = await prisma.transfer.findFirst({
      where: {
        transferId,
        userId: session.user.id
      }
    })
    
    if (!transfer) {
      return NextResponse.json({ error: 'Transfer not found' }, { status: 404 })
    }
    
    await prisma.transfer.delete({
      where: { transferId }
    })
    
    return NextResponse.json({ message: 'Transfer deleted successfully' })
  } catch (error) {
    console.error('Error deleting transfer:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
