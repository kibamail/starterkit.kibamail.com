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
import { UnauthorizedError } from "../api/errors";
import { ROLES, type Permission } from "@/config/rbac";

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
  permissions: Permission[];
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
export async function getSession(): Promise<UserSession> {
  try {
    const ctx = await getLogtoContext(logtoConfig, {
      fetchUserInfo: true,
    });

    console.dir(ctx);

    if (!ctx.isAuthenticated) {
      throw new UnauthorizedError("User is not authenticated");
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

    // Extract permissions based on user's role(s) in current organization
    const permissions: Permission[] = [];

    if (currentOrganization && ctx.userInfo.organization_roles) {
      // Filter roles for current organization (format: "orgId:roleName")
      const currentOrgRoles = ctx.userInfo.organization_roles
        .filter((roleStr) => roleStr.startsWith(`${currentOrganization.id}:`))
        .map((roleStr) => roleStr.split(":")[1]); // Extract role name

      // Map role names to permissions from RBAC config
      for (const roleName of currentOrgRoles) {
        const role = ROLES.find((r) => r.name === roleName);
        if (role) {
          permissions.push(...(role.permissions as Permission[]));
        }
      }
    }

    // Deduplicate permissions
    const uniquePermissions = Array.from(new Set(permissions));

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
      permissions: uniquePermissions,
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
