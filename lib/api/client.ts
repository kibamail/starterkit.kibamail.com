/**
 * Internal API Client SDK
 *
 * Type-safe SDK for making requests to internal API endpoints.
 * Uses Zod schemas for request/response validation and type inference.
 *
 * @example
 * ```ts
 * import { internalApi } from '@/lib/api/client'
 *
 * // Create workspace
 * const workspace = await internalApi.workspaces().create({
 *   name: 'Acme Corp',
 *   description: 'Main workspace'
 * })
 *
 * // Activate workspace
 * await internalApi.workspaces().activate('org_123')
 * ```
 */

import { ZodError, type ZodType } from "zod";

import {
  type CreateWorkspaceInput,
  type CreateWorkspaceResponse,
  createWorkspaceResponseSchema,
  createWorkspaceSchema,
} from "@/app/api/internal/v1/workspaces/schema";
import {
  type ActivateWorkspaceResponse,
  activateWorkspaceResponseSchema,
} from "@/app/api/internal/v1/workspaces/[id]/activate/schema";
import {
  type InviteMembersInput,
  type InviteMembersResponse,
  inviteMembersResponseSchema,
  inviteMembersSchema,
} from "@/app/api/internal/v1/workspaces/[id]/members/schema";
import {
  type UpdateInvitationStatusInput,
  type UpdateInvitationStatusResponse,
  updateInvitationStatusResponseSchema,
  updateInvitationStatusSchema,
} from "@/app/api/internal/v1/invitations/[id]/status/schema";

type ApiErrorResponse = {
  error: string;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Base HTTP client for making requests
 */
class HttpClient {
  /**
   * Make an HTTP request with validation
   *
   * @param method - HTTP method
   * @param path - API endpoint path
   * @param requestSchema - Zod schema for request validation
   * @param responseSchema - Zod schema for response validation
   * @param data - Request body data
   * @returns Parsed and validated response
   * @throws ZodError if validation fails (422)
   * @throws Error for other failures
   */
  protected async request<TRequest, TResponse>(
    method: string,
    path: string,
    requestSchema: ZodType<TRequest> | null,
    responseSchema: ZodType<TResponse>,
    data?: TRequest
  ): Promise<TResponse> {
    const response = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      ...(data && { body: JSON.stringify(data) }),
    });

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json();

      // Handle validation errors (422) - throw as ZodError
      if (response.status === 422 && errorData.fieldErrors) {
        const issues = Object.entries(errorData.fieldErrors).flatMap(
          ([field, messages]) =>
            messages.map((message) => ({
              code: "custom" as const,
              path: field.split("."),
              message,
            }))
        );

        const zodError = new ZodError(issues);
        throw zodError;
      }

      // Throw regular error for other failures
      throw new Error(errorData.error || "Request failed");
    }

    const json = await response.json();

    // Return response without validation (schema is only for type inference)
    return json as TResponse;
  }
}

/**
 * Invitations API namespace
 */
class InvitationsApi extends HttpClient {
  /**
   * Update invitation status
   *
   * @param invitationId - Invitation ID
   * @param data - Status update data
   * @returns Update invitation status response
   *
   * @example
   * ```ts
   * // Accept invitation
   * await internalApi.invitations().update('inv_123', { status: 'Accepted' })
   *
   * // Revoke invitation
   * await internalApi.invitations().update('inv_123', { status: 'Revoked' })
   * ```
   */
  async update(
    invitationId: string,
    data: UpdateInvitationStatusInput
  ): Promise<UpdateInvitationStatusResponse> {
    return this.request(
      "PUT",
      `/api/internal/v1/invitations/${invitationId}/status`,
      updateInvitationStatusSchema,
      updateInvitationStatusResponseSchema,
      data
    );
  }
}

/**
 * Workspace Members API namespace
 */
class WorkspaceMembersApi extends HttpClient {
  constructor(private workspaceId: string) {
    super();
  }

  /**
   * Invite member to workspace
   *
   * @param data - Invitation data with email and role
   * @returns Invitation result
   * @throws ZodError if validation fails
   *
   * @example
   * ```ts
   * const result = await internalApi.workspaces().members('org_123').invite({
   *   email: 'user@example.com',
   *   role: 'member'
   * })
   * ```
   */
  async invite(data: InviteMembersInput): Promise<InviteMembersResponse> {
    return this.request(
      "POST",
      `/api/internal/v1/workspaces/${this.workspaceId}/members`,
      inviteMembersSchema,
      inviteMembersResponseSchema,
      data
    );
  }
}

/**
 * Workspaces API namespace
 */
class WorkspacesApi extends HttpClient {
  /**
   * Create a new workspace
   *
   * @param data - Workspace creation data
   * @returns Created workspace
   * @throws ZodError if validation fails
   *
   * @example
   * ```ts
   * const workspace = await internalApi.workspaces().create({
   *   name: 'Acme Corp',
   *   description: 'Main workspace'
   * })
   * ```
   */
  async create(data: CreateWorkspaceInput): Promise<CreateWorkspaceResponse> {
    return this.request(
      "POST",
      "/api/internal/v1/workspaces",
      createWorkspaceSchema,
      createWorkspaceResponseSchema,
      data
    );
  }

  /**
   * Activate (switch to) a workspace
   *
   * @param id - Workspace ID
   * @returns Success response
   *
   * @example
   * ```ts
   * await internalApi.workspaces().activate('org_123')
   * // Workspace is now active (cookie is set)
   * ```
   */
  async activate(id: string): Promise<ActivateWorkspaceResponse> {
    return this.request(
      "POST",
      `/api/internal/v1/workspaces/${id}/activate`,
      null,
      activateWorkspaceResponseSchema
    );
  }

  /**
   * Access workspace members API
   *
   * @param workspaceId - Workspace ID
   * @returns WorkspaceMembersApi instance
   *
   * @example
   * ```ts
   * await internalApi.workspaces().members('org_123').invite({
   *   email: 'user@example.com',
   *   role: 'member'
   * })
   * ```
   */
  members(workspaceId: string) {
    return new WorkspaceMembersApi(workspaceId);
  }
}

/**
 * Internal API SDK
 *
 * Provides namespaced, type-safe methods for all internal API endpoints.
 */
export class InternalApi {
  private _workspaces: WorkspacesApi;
  private _invitations: InvitationsApi;

  constructor() {
    this._workspaces = new WorkspacesApi();
    this._invitations = new InvitationsApi();
  }

  /**
   * Access workspaces API
   *
   * @returns WorkspacesApi instance
   *
   * @example
   * ```ts
   * const workspace = await internalApi.workspaces().create({ name: 'Acme' })
   * ```
   */
  workspaces() {
    return this._workspaces;
  }

  /**
   * Access invitations API
   *
   * @returns InvitationsApi instance
   *
   * @example
   * ```ts
   * await internalApi.invitations().update('inv_123', { status: 'Accepted' })
   * ```
   */
  invitations() {
    return this._invitations;
  }
}

/**
 * Singleton instance of InternalApi SDK
 *
 * @example
 * ```ts
 * import { internalApi } from '@/lib/api/client'
 *
 * const workspace = await internalApi.workspaces().create({
 *   name: 'Acme Corp'
 * })
 * ```
 */
export const internalApi = new InternalApi();
