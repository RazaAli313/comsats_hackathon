import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protect these paths; others remain public
const PROTECTED = ['/cart', '/checkout', '/admin']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const shouldProtect = PROTECTED.some(p => pathname.startsWith(p))
  if (!shouldProtect) return NextResponse.next()

  // call backend to verify session using cookies
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'
  try {
    // Forward the incoming cookies to the backend so the auth check can validate the session.
    const cookieHeader = req.headers.get('cookie') || ''
    const res = await fetch(`${apiBase}/api/auth/me`, { headers: { accept: 'application/json', cookie: cookieHeader } })
    if (res.ok) {
      // If accessing admin routes, ensure the user has admin role
      if (pathname.startsWith('/admin')) {
        try {
          const data = await res.json()
          if (data && data.role === 'admin') return NextResponse.next()
          // Not an admin — redirect to login (or could redirect to home/403)
        } catch (e) {
          // fall through to redirect
        }
      } else {
        return NextResponse.next()
      }
    }
  } catch (err) {
    // ignore and redirect
  }

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/cart/:path*', '/checkout/:path*', '/admin/:path*'],
}
