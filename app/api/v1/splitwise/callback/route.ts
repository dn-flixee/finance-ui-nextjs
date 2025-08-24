// src/app/api/splitwise/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { SplitwiseService } from '@/lib/integrations/splitwise'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state') // Optional: for CSRF protection

  console.log('Splitwise callback received:', { code: !!code, error, state })

  if (error) {
    console.error('Splitwise OAuth error:', error)
    return NextResponse.redirect(new URL('/splitwise?error=splitwise_auth_failed', request.url))
  }

  if (!code) {
    console.error('No authorization code received')
    return NextResponse.redirect(new URL('/splitwise?error=no_auth_code', request.url))
  }

  try {
    // Get the current session
    const session = await getServerSession(authOptions)
    
    console.log('Session in callback:', { hasSession: !!session, userId: session?.user?.id })
    
    if (!session?.user?.id) {
      console.error('No authenticated session found in callback')
      // Redirect to login with callback URL to return here after login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.url.toString())
      return NextResponse.redirect(loginUrl)
    }

    console.log('Processing Splitwise authentication for user:', session.user.id)

    const splitwiseService = new SplitwiseService()
    await splitwiseService.authenticateUser(code, session.user.id)

    console.log('Splitwise authentication successful')

    return NextResponse.redirect(new URL('/splitwise?success=connected', request.url))

  } catch (error) {
    console.error('Splitwise auth callback error:', error)
    return NextResponse.redirect(new URL('/splitwise?error=splitwise_connection_failed', request.url))
  }
}
