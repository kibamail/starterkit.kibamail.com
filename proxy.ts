import { getLogtoContext } from "@logto/next/server-actions";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logtoConfig } from "./config/logto";
import { CookieKey, Cookies } from "./lib/cookies";

export default async function proxy(request: NextRequest) {
  const { isAuthenticated } = await getLogtoContext(logtoConfig);

  if (isAuthenticated) return NextResponse.next();

  await Cookies.set(CookieKey.ROUTE_INTENDED, request.url);

  return NextResponse.redirect(new URL("/api/auth/signin", request.url));
}

export const config = {
  matcher: ["/w/:path*", "/invitations"],
};
