import createMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";
const intl = createMiddleware(routing);
const { auth } = NextAuth(authConfig);
export default auth((request) => {
  const { pathname } = request.nextUrl;
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
  const devEval = process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}'${devEval} 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'`;
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", csp);
  let response: NextResponse;
  if (pathname === "/admin/login") response = NextResponse.next({ request });
  else if (pathname.startsWith("/admin")) {
    if (!request.auth?.user) response = NextResponse.redirect(new URL("/admin/login", request.url));
    else response = NextResponse.next({ request });
  } else response = intl(request);
  response.headers.set("Content-Security-Policy", csp);
  return response;
});
export const config = { matcher: ["/((?!api|_next|.*\\..*).*)"] };
