import { NextRequest, NextResponse } from 'next/server'

const ACCESS_COOKIE = 'drive_preview_access'
const PUBLIC_FILE = /\.(.*)$/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/api/preview-login') ||
    pathname.startsWith('/api/preview-access-request') ||
    pathname.startsWith('/api/preview-access-approve') ||
    pathname.startsWith('/_next') ||
    PUBLIC_FILE.test(pathname)

  if (isPublicRoute) {
    return NextResponse.next()
  }

  const hasAccess = request.cookies.get(ACCESS_COOKIE)?.value === 'granted'
  if (hasAccess) {
    return NextResponse.next()
  }

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/'
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
