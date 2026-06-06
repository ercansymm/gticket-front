import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PROTECTED_PATHS = ["/favoriler"];

export async function middleware(request: NextRequest) {
  // Canonical host + HTTPS redirect in production.
  // Canonical is https://www.atabilet.com (see layout.tsx alternates), so force
  // both https AND the www host. Without the apex->www 301, atabilet.com and
  // www.atabilet.com resolve as two URLs and split SEO signals.
  if (process.env.NODE_ENV === "production") {
    const needsHttps = request.headers.get("x-forwarded-proto") !== "https";
    const needsWww = request.headers.get("host") === "atabilet.com";
    if (needsHttps || needsWww) {
      const url = new URL(request.url);
      url.protocol = "https:";
      if (needsWww) url.hostname = "www.atabilet.com";
      return NextResponse.redirect(url, 301);
    }
  }

  // Auth protection for specific routes
  const isProtected = PROTECTED_PATHS.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  );
  if (isProtected) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/giris", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // Security headers (supplement next.config.ts headers)
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
  );

  // Content Security Policy
  const cspHeader = [
    "default-src 'self'",
    process.env.NODE_ENV === 'development'
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://static.cloudflareinsights.com"
      : "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://cloudflareinsights.com",
    "frame-src 'self' https://pay3dstage.biletbank.com https://pay3d.biletbank.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "SAMEORIGIN");

  // Prevent search engines from indexing non-production environments
  if (
    process.env.NEXT_PUBLIC_SITE_URL &&
    !process.env.NEXT_PUBLIC_SITE_URL.includes("atabilet.com")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|assets/).*)",
  ],
};
