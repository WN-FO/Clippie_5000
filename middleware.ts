import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/upload(.*)',
  '/videos(.*)',
  '/process(.*)',
  '/transcription(.*)',
  '/clips(.*)',
  '/settings(.*)',
  '/api/videos(.*)',
  '/api/clips(.*)',
  '/api/transcription(.*)',
  '/api/stripe(.*)',
  '/api/webhooks(.*)'
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
