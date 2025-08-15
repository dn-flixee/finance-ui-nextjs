import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformAccount } from '@/lib/transformers'
import { z } from 'zod'

const accountSchema = z.object({
  name: z.string().min(1).optional(),
  startingBalance: z.number().optional(),
  type: z.number().optional()
})

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = parseInt(params.id)
    const account = await prisma.account.findUnique({
      where: { accountId }
    })
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }
    
    return NextResponse.json(transformAccount(account))
  } catch (error) {
    console.error('Error fetching account:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = parseInt(params.id)
    const body = await request.json()
    const validatedData = accountSchema.parse(body)
    
    const account = await prisma.account.update({
      where: { accountId },
      data: validatedData
    })
    
    return NextResponse.json(transformAccount(account))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error updating account:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accountId = parseInt(params.id)
    
    await prisma.account.delete({
      where: { accountId }
    })
    
    return NextResponse.json({ message: 'Account deleted Successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}