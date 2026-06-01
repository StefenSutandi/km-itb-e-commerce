import { auth } from "@/auth"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const isProfileCompleted = req.auth?.user?.profileCompleted
  const isAdmin = req.auth?.user?.role === "ADMIN" || req.auth?.user?.role === "SUPERADMIN"

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register")
  const isAccountRoute = nextUrl.pathname.startsWith("/account")
  const isAdminRoute = nextUrl.pathname.startsWith("/admin")
  const isCompleteProfileRoute = nextUrl.pathname === "/complete-profile"

  // Allow API auth routes
  if (isApiAuthRoute) return

  // Redirect logged-in users away from auth routes
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(isProfileCompleted ? "/products" : "/complete-profile", nextUrl))
    }
    return
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!isLoggedIn && (isAccountRoute || isAdminRoute || isCompleteProfileRoute)) {
    let callbackUrl = nextUrl.pathname
    if (nextUrl.search) {
      callbackUrl += nextUrl.search
    }
    const encodedCallbackUrl = encodeURIComponent(callbackUrl)
    return Response.redirect(new URL(`/login?callbackUrl=${encodedCallbackUrl}`, nextUrl))
  }

  if (isLoggedIn) {
    // Redirect incomplete profiles to completion page
    if (!isProfileCompleted && !isCompleteProfileRoute) {
      return Response.redirect(new URL("/complete-profile", nextUrl))
    }
    // Prevent completed profiles from accessing completion page
    if (isProfileCompleted && isCompleteProfileRoute) {
      return Response.redirect(new URL("/products", nextUrl))
    }
    // Prevent non-admins from accessing admin routes
    if (isAdminRoute && !isAdmin) {
      return Response.redirect(new URL("/", nextUrl))
    }
  }

  return
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
