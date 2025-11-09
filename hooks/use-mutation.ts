"use client";

import { useToast } from "@kibamail/owly/toast";
import {
  useMutation as useReactQueryMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";

/**
 * Custom useMutation hook with automatic error handling
 *
 * Wraps React Query's useMutation and adds default error handling:
 * - Skips ZodError (validation errors should be handled in forms)
 * - Shows toast notification for generic errors with messages
 *
 * @example
 * ```tsx
 * const mutation = useMutation({
 *   mutationFn: async (data) => {
 *     return api.createUser(data);
 *   },
 *   onSuccess: (data) => {
 *     console.log('User created:', data);
 *   },
 *   // onError is optional - default handler will show toast
 *   // You can override it for custom error handling
 * });
 * ```
 */
export function useMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { error: toast } = useToast();

  return useReactQueryMutation({
    ...options,
    onError(error, ...rest) {
      const unknownError = error as unknown as Error & { error: string };

      if (unknownError.message || unknownError.error) {
        toast(unknownError.message || unknownError.error);
      }

      if (options.onError) {
        options?.onError(error, ...rest);
      }
    },
  });
}
