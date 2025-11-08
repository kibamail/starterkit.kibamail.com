/**
 * API Keys Types
 *
 * TypeScript type definitions for API key entities and responses.
 */

/**
 * API Key Entity
 *
 * Represents an API key in the system.
 */
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date | null;
  lastUsedAt: Date | null;
}

/**
 * API Key Response
 *
 * The shape of API key data returned to clients.
 * Excludes the actual key value for security (except on creation).
 */
export interface ApiKeyResponse {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  expiresAt: string | null;
  lastUsedAt: string | null;
}

/**
 * Create API Key Response
 *
 * Response when creating a new API key.
 * Includes the actual key value (only shown once).
 */
export interface CreateApiKeyResponse extends ApiKeyResponse {
  key: string;
}
