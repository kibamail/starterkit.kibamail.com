# RBAC Configuration Guide

Quick reference for the Role-Based Access Control (RBAC) system.

## Overview

This project uses Logto's organization-level RBAC to control access within workspaces. All roles and permissions are defined in code (`config/rbac.ts`) and synced to Logto using the sync script.

**Boilerplate Design:** This configuration provides essential workspace, member, and billing management. Extend it with additional permissions and roles as your application grows.

## Quick Reference

### Roles

| Role | Display Name | Description | Type |
|------|--------------|-------------|------|
| `owner` | Owner | Full control including billing and deletion | User |
| `admin` | Admin | Administrative access to workspace and members | User |
| `member` | Member | Basic access to view workspace and members | User |

### Permissions

#### Workspace Management
- `read:workspace` - View workspace details and settings
- `manage:workspace` - Update workspace name, description, and settings
- `delete:workspace` - Permanently delete the workspace (destructive)

#### Member Management
- `read:members` - View workspace members and their roles
- `invite:members` - Send invitations to new members
- `manage:members` - Full member management (add, remove, update roles)

#### Billing & Subscription
- `read:billing` - View billing information, invoices, and subscription details
- `manage:billing` - Manage billing, update payment methods, change subscription plans

## Role Permission Matrix

| Permission | Owner | Admin | Member |
|-----------|-------|-------|--------|
| **Workspace** |
| read:workspace | ✓ | ✓ | ✓ |
| manage:workspace | ✓ | ✓ | |
| delete:workspace | ✓ | | |
| **Members** |
| read:members | ✓ | ✓ | ✓ |
| invite:members | ✓ | ✓ | ✓ |
| manage:members | ✓ | ✓ | |
| **Billing** |
| read:billing | ✓ | ✓ | |
| manage:billing | ✓ | | |

## Usage in Code

### Server-Side Permission Checking

```typescript
import { hasPermission, requirePermission } from '@/lib/auth/permissions';

// Check if user has permission
export async function myServerAction() {
  'use server';

  const canManageBilling = await hasPermission(orgId, 'manage:billing');

  if (!canManageBilling) {
    throw new Error('Insufficient permissions');
  }

  // Or use requirePermission (throws automatically)
  await requirePermission(orgId, 'manage:billing');

  // ... proceed with action
}
```

### Client-Side UI Gating

```typescript
'use client';

import { usePermission } from '@/hooks/use-permission';

function BillingButton() {
  const canManageBilling = usePermission('manage:billing');

  if (!canManageBilling) {
    return null; // Hide button
  }

  return <Button>Manage Billing</Button>;
}
```

### Getting User Roles

```typescript
import { logto } from '@/auth/logto';

// Get user's roles in organization
const roles = await logto
  .workspaces()
  .members(workspaceId)
  .getRoles(userId);

console.log(roles); // [{ id: '...', name: 'admin', ... }]
```

### Assigning Roles

```typescript
import { logto } from '@/auth/logto';
import { OWNER_ROLE } from '@/config/rbac';

// Get role ID from Logto (you'll need to fetch this once)
const ownerRoleId = 'role-id-from-logto';

// Add user to workspace with owner role
await logto
  .workspaces()
  .members(workspaceId)
  .add(userId, [ownerRoleId]);

// Update user's roles
await logto
  .workspaces()
  .members(workspaceId)
  .updateRoles(userId, [ownerRoleId]);
```

## Syncing RBAC

### Commands

```bash
# Preview changes
bun run rbac:sync:dry

# Apply changes
bun run rbac:sync

# Force sync (delete unused permissions/roles)
bun run rbac:sync:force
```

### Workflow

1. Edit `config/rbac.ts`
2. Run `bun run rbac:sync:dry` to preview
3. Run `bun run rbac:sync` to apply
4. Verify in Logto Console

## Extending the Boilerplate

### Adding New Permissions

#### 1. Define Permission

Edit `config/rbac.ts`:

```typescript
export const PERMISSIONS: Permission[] = [
  // ... existing permissions

  // ============================================================================
  // PROJECT MANAGEMENT (NEW)
  // ============================================================================
  {
    name: "read:projects",
    description: "View projects and their details",
  },
  {
    name: "manage:projects",
    description: "Full project management (create, update, delete)",
  },
];
```

#### 2. Add to Roles

```typescript
export const ROLES: Role[] = [
  {
    name: "admin",
    // ... other properties
    permissions: [
      // ... existing permissions
      "read:projects",
      "manage:projects", // Add new permissions
    ],
  },
  {
    name: "member",
    // ... other properties
    permissions: [
      // ... existing permissions
      "read:projects", // Members can only read
    ],
  },
];
```

#### 3. Sync to Logto

```bash
bun run rbac:sync:dry  # Preview
bun run rbac:sync      # Apply
```

#### 4. Use in Code

```typescript
// Server-side
await requirePermission(orgId, 'manage:projects');

// Client-side
const canManage = usePermission('manage:projects');
```

### Adding New Roles

#### 1. Define Role

Edit `config/rbac.ts`:

