import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { AccountType } from '@/lib/types'

const createAccountSchema = z.object({
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

    const accounts = await prisma.financeAccount.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    // Transform to match frontend expectations
    const transformedAccounts = accounts.map(account => ({
      accountId: account.accountId,
      name: account.name,
      startingBalance: account.balance,
      type: account.accountType
    }))

    return NextResponse.json(transformedAccounts)
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAccountSchema.parse(body)
    
    const account = await prisma.financeAccount.create({
      data: {
        ...validatedData,
        userId: session.user.id
      }
    })

    const transformedAccount = {
      accountId: account.accountId,
      name: account.name,
      startingBalance: account.balance,
      type: account.accountType
    }

    return NextResponse.json(transformedAccount, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating account:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
