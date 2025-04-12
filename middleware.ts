import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isProtectedRoute = (pathname: string): boolean => {
  const protectedRoutes = [
    '/dashboard',
    '/upload',
    '/videos',
    '/process',
    '/transcription',
    '/clips',
    '/settings',
    '/api/videos',
    '/api/clips',
    '/api/transcription',
    '/api/stripe',
    '/api/webhooks'
  ];
  
  return protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const pathname = req.nextUrl.pathname;
  
  // Check if it's a protected route
  if (isProtectedRoute(pathname)) {
    const { data: { session } } = await supabase.auth.getSession();
    
    // Redirect to sign-in if no session
    if (!session) {
      const redirectUrl = new URL('/sign-in', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return res;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
