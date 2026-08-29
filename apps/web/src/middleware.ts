import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { method, nextUrl } = request;
  if (
    !nextUrl.pathname.startsWith('/_next') &&
    !nextUrl.pathname.startsWith('/favicon.ico') &&
    !nextUrl.pathname.match(/\.(png|jpg|jpeg|svg|css|js)$/)
  ) {
    console.log(`[WEB FRONTEND] ${method} ${nextUrl.pathname}${nextUrl.search}`);
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
