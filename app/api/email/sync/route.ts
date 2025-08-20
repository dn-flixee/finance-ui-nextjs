import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EmailService } from '@/services/email.service'

export async function POST(request: NextRequest) {
  try {
    const { emailProvider, accessToken } = await request.json()
    
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const emailService = new EmailService()
    const result = await emailService.syncEmails(user.id, emailProvider, accessToken)

    return NextResponse.json({ 
      success: true, 
      processed: result.processed,
      skipped: result.skipped,
      errors: result.errors 
    })

  } catch (error) {
    console.error('Email sync error:', error)
    return NextResponse.json(
      { error: 'Failed to sync emails' }, 
      { status: 500 }
    )
  }
}