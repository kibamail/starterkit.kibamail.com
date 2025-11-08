/**
 * API Configuration
 *
 * Central configuration for API keys, scopes, and permissions.
 * This defines what resources users can access via API keys and how
 * the keys are formatted.
 */

/**
 * API Actions
 *
 * Enumeration of all possible actions that can be performed on resources.
 */
export enum ApiAction {
  READ = "read",
  WRITE = "write",
  PUBLISH = "publish",
}

/**
 * API Resources
 *
 * Enumeration of all available resources in the API.
 * Add new resources here as your API grows.
 */
export enum ApiResource {
  API_KEYS = "api-keys",
}

/**
 * API Resource Actions
 *
 * Maps each resource to its available actions.
 * Define what operations are allowed on each resource.
 *
 * @example
 * [ApiResource.USERS]: [ApiAction.READ, ApiAction.WRITE]
 */
export const API_RESOURCE_ACTIONS: Record<ApiResource, ApiAction[]> = {
  [ApiResource.API_KEYS]: [ApiAction.READ, ApiAction.WRITE],
};

/**
 * API Key Prefix
 *
 * Defines the prefix for API keys.
 *
 * Format: {prefix}_{random}
 *
 * @example
 * sk_abc123def456ghi789
 */
export const API_KEY_PREFIX = "sk" as const;
