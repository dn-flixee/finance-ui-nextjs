// src/app/api/v1/accounts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { AccountType } from '@/lib/types'

const accountSchema = z.object({
  name: z.string().min(1),
  accountType: z.nativeEnum(AccountType),
  balance: z.number(),
  creditLimit: z.number().optional(),
  iconUrl: z.string().url().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  routingNumber: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const accountType = searchParams.get('accountType') as AccountType

    const where = {
      userId: session.user.id,
      ...(accountType && { accountType })
    }

    const accounts = await prisma.financeAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error('Error fetching accounts:', error)
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
    const validatedData = accountSchema.parse(body)

    const account = await prisma.financeAccount.create({
      data: {
        ...validatedData,
        userId: session.user.id
      }
    })

    return NextResponse.json(account, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Error creating account:', error)
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
    const { accountId, ...updateData } = body

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const updateSchema = accountSchema.partial()
    const validatedData = updateSchema.parse(updateData)

    const existingAccount = await prisma.financeAccount.findFirst({
      where: { accountId, userId: session.user.id }
    })

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const account = await prisma.financeAccount.update({
      where: { accountId },
      data: { ...validatedData, updatedAt: new Date() }
    })

    return NextResponse.json(account)
  } catch (error) {
    console.error('Error updating account:', error)
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
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    const account = await prisma.financeAccount.findFirst({
      where: { accountId, userId: session.user.id }
    })

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    await prisma.financeAccount.delete({ where: { accountId } })
    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