```typescript
export const ROLES: Role[] = [
  // ... existing roles

  {
    name: "viewer",
    displayName: "Viewer",
    description: "Read-only access to workspace and members",
    type: "User",
    permissions: [
      "read:workspace",
      "read:members",
      "read:billing",
    ],
  },
];
```

#### 2. Sync to Logto

```bash
bun run rbac:sync
```

#### 3. Assign to Users

```typescript
const viewerRole = roles.find(r => r.name === 'viewer');
await logto
  .workspaces()
  .members(workspaceId)
  .updateRoles(userId, [viewerRole.id]);
```

## Common Extensions

Here are common ways to extend this boilerplate:

### 1. Project/Resource Management

```typescript
// Permissions
"read:projects"
"create:projects"
"update:projects"
"delete:projects"
"manage:projects"

// Add to admin and member roles
```

### 2. Analytics & Reporting

```typescript
// Permissions
"read:analytics"
"export:reports"

// Add to owner and admin roles
```

### 3. API Keys & Integrations

```typescript
// Permissions
"read:api-keys"
"manage:api-keys"

// Add to owner and admin roles
```

### 4. Settings & Configuration

```typescript
// Permissions
"read:settings"
"manage:settings"

// Add to owner and admin roles
```

### 5. Additional Roles

```typescript
// Developer role
{
  name: "developer",
  displayName: "Developer",
  permissions: [
    "read:workspace",
    "read:members",
    "manage:projects",
    "read:api-keys",
  ],
}

// Analyst role
{
  name: "analyst",
  displayName: "Analyst",
  permissions: [
    "read:workspace",
    "read:analytics",
    "export:reports",
  ],
}

// Billing Manager role
{
  name: "billing_manager",
  displayName: "Billing Manager",
  permissions: [
    "read:workspace",
    "read:billing",
    "manage:billing",
  ],
}
```

## Type Safety

### Permission Names

```typescript
import type { PermissionName } from '@/config/rbac';

function checkPermission(permission: PermissionName) {
  // TypeScript ensures only valid permissions
  // 'manage:billing' ✓
  // 'invalid:permission' ✗ Type error
}
```

### Role Names

```typescript
import type { RoleName } from '@/config/rbac';

function assignRole(role: RoleName) {
  // TypeScript ensures only valid roles
  // 'admin' ✓
  // 'invalid_role' ✗ Type error
}
```

## Best Practices

### 1. Principle of Least Privilege

Assign the minimum permissions needed for a user to perform their job.

```typescript
// ✓ Good - Give specific role
assignRole(userId, 'member');

// ✗ Bad - Over-permissioning
assignRole(userId, 'owner');
```

### 2. Use Permission Checking Server-Side

Always verify permissions on the server, not just in the UI.

```typescript
// ✓ Good - Server-side check
export async function deleteWorkspace(workspaceId: string) {
  'use server';
  await requirePermission(workspaceId, 'delete:workspace');
  // ... delete logic
}

// ✗ Bad - Only client-side check
function DeleteButton() {
  const canDelete = usePermission('delete:workspace');
  return canDelete ? <button onClick={deleteWorkspace}>Delete</button> : null;
  // Server doesn't verify permission!
}
```

### 3. Document Custom Permissions

Add comments explaining business logic:

```typescript
{
  name: "approve:expense",
  description: "Approve expense reports up to $10,000",
  // Note: Expenses over $10k require owner approval
  // Added in v2.1.0 for finance workflow
},
```

### 4. Keep Permissions Granular

```typescript
// ✓ Good - Granular permissions
"read:projects"
"create:projects"
"update:projects"
"delete:projects"

// ✗ Bad - Too broad
"manage:everything"
```

### 5. Use Semantic Naming

```typescript
// ✓ Good - Clear and specific
{
  name: "invite:members",
  description: "Send invitations to new workspace members",
}

// ✗ Bad - Vague
{
  name: "invite",
  description: "Invite people",
}
```

## Troubleshooting

### Permission Not Working

1. Verify permission exists in Logto Console
2. Check role has the permission assigned
3. Verify user has the role in the organization
4. Clear organization token cache

### Role Assignment Failed

1. Check role exists in Logto
2. Verify user is member of organization
3. Check M2M app has Management API access
4. Review API error response

### Sync Failed

1. Verify M2M credentials in `.env`
2. Check M2M app has "Logto Management API access" role
3. Review script output for specific errors
4. Try dry-run mode first: `bun run rbac:sync:dry`

## Configuration Summary

**Current Setup:**
- **8 Permissions**: 3 workspace, 3 member, 2 billing
- **3 Roles**: owner, admin, member
- **Focus**: Essential workspace operations

**Extensible Areas:**
- Project/resource management
- Analytics and reporting
- API keys and integrations
- Settings and configuration
- Custom business logic permissions
- Additional specialized roles

## Related Files

- [`config/rbac.ts`](./rbac.ts) - RBAC configuration
- [`scripts/rbac-sync.ts`](../scripts/rbac-sync.ts) - Sync script
- [`scripts/README.md`](../scripts/README.md) - Detailed sync documentation
- [`lib/auth/permissions.ts`](../lib/auth/permissions.ts) - Permission helpers (to be created)
- [`hooks/use-permission.ts`](../hooks/use-permission.ts) - Permission hooks (to be created)
