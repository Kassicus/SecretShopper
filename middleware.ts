import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Protected routes
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/family") ||
      pathname.startsWith("/profile") || pathname.startsWith("/wishlist") ||
      pathname.startsWith("/groups")) {
    if (!isLoggedIn) {
      return Response.redirect(new URL("/login", req.url));
    }
  }

  // Redirect logged-in users from auth pages
  if ((pathname.startsWith("/login") || pathname.startsWith("/register")) && isLoggedIn) {
    return Response.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
