import { getToken }     from "next-auth/jwt"
import { NextResponse } from "next/server"

const protectedRoutes = ["/dashboard", "/account", "/expense", "/income", "/transfer"]

export async function middleware(req: Request) {
  const { pathname } = new URL(req.url)
  if (!protectedRoutes.some(p => pathname.startsWith(p))) return

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  if (!token) return NextResponse.redirect(new URL("/login", req.url))
}

export const config = { matcher: ["/dashboard/:path*", "/account/:path*", "/expense/:path*",
                                   "/income/:path*", "/transfer/:path*"] }
