// src/app/api/splitwise/connection/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        splitwiseToken: true,
        splitwiseTokenExp: true
      }
    })

    const isConnected = !!(
      user?.splitwiseToken && 
      user?.splitwiseTokenExp && 
      new Date() < new Date(user.splitwiseTokenExp)
    )

    return NextResponse.json({ isConnected })

  } catch (error) {
    console.error('Splitwise connection check error:', error)
    return NextResponse.json(
      { error: 'Failed to check Splitwise connection' }, 
      { status: 500 }
    )
  }
}
