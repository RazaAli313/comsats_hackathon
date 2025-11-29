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
    const res = await fetch(`${apiBase}/api/auth/me`, { credentials: 'include', headers: { accept: 'application/json' } })
    if (res.ok) {
      return NextResponse.next()
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
