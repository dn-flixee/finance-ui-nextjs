// src/app/api/v1/splitwise/connection/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has valid Splitwise token
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        splitwiseToken: true,
        splitwiseTokenExp: true,
        splitwiseUserId: true
      }
    })

    const isConnected = !!(
      user?.splitwiseToken && 
      user?.splitwiseUserId && 
      user?.splitwiseTokenExp &&
      new Date(user.splitwiseTokenExp) > new Date()
    )

    return NextResponse.json({ 
      isConnected,
      userId: user?.splitwiseUserId,
      tokenExpiry: user?.splitwiseTokenExp
    })
  } catch (error) {
    console.error('Error checking Splitwise connection:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
