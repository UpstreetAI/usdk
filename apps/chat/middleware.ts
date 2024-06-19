// NEXT AUTH (DEFAULT) COMMENTED OUT

// import NextAuth from 'next-auth'
// import { authConfig } from './auth.config'

// export default NextAuth(authConfig).auth

// export const config = {
//   matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)']
// }

// SUPABASE AUTH ADDED.

import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

export default NextAuth(authConfig).auth

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
