import NextAuth from "next-auth";
import { authEdgeConfig } from "./auth.edge.config";

const { auth } = NextAuth(authEdgeConfig);

export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
