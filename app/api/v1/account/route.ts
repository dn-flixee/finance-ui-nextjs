import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformAccount } from '@/lib/transformers'
import { z } from 'zod'

const accountSchema = z.object({
  name: z.string().min(1),
  startingBalance: z.number(),
  type: z.number().optional()
})

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { accountId: 'asc' }
    })
    
    return NextResponse.json(accounts.map(transformAccount))
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = accountSchema.parse(body)
    
    const account = await prisma.account.create({
      data: {
        name: validatedData.name,
        startingBalance: validatedData.startingBalance,
        type: validatedData.type || null
      }
    })
    
    return NextResponse.json(transformAccount(account), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating account:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}