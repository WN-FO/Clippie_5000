import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Add cache control headers to prevent issues with white screens
  const res = NextResponse.next();
  
  // Set cache control headers to prevent aggressive caching
  res.headers.set("Cache-Control", "no-store, must-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  
  // Add the Vary header to ensure proper content negotiation
  res.headers.set("Vary", "Accept, Accept-Encoding, Cookie, User-Agent");
  
  // Make sure content type is properly recognized
  res.headers.set("X-Content-Type-Options", "nosniff");
  
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
