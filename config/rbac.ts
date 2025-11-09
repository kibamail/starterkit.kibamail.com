/**
 * Role-Based Access Control (RBAC) Configuration
 *
 * This file defines all organization roles and permissions for your application.
 * These definitions serve as the source of truth and are synced to Logto using
 * the `scripts/rbac-sync.ts` script.
 *
 * @example
 * ```bash
 * # Sync RBAC to Logto
 * bun run scripts/rbac-sync.ts
 * ```
 *
 * ============================================================================
 * ARCHITECTURE OVERVIEW
 * ============================================================================
 *
 * Permissions: Fine-grained actions (e.g., "invite:members", "manage:billing")
 * Roles: Collections of permissions (e.g., "owner", "admin", "member")
 * Template: All organizations inherit the same roles and permissions
 *
 * When you update this file and run the sync script, all organizations
 * automatically receive the updated role definitions.
 *
 * ============================================================================
 * PERMISSION NAMING CONVENTIONS
 * ============================================================================
 *
 * Use the format: <action>:<resource>
 *
 * Actions: read, write, create, delete, manage, invite, update
 * Resources: members, projects, billing, settings, analytics, workspace
 *
 * Examples:
 * - read:projects - View projects
 * - manage:members - Full member management (add, remove, update roles)
 * - invite:members - Send member invitations
 * - delete:workspace - Delete the entire workspace
 *
 * ============================================================================
 */

/**
 * Organization Permission Definition
 *
 * Defines a single permission that can be assigned to roles.
 */
export interface PermissionDefinition {
  /**
   * Unique permission identifier
   *
   * Use format: <action>:<resource>
   * @example "manage:members"
   */
  name: string;

  /**
   * Human-readable description
   *
   * Explain what this permission allows users to do.
   * This appears in the Logto Console.
   *
   * @example "Manage workspace members (add, remove, update roles)"
   */
  description: string;
}

/**
 * Organization Role Definition
 *
 * Defines a role with its associated permissions.
 */
export interface Role {
  /**
   * Unique role identifier
   *
   * Use lowercase with underscores for consistency.
   * @example "workspace_owner"
   */
  name: string;

  /**
   * Human-readable role name
   *
   * Displayed in UI and Logto Console.
   * @example "Workspace Owner"
   */
  displayName: string;

  /**
   * Role description
   *
   * Explain what this role is for and what access level it provides.
   *
   * @example "Full access to workspace including billing and deletion"
   */
  description: string;

  /**
   * List of permission names this role grants
   *
   * These must match permission names defined in the permissions array.
   *
   * @example ["manage:members", "invite:members", "delete:workspace"]
   */
  permissions: string[];

  /**
   * Role type
   *
   * - "User": Assigned to human users
   * - "MachineToMachine": Assigned to M2M applications
   */
  type: "User" | "MachineToMachine";
}

/**
 * RBAC Configuration
 *
 * Complete configuration of all permissions and roles.
 */
export interface RBACConfig {
  /**
   * All available organization permissions
   */
  permissions: PermissionDefinition[];

  /**
   * All organization roles
   */
  roles: Role[];
}

/**
 * Organization Permissions
 *
 * All permissions that can be granted within an organization.
 * These are non-API permissions that control UI features and business logic.
 *
 * This is a minimal boilerplate configuration. Extend with additional
 * permissions as your application grows (e.g., project management,
 * analytics, API keys, etc.).
 */
export const PERMISSIONS: PermissionDefinition[] = [
  // ============================================================================
  // WORKSPACE MANAGEMENT
  // ============================================================================
  {
    name: "read:workspace",
    description: "View workspace details and settings",
  },
  {
    name: "manage:workspace",
    description: "Update workspace name, description, and settings",
  },
  {
    name: "delete:workspace",
    description:
      "Permanently delete the workspace and all associated data (destructive)",
  },

  // ============================================================================
  // MEMBER MANAGEMENT
  // ============================================================================
  {
    name: "read:members",
    description: "View workspace members and their roles",
  },
  {
    name: "invite:members",
    description: "Send invitations to new members",
  },
  {
    name: "manage:members",
    description:
      "Full member management including adding, removing, and updating member roles",
  },

  // ============================================================================
  // BILLING & SUBSCRIPTION
  // ============================================================================
  {
    name: "read:billing",
    description: "View billing information, invoices, and subscription details",
  },
  {
    name: "manage:billing",
    description:
      "Manage billing, update payment methods, change subscription plans",
  },
];

