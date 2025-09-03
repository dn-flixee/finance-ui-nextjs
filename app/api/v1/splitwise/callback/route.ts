// src/app/api/v1/splitwise/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import axios from 'axios'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    console.log('Callback received:', { 
      code: code ? 'present' : 'missing',
      error,
      fullUrl: request.url 
    })

    if (error) {
      return NextResponse.redirect(new URL(`/splitwise?error=${error}`, request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/splitwise?error=missing_code', request.url))
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    // Token exchange
    const formData = new URLSearchParams()
    formData.append('client_id', process.env.SPLITWISE_CLIENT_ID!)
    formData.append('client_secret', process.env.SPLITWISE_CLIENT_SECRET!)
    formData.append('grant_type', 'authorization_code')
    formData.append('code', code)
    formData.append('redirect_uri', `${new URL(request.url).origin}/api/v1/splitwise/callback`)

    console.log('Token exchange attempt:', {
      url: 'https://secure.splitwise.com/oauth/token',
      clientId: process.env.SPLITWISE_CLIENT_ID ? 'present' : 'missing',
      redirectUri: `${new URL(request.url).origin}/api/v1/splitwise/callback`
    })

    const tokenResponse = await axios.post(
      'https://secure.splitwise.com/oauth/token',
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'YourApp/1.0'
        },
        timeout: 15000,
      }
    )

    const { access_token, token_type, expires_in } = tokenResponse.data
    console.log('Token received successfully')

    // Verify token and get user info
    const userResponse = await axios.get(
      'https://secure.splitwise.com/api/v3.0/get_current_user',
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const splitwiseUser = userResponse.data.user
    console.log('Splitwise user verified:', {
      id: splitwiseUser.id,
      email: splitwiseUser.email
    })

    // Calculate token expiration
    const expiresAt = expires_in 
      ? new Date(Date.now() + expires_in * 1000) 
      : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year default

    // Store in database - now with correct field names
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        splitwiseToken: access_token,
        splitwiseTokenType: token_type || 'Bearer',
        splitwiseTokenExp: expiresAt,
        splitwiseUserId: splitwiseUser.id.toString(),
        splitwiseUserEmail: splitwiseUser.email,
      }
    })

    console.log('User updated successfully with Splitwise credentials')

    return NextResponse.redirect(new URL('/splitwise?connected=true', request.url))

  } catch (error: any) {
    console.error('OAuth Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
    })
    
    return NextResponse.redirect(
      new URL(`/splitwise?error=token_exchange_failed&details=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}
