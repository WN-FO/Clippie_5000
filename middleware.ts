import { createServerClient } from '@supabase/ssr';
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
  
  // Create a new supabase server client with the middleware's cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
  
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
