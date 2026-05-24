import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Middleware usa solo la config Edge-safe (senza Prisma)
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
