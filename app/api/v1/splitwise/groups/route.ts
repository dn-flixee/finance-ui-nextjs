// src/app/api/v1/splitwise/groups/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { SplitwiseService } from '@/lib/integrations/splitwise'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const splitwiseService = new SplitwiseService()
    const groups = await splitwiseService.getGroups(session.user.id)

    return NextResponse.json({ groups })
  } catch (error: any) {
    console.error('Fetch Splitwise groups error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Splitwise groups' },
      { status: 500 }
    )
  }
}