/**
 * Organization Roles
 *
 * Role hierarchy (from highest to lowest access):
 * 1. Owner - Full control including billing and destructive actions
 * 2. Admin - Administrative access to workspace and members
 * 3. Member - Basic access to view workspace and members
 *
 * This is a minimal boilerplate configuration. Extend with additional
 * roles as your application grows (e.g., viewer, developer, analyst).
 */
export const ROLES: Role[] = [
  // ============================================================================
  // OWNER - Full Control
  // ============================================================================
  {
    name: "owner",
    displayName: "Owner",
    description:
      "Full access to all workspace features including billing, member management, and workspace deletion. Only owners can delete the workspace or manage billing.",
    type: "User",
    permissions: [
      "read:workspace",
      "manage:workspace",
      "delete:workspace",
      "read:members",
      "invite:members",
      "manage:members",
      "read:billing",
      "manage:billing",
    ],
  },

  // ============================================================================
  // ADMIN - Administrative Access
  // ============================================================================
  {
    name: "admin",
    displayName: "Admin",
    description:
      "Administrative access including member management and workspace settings. Cannot manage billing or delete the workspace.",
    type: "User",
    permissions: [
      "read:workspace",
      "manage:workspace",
      "read:members",
      "invite:members",
      "manage:members",
      "read:billing",
    ],
  },

  // ============================================================================
  // MEMBER - Basic Access
  // ============================================================================
  {
    name: "member",
    displayName: "Member",
    description:
      "Basic access to view workspace information and members. Can invite new members but cannot manage existing members or settings.",
    type: "User",
    permissions: ["read:workspace", "read:members"],
  },
];

/**
 * Complete RBAC Configuration
 *
 * Export the full configuration for use by the sync script.
 */
export const RBAC_CONFIG: RBACConfig = {
  permissions: PERMISSIONS,
  roles: ROLES,
};

/**
 * Helper: Get default role for new workspace members
 *
 * When a user accepts an invitation without a specific role assignment,
 * they are assigned this default role.
 */
export const DEFAULT_MEMBER_ROLE = "member";

/**
 * Helper: Get owner role name
 *
 * Used when creating a new workspace to assign the creator as owner.
 */
export const OWNER_ROLE = "owner";

/**
 * Helper: Get all permission names
 *
 * Useful for validation and autocomplete.
 */
export const PERMISSION_NAMES = PERMISSIONS.map((p) => p.name);

/**
 * Helper: Get all role names
 *
 * Useful for validation and autocomplete.
 */
export const ROLE_NAMES = ROLES.map((r) => r.name);

/**
 * Type: Permission name
 *
 * Use this type for type-safe permission checking.
 *
 * @example
 * ```typescript
 * function checkPermission(permission: PermissionName) {
 *   // TypeScript ensures only valid permissions are passed
 * }
 * ```
 */
export type PermissionName = (typeof PERMISSION_NAMES)[number];

/**
 * Type: Union of all available permissions
 *
 * This is a union type of all permission strings for type-safe permission checking.
 *
 * @example
 * ```typescript
 * const permission: Permission = "read:workspace"; // ✓ Valid
 * const invalid: Permission = "invalid:permission"; // ✗ TypeScript error
 * ```
 */
export type Permission =
  | "read:workspace"
  | "manage:workspace"
  | "delete:workspace"
  | "read:members"
  | "invite:members"
  | "manage:members"
  | "read:billing"
  | "manage:billing";

/**
 * Type: Role name
 *
 * Use this type for type-safe role assignment.
 *
 * @example
 * ```typescript
 * function assignRole(role: RoleName) {
 *   // TypeScript ensures only valid roles are passed
 * }
 * ```
 */
export type RoleName = (typeof ROLE_NAMES)[number];
