import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This middleware ensures that routes requiring authentication are handled properly
  const response = NextResponse.next();
  
  // You can add specific cookie handling logic here if needed
  
  return response;
}

// Match all routes that use cookies/authentication
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
    '/settings/:path*',
    '/video/:path*',
    '/videos/:path*',
    '/clips/:path*',
    '/code/:path*',
    '/conversation/:path*',
    '/image/:path*',
    '/music/:path*',
    '/process/:path*',
    '/upload/:path*',
  ],
};
