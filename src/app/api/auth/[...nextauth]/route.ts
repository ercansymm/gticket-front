import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/api-helpers";

const handler = NextAuth(authOptions);

async function rateLimitedPOST(request: Request) {
  const rateLimitResponse = checkRateLimit(request, 10, 60_000); // 10 deneme/dakika
  if (rateLimitResponse) return rateLimitResponse;
  return (handler as Function)(request);
}

export { handler as GET };
export { rateLimitedPOST as POST };
