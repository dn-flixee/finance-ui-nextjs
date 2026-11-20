// src/app/api/v1/splitwise/friends/route.ts
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
    const rawFriends = await splitwiseService.getFriends(session.user.id)

    const friends = (rawFriends || []).map((f: any) => ({
      id: f.id.toString(),
      name: `${f.first_name || ''} ${f.last_name || ''}`.trim() || 'Friend',
      email: f.email,
      picture: f.picture?.medium || f.picture?.small,
      balance: f.balance
    }))

    return NextResponse.json({ friends })
  } catch (error: any) {
    console.error('Fetch Splitwise friends error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch Splitwise friends' },
      { status: 500 }
    )
  }
}
