import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/imam') || 
                           req.nextUrl.pathname.startsWith('/admin') ||
                           req.nextUrl.pathname.startsWith('/session');
                           
  if (isProtectedRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
  
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL('/imam', req.nextUrl));
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
