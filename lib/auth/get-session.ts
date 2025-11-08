/**
 * Server-Side Session Helper
 *
 * Centralized function to retrieve authenticated user and organization data
 * from Logto. This eliminates repetitive Logto API calls across server components.
 *
 * @example
 * ```tsx
 * // In a server component
 * import { getSession } from '@/lib/auth/get-session'
 *
 * export default async function Page() {
 *   const session = await getSession()
 *   return <div>Welcome {session.user.email}</div>
 * }
 * ```
 */

"use server";

import { getLogtoContext } from "@logto/next/server-actions";
import { redirect } from "next/navigation";

import { logtoConfig } from "@/config/logto";
import { Cookies, CookieKey } from "@/lib/cookies";
import type { IdTokenClaims } from "@logto/node";

export type UserSession = {
  user: {
    sub: string;
    email: string;
    emailVerified?: boolean;
    name?: string | null;
    picture?: string | null;
    username?: string | null;
  };
  claims: IdTokenClaims | undefined;
  organizations: Array<{
    id: string;
    name: string;
    description: string | null;
  }>;
  currentOrganization: {
    id: string;
    name: string;
    description: string | null;
  } | null;
};

/**
 * Get the current authenticated user session
 *
 * Fetches user info and organization data from Logto. If the user is not
 * authenticated, automatically redirects to /api/auth/signin which initiates
 * the Logto sign-in flow.
 *
 * @param options.redirectIfUnauthenticated - Whether to redirect if not authenticated (default: true)
 * @returns User session data including user info and organizations
 * @throws Redirects to /api/auth/signin if user is not authenticated (when redirectIfUnauthenticated is true)
 *
 * @example
 * ```tsx
 * const session = await getSession()
 * console.log(session.user.email) // "user@example.com"
 * console.log(session.currentOrganization?.name) // "Acme Corp"
 * ```
 */
export async function getSession(
  options: { redirectIfUnauthenticated?: boolean } = {}
): Promise<UserSession> {
  try {
    const { redirectIfUnauthenticated = true } = options;

    const ctx = await getLogtoContext(logtoConfig, {
      fetchUserInfo: true,
    });

    if (!ctx.isAuthenticated) {
      // if (redirectIfUnauthenticated) {
      //   // Redirect to API route that handles Logto sign-in
      //   // API routes can modify cookies, unlike Server Components
      //   redirect("/api/auth/signin");
      // }
      throw new Error("User is not authenticated");
    }

    if (!ctx.userInfo?.sub || !ctx.userInfo?.email) {
      throw new Error("User information is incomplete");
    }

    const organizations =
      ctx.userInfo.organization_data?.map((org) => ({
        id: org.id,
        name: org.name,
        description: org.description,
      })) || [];

    const activeWorkspaceId = await Cookies.get(CookieKey.ACTIVE_WORKSPACE_ID);

    let currentOrganization: UserSession["currentOrganization"] = null;

    if (activeWorkspaceId) {
      currentOrganization =
        organizations.find((org) => org.id === activeWorkspaceId) || null;
    }

    if (!currentOrganization && organizations.length > 0) {
      currentOrganization = organizations[0];
    }

    return {
      user: {
        sub: ctx.userInfo.sub,
        email: ctx.userInfo.email,
        emailVerified: ctx.userInfo.email_verified,
        name: ctx.userInfo.name ?? null,
        picture: ctx.userInfo.picture ?? null,
        username: ctx.userInfo.username ?? null,
      },
      claims: ctx.claims,
      organizations,
      currentOrganization,
    };
  } catch (error) {
    console.error(error);
    redirect("/");
  }
}

/**
 * Check if the current user is authenticated
 *
 * Lightweight function to check authentication status without fetching
 * full user info. Useful for conditional rendering or route guards.
 *
 * @returns Boolean indicating if user is authenticated
 *
 * @example
 * ```tsx
 * const isAuth = await isAuthenticated()
 * if (!isAuth) {
 *   redirect('/login')
 * }
 * ```
 */
export async function isAuthenticated(): Promise<boolean> {
  const ctx = await getLogtoContext(logtoConfig);
  return ctx.isAuthenticated;
}
