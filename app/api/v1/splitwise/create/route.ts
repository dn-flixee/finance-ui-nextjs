// src/app/api/v1/splitwise/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { SplitwiseService } from '@/lib/integrations/splitwise'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { cost, description, details, date, currency_code, group_id, split_equally, users } = body

    if (!cost || !description) {
      return NextResponse.json(
        { error: 'Cost and description are required' },
        { status: 400 }
      )
    }

    const splitwiseService = new SplitwiseService()
    const result = await splitwiseService.createExpense(session.user.id, {
      cost: parseFloat(cost),
      description,
      details,
      date,
      currencyCode: currency_code || 'INR',
      groupId: group_id,
      splitEqually: split_equally,
      users: users ? users.map((u: any) => ({
        userId: u.user_id || u.userId,
        paidShare: parseFloat(u.paid_share || u.paidShare || '0'),
        owedShare: parseFloat(u.owed_share || u.owedShare || '0'),
        firstName: u.first_name || u.firstName,
        lastName: u.last_name || u.lastName,
        email: u.email
      })) : undefined
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('Error creating Splitwise expense:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Splitwise expense' },
      { status: 500 }
    )
  }
}
