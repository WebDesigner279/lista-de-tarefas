import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME =
  process.env.SESSION_COOKIE_NAME?.trim() || "task_session";

const AUTH_ROUTES = new Set([
  "/login",
  "/cadastro",
  "/recuperar-acesso",
  "/redefinir-acesso",
  "/validar-acesso",
]);

const PROTECTED_ROUTES = [
  "/dashboard",
  "/home",
  "/perfil",
  "/configuracoes",
] as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (
    PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) &&
    !hasSessionCookie
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (AUTH_ROUTES.has(pathname) && hasSessionCookie) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/dashboard/:path*",
    "/perfil/:path*",
    "/configuracoes/:path*",
    "/login",
    "/cadastro",
    "/recuperar-acesso",
    "/redefinir-acesso",
    "/validar-acesso",
  ],
};
