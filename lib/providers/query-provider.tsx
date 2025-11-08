/**
 * React Query Provider
 *
 * Wraps the application with TanStack Query (React Query) for data fetching,
 * caching, and state management.
 *
 * @see https://tanstack.com/query/latest
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Query Provider Component
 *
 * Creates and provides a QueryClient instance to the component tree.
 * The client is created once per component mount to avoid sharing
 * state between different users in server-side rendering.
 *
 * @param props.children - Child components that will have access to React Query
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * import { QueryProvider } from '@/lib/providers/query-provider'
 *
 * export default function Layout({ children }) {
 *   return (
 *     <QueryProvider>
 *       {children}
 *     </QueryProvider>
 *   )
 * }
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new QueryClient instance for each component mount
  // This prevents sharing state between different users on the server
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // defaultOptions: {
        //   queries: {
        //     // Disable automatic refetching on window focus in development
        //     refetchOnWindowFocus: process.env.NODE_ENV === "production",
        //     // Retry failed requests once
        //     retry: 1,
        //     // Cache data for 5 minutes
        //     staleTime: 5 * 60 * 1000,
        //   },
        // },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
