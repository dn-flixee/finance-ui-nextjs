// src/app/api/v1/rules/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { CategorizationService } from '@/services/categorization.service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const service = new CategorizationService()
    const rules = await service.getRules(session.user.id)

    return NextResponse.json({ rules })
  } catch (error: any) {
    console.error('Fetch rules error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch rules' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (!body.matchPattern) {
      return NextResponse.json({ error: 'matchPattern is required' }, { status: 400 })
    }

    const service = new CategorizationService()
    const rule = await service.createRule(session.user.id, body)

    return NextResponse.json({ success: true, rule }, { status: 201 })
  } catch (error: any) {
    console.error('Create rule error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create rule' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('ruleId')

    if (!ruleId) {
      return NextResponse.json({ error: 'ruleId is required' }, { status: 400 })
    }

    const service = new CategorizationService()
    await service.deleteRule(ruleId, session.user.id)

    return NextResponse.json({ success: true, message: 'Rule deleted successfully' })
  } catch (error: any) {
    console.error('Delete rule error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete rule' },
      { status: 500 }
    )
  }
}
