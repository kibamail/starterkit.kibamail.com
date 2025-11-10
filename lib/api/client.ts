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
import {
  type CreateApiKeyInput,
  type CreateApiKeyResponse,
  type ListApiKeysResponse,
  type DeleteApiKeyResponse,
  createApiKeyResponseSchema,
  createApiKeySchema,
  listApiKeysResponseSchema,
  deleteApiKeyResponseSchema,
} from "@/app/api/internal/v1/api-keys/schema";
import {
  type CreateWebhookDestinationInput,
  type UpdateWebhookDestinationInput,
  createWebhookDestinationSchema,
  updateWebhookDestinationSchema,
} from "@/app/api/internal/v1/webhooks/schema";

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
 * Workspace Invitations API namespace
 */
class WorkspaceInvitationsApi extends HttpClient {
  /**
   * Cancel an organization invitation
   *
   * @param invitationId - ID of the invitation to cancel
   * @returns Empty response on success
   *
   * @example
   * ```ts
   * await internalApi.workspaces().invitations().cancel('inv_123')
   * ```
   */
  async cancel(invitationId: string): Promise<void> {
    await fetch(`/api/internal/v1/invitations/${invitationId}`, {
      method: "DELETE",
    });
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

  /**
   * Access workspace invitations API
   *
   * @returns WorkspaceInvitationsApi instance
   *
   * @example
   * ```ts
   * await internalApi.workspaces().invitations().cancel('inv_123')
   * ```
   */
  invitations() {
    return new WorkspaceInvitationsApi();
  }
}

/**
 * Webhooks API namespace
 */
class WebhooksApi extends HttpClient {
  /**
   * Create a new webhook destination
   *
   * @param data - Webhook destination data with type, credentials, and config
   * @returns Created webhook destination
   * @throws ZodError if validation fails
   *
   * @example
   * ```ts
   * const webhook = await internalApi.webhooks().create({
   *   type: 'webhook',
   *   credentials: { url: 'https://example.com/webhook' },
   *   config: {},
   *   topics: ['user.created']
   * })
   * ```
   */
  async create(data: CreateWebhookDestinationInput): Promise<any> {
    return this.request(
      "POST",
      "/api/internal/v1/webhooks",
      createWebhookDestinationSchema,
      {} as any,
      data
    );
  }

  /**
   * Update a webhook destination
   *
   * @param webhookId - ID of the webhook to update
   * @param data - Updated webhook data
   * @returns Updated webhook destination
   * @throws ZodError if validation fails
   *
   * @example
   * ```ts
   * await internalApi.webhooks().update('dest_123', {
   *   credentials: { url: 'https://newurl.com/webhook' }
   * })
   * ```
   */
  async update(webhookId: string, data: UpdateWebhookDestinationInput): Promise<any> {
    return this.request(
      "PATCH",
      `/api/internal/v1/webhooks/${webhookId}`,
      updateWebhookDestinationSchema,
      {} as any,
      data
    );
  }

  /**
   * Delete a webhook destination
   *
   * @param webhookId - ID of the webhook to delete
   * @returns Empty response on success
   *
   * @example
   * ```ts
   * await internalApi.webhooks().delete('dest_123')
   * ```
   */
  async delete(webhookId: string): Promise<void> {
    await fetch(`/api/internal/v1/webhooks/${webhookId}`, {
      method: "DELETE",
    });
  }

  /**
   * Enable a webhook destination
   *
   * @param webhookId - ID of the webhook to enable
   * @returns Updated webhook destination
   *
   * @example
   * ```ts
   * await internalApi.webhooks().enable('dest_123')
   * ```
   */
  async enable(webhookId: string): Promise<any> {
    return this.request(
      "PUT",
      `/api/internal/v1/webhooks/${webhookId}/enable`,
      null,
      {} as any
    );
  }

  /**
   * Disable a webhook destination
   *
   * @param webhookId - ID of the webhook to disable
   * @returns Updated webhook destination
   *
   * @example
   * ```ts
   * await internalApi.webhooks().disable('dest_123')
   * ```
   */
  async disable(webhookId: string): Promise<any> {
    return this.request(
      "PUT",
      `/api/internal/v1/webhooks/${webhookId}/disable`,
      null,
      {} as any
    );
  }
}

/**
 * API Keys API namespace
 */
class ApiKeysApi extends HttpClient {
  /**
   * Create a new API key
   *
   * @param data - API key data with name and scopes
   * @returns Created API key with full key (only time it's shown)
   * @throws ZodError if validation fails
   *
   * @example
   * ```ts
   * const apiKey = await internalApi.apiKeys().create({
   *   name: 'Production API Key',
   *   scopes: ['read:contacts', 'write:broadcasts']
   * })
   * console.log(apiKey.data.key) // Save this! Won't be shown again
   * ```
   */
  async create(data: CreateApiKeyInput): Promise<CreateApiKeyResponse> {
    return this.request(
      "POST",
      "/api/internal/v1/api-keys",
      createApiKeySchema,
      createApiKeyResponseSchema,
      data
    );
  }

  /**
   * List all API keys for workspace
   *
   * @returns List of API keys (without full keys)
   * @throws ZodError if validation fails
   *
   * @example
   * ```ts
   * const { data } = await internalApi.apiKeys().list()
   * console.log(data) // Array of API keys with previews
   * ```
   */
  async list(): Promise<ListApiKeysResponse> {
    return this.request(
      "GET",
      "/api/internal/v1/api-keys",
      null,
      listApiKeysResponseSchema
    );
  }

  /**
   * Delete an API key
   *
   * @param apiKeyId - ID of the API key to delete
   * @returns Empty response on success
   * @throws ZodError if validation fails
   *
   * @example
   * ```ts
   * await internalApi.apiKeys().delete('key_123')
   * ```
   */
  async delete(apiKeyId: string): Promise<DeleteApiKeyResponse> {
    return this.request(
      "DELETE",
      `/api/internal/v1/api-keys/${apiKeyId}`,
      null,
      deleteApiKeyResponseSchema
    );
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
  private _apiKeys: ApiKeysApi;
  private _webhooks: WebhooksApi;

  constructor() {
    this._workspaces = new WorkspacesApi();
    this._invitations = new InvitationsApi();
    this._apiKeys = new ApiKeysApi();
    this._webhooks = new WebhooksApi();
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

  /**
   * Access API keys API
   *
   * @returns ApiKeysApi instance
   *
   * @example
   * ```ts
   * const apiKey = await internalApi.apiKeys().create({
   *   name: 'Production',
   *   scopes: ['read:contacts']
   * })
   * ```
   */
  apiKeys() {
    return this._apiKeys;
  }

  /**
   * Access webhooks API
   *
   * @returns WebhooksApi instance
   *
   * @example
   * ```ts
   * const webhook = await internalApi.webhooks().create({
   *   type: 'webhook',
   *   credentials: { url: 'https://example.com/webhook' },
   *   topics: ['user.created']
   * })
   * ```
   */
  webhooks() {
    return this._webhooks;
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
