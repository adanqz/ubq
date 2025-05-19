
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/', // Home page
  '/explore(.*)', // Explore page and its subpaths
  '/ubq/:id*', // Ubq detail pages
  '/sign-in(.*)', // Sign-in page and its subpaths
  '/sign-up(.*)', // Sign-up page and its subpaths
  '/api/:path*', // Allow API routes
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
