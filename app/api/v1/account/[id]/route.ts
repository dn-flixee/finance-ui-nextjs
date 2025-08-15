import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateAccountSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  startingBalance: z.number().optional(),
  type: z.number().optional(),
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
    const validatedData = updateAccountSchema.parse(body)
    
    const account = await prisma.financeAccount.update({
      where: { 
        accountId: parseInt(params.id),
        userId: session.user.id // Ensure user owns this account
      },
      data: validatedData
    })

    const transformedAccount = {
      accountId: account.accountId,
      name: account.name,
      startingBalance: account.startingBalance,
      type: account.type
    }

    return NextResponse.json(transformedAccount)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating account:', error)
    return NextResponse.json(
      { error: 'Failed to update account' },
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

    await prisma.financeAccount.delete({
      where: { 
        accountId: parseInt(params.id),
        userId: session.user.id // Ensure user owns this account
      }
    })

    return NextResponse.json({ message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
