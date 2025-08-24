// middleware.ts
import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/dashboard", "/account", "/expense", "/income", "/transfer"]
const publicRoutes = ["/login", "/register", "/api/auth", "/api/splitwise/callback"] // ✅ Add callback to public routes

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip middleware for public routes and API auth routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Only run on protected routes
  if (!protectedRoutes.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: process.env.NODE_ENV === "production" 
        ? "__Secure-next-auth.session-token" 
        : "next-auth.session-token"
    })
    
    if (!token) {
      const loginUrl = new URL("/login", req.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
    
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/account/:path*", 
    "/expense/:path*",
    "/income/:path*", 
    "/transfer/:path*"
  ]
}
