import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { SplitwiseService } from '@/lib/integrations/splitwise'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/dashboard?error=splitwise_auth_failed', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=no_auth_code', request.url))
  }

  try {
    const supabase = createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const splitwiseService = new SplitwiseService()
    await splitwiseService.authenticateUser(code, user.id)

    return NextResponse.redirect(new URL('/dashboard/splitwise?success=connected', request.url))

  } catch (error) {
    console.error('Splitwise auth callback error:', error)
    return NextResponse.redirect(new URL('/dashboard?error=splitwise_connection_failed', request.url))
  }
}
