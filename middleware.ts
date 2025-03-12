import { NextRequest, NextResponse } from "next/server";
export { default } from "next-auth/middleware"
import { getToken } from "next-auth/jwt"; 

export async function middleware(request: NextRequest){

    const token = await getToken({req:request})
    const url = request.nextUrl

    if(token && 
        (
            url.pathname === '/sign-in'
            || url.pathname === '/signup'
        )
    ){
        return NextResponse.redirect('/')
    }
    return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
    matcher: [
        "/",
        "/account",
        "/transfer",
        "/income",
        "/expense",
        '/login',
        '/signup'
    ],
};