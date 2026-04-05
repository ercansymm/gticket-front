import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/api-helpers";

const handler = NextAuth(authOptions);

// Next.js 16 App Router: catch-all route handler receives (request, context)
// context.params contains the [...nextauth] slug — MUST be forwarded to NextAuth
async function rateLimitedPOST(
  request: Request,
  context: { params: Promise<{ nextauth: string[] }> },
) {
  const rateLimitResponse = checkRateLimit(request, 10, 60_000); // 10 deneme/dakika
  if (rateLimitResponse) return rateLimitResponse;
  return (handler as Function)(request, context);
}

async function GET(
  request: Request,
  context: { params: Promise<{ nextauth: string[] }> },
) {
  return (handler as Function)(request, context);
}

export { GET, rateLimitedPOST as POST };
