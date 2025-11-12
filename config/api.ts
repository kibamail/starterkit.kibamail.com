/**
 * API Configuration
 *
 * Central configuration for API keys, scopes, and permissions.
 * This defines what resources users can access via API keys and how
 * the keys are formatted.
 *
 * Unlike the internal RBAC system (role-based), API keys use scope-based
 * permissions for granular access control.
 */

/**
 * API Scope Definition
 *
 * Defines a single API scope that can be granted to an API key.
 */
export interface ApiScopeDefinition {
  /**
   * Unique scope identifier
   *
   * Format: <action>:<resource>
   * @example "read:contacts", "write:broadcasts"
   */
  name: string;

  /**
   * Human-readable description
   *
   * Explain what this scope allows the API key to do.
   * @example "Read contact information and lists"
   */
  description: string;

  /**
   * Resource category for grouping in UI
   * @example "Contacts", "Broadcasts", "Analytics"
   */
  category: string;
}

/**
 * API Scopes Configuration
 *
 * All available scopes that can be assigned to API keys.
 * These are independent of the internal RBAC permissions.
 *
 * This is a template configuration. Extend with your application's
 * specific resources and permissions as needed.
 */
export const API_SCOPES: ApiScopeDefinition[] = [
  // ============================================================================
  // PROJECTS
  // ============================================================================
  {
    name: "read:projects",
    description: "View projects and their details",
    category: "Projects",
  },
  {
    name: "write:projects",
    description: "Create, update, and delete projects",
    category: "Projects",
  },

  // ============================================================================
  // API KEYS
  // ============================================================================
  {
    name: "read:api-keys",
    description: "View API keys",
    category: "API Keys",
  },
  {
    name: "write:api-keys",
    description: "Create new api keys",
    category: "API Keys",
  },
  {
    name: "delete:api-keys",
    description: "Delete API keys",
    category: "API Keys",
  },
];

/**
 * Helper: Get all scope names
 *
 * Useful for validation and autocomplete.
 */
export const API_SCOPE_NAMES = API_SCOPES.map((s) => s.name);

/**
 * Type: API Scope name
 *
 * Use this type for type-safe scope checking.
 */
export type ApiScope = (typeof API_SCOPE_NAMES)[number];

/**
 * Helper: Get scopes grouped by category
 */
export const API_SCOPES_BY_CATEGORY = API_SCOPES.reduce(
  (acc, scope) => {
    if (!acc[scope.category]) {
      acc[scope.category] = [];
    }
    acc[scope.category].push(scope);
    return acc;
  },
  {} as Record<string, ApiScopeDefinition[]>,
);

/**
 * API Key Preset Definition
 *
 * Defines a preset with a name and associated scopes
 */
export interface ApiKeyPreset {
  /**
   * Unique preset identifier
   */
  name: string;

  /**
   * Display name for the preset
   */
  displayName: string;

  /**
   * Scopes included in this preset
   */
  scopes: string[];
}

/**
 * API Key Presets
 *
 * Predefined combinations of scopes for common use cases
 */
export const API_KEY_PRESETS: ApiKeyPreset[] = [
  {
    name: "none",
    displayName: "None",
    scopes: [],
  },
  {
    name: "read",
    displayName: "Read only",
    scopes: ["read:projects"],
  },
  {
    name: "write",
    displayName: "Write only",
    scopes: ["write:projects"],
  },
  {
    name: "all",
    displayName: "Full access",
    scopes: API_SCOPES.map((scope) => scope.name),
  },
];

/**
 * API Key Configuration
 */
export const API_KEY_CONFIG = {
  /**
   * API key prefix
   * Format: {prefix}_{random}
   * @example "sk_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4"
   */
  PREFIX: "sk" as const,

  /**
   * Length of the random part (in bytes, will be hex encoded)
   * 24 bytes = 48 hex characters (192 bits of entropy)
   */
  RANDOM_BYTES: 24,
} as const;
