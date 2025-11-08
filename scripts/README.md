# RBAC Sync Script

Synchronizes organization roles and permissions from `config/rbac.ts` to Logto using the Management API.

## Quick Start

```bash
# Preview changes without applying them
bun run rbac:sync:dry

# Apply changes to Logto
bun run rbac:sync

# Force sync (delete permissions/roles not in config)
bun run rbac:sync:force
```

## What It Does

The RBAC sync script keeps your Logto organization template in sync with your code-defined RBAC configuration:

1. **Validates** your RBAC configuration for errors
2. **Fetches** existing permissions and roles from Logto
3. **Compares** local config with remote state
4. **Syncs** changes to Logto (create/update/delete)
5. **Logs** all operations with detailed information

## Configuration

All RBAC configuration is defined in `config/rbac.ts`:

```typescript
import { RBAC_CONFIG, OWNER_ROLE, DEFAULT_MEMBER_ROLE } from '@/config/rbac';

// Access permissions
console.log(RBAC_CONFIG.permissions);

// Access roles
console.log(RBAC_CONFIG.roles);

// Get default role for new members
console.log(DEFAULT_MEMBER_ROLE); // "workspace_member"

// Get owner role
console.log(OWNER_ROLE); // "workspace_owner"
```

## Command Line Options

### Dry Run Mode

Preview changes without applying them to Logto:

```bash
bun run rbac:sync:dry
# or
bun run scripts/rbac-sync.ts --dry-run
```

**When to use:**
- Before making changes to production
- To see what would change
- For validation and review

### Force Mode

Delete permissions/roles from Logto that are not in your config:

```bash
bun run rbac:sync:force
# or
bun run scripts/rbac-sync.ts --force
```

**When to use:**
- When you've removed permissions/roles from config
- To clean up orphaned permissions
- For a complete reset

**⚠️ Warning:** This will delete permissions and roles that are not in your config file. Users with those roles will lose their permissions.

### Normal Mode

Create new permissions/roles and update existing ones (default):

```bash
bun run rbac:sync
# or
bun run scripts/rbac-sync.ts
```

**When to use:**
- After adding new permissions/roles
- After updating descriptions
- For regular updates

**Note:** This mode will NOT delete permissions/roles from Logto.

## Workflow

### 1. Define Permissions

Edit `config/rbac.ts` to add new permissions:

```typescript
export const PERMISSIONS: Permission[] = [
  {
    name: "manage:projects",
    description: "Full project management (create, update, delete)",
  },
  // Add your new permission
  {
    name: "export:data",
    description: "Export workspace data to CSV/JSON",
  },
];
```

### 2. Define Roles

Add or update roles in `config/rbac.ts`:

```typescript
export const ROLES: Role[] = [
  {
    name: "workspace_admin",
    displayName: "Admin",
    description: "Administrative access to workspace",
    type: "User",
    permissions: [
      "manage:projects",
      "export:data", // Add the new permission to roles
    ],
  },
];
```

### 3. Validate Configuration

Run a dry-run to validate:

```bash
bun run rbac:sync:dry
```

Review the output for any errors or warnings.

### 4. Sync to Logto

Apply the changes:

```bash
bun run rbac:sync
```

### 5. Verify in Logto Console

1. Go to **Logto Console → Organization template**
2. Check **Organization permissions**
3. Check **Organization roles**
4. Verify permissions are assigned to correct roles

## Output Examples

### Successful Sync

```
╔══════════════════════════════════════════════════════════╗
║                  RBAC SYNC SCRIPT                        ║
╚══════════════════════════════════════════════════════════╝

============================================================
VALIDATING CONFIGURATION
============================================================
✓ Configuration is valid
  Permissions: 18
  Roles: 6

============================================================
CONNECTING TO LOGTO
============================================================
→ Initializing Management API client...
  Endpoint: https://nol94f.logto.app/
  Tenant ID: nol94f
✓ Connected to Logto Management API

============================================================
SYNCING PERMISSIONS
============================================================
→ Fetching existing organization permissions from Logto...
  Found 15 existing permissions
→ Creating permission: export:data
  Description: Export workspace data to CSV/JSON
✓ Created permission: export:data
  Permission unchanged: manage:projects
  Permission unchanged: read:projects
  ...

============================================================
SYNCING ROLES
============================================================
→ Fetching existing organization roles from Logto...
  Found 6 existing roles
→ Updating permissions for role: workspace_admin
  Permissions: manage:projects, export:data, ...
✓ Updated permissions for role: workspace_admin
  ...

============================================================
SYNC SUMMARY
============================================================

📊 Permissions:
✓   Created: 1
ℹ   Updated: 0

📊 Roles:
✓   Created: 0
ℹ   Updated: 1

✨ Successfully applied 2 changes!
```

### Dry Run

```
⚠ DRY RUN MODE - No changes will be applied

============================================================
VALIDATING CONFIGURATION
============================================================
✓ Configuration is valid

...

→ Creating permission: export:data
  Description: Export workspace data to CSV/JSON
  [DRY RUN] Would create this permission

...

📝 2 changes would be applied (dry run mode)

Run without --dry-run to apply changes
```

### Configuration Errors

```
============================================================
VALIDATING CONFIGURATION
============================================================
✗ Configuration validation failed:
✗   - Role workspace_admin references unknown permission: export:data
✗   - Duplicate permission: manage:projects
```

## Troubleshooting

### Error: Failed to fetch permissions

**Cause:** Management API credentials are incorrect or missing.

**Solution:**
1. Check your `.env` file has `LOGTO_M2M_APP_ID` and `LOGTO_M2M_APP_SECRET`
2. Verify the M2M app has "Logto Management API access" role in Logto Console
3. Ensure `LOGTO_ENDPOINT` and `LOGTO_TENANT_ID` are correct

### Error: Role references unknown permission

**Cause:** A role includes a permission that doesn't exist in the permissions array.

**Solution:**
1. Check the permission name is spelled correctly
2. Ensure the permission is defined in `PERMISSIONS` array
3. Run validation: `bun run rbac:sync:dry`

### Error: Failed to delete permission

**Cause:** The permission is still assigned to roles or being used.

**Solution:**
1. Remove the permission from all roles first
2. Run sync to update roles
3. Then run force mode to delete: `bun run rbac:sync:force`

### Warning: Permission already exists

**Cause:** The permission exists in Logto but with different properties.

**Solution:** The script will update it automatically. This is normal behavior.

## Best Practices

### 1. Always Run Dry Mode First

```bash
# Before making changes
bun run rbac:sync:dry

# Review the output

# Then apply
bun run rbac:sync
```

### 2. Use Semantic Versioning for Roles

When making breaking changes to roles:

```typescript
// Instead of modifying existing role
{
  name: "workspace_admin",
  permissions: ["manage:projects"], // Removed some permissions
}

// Create a new role version
{
  name: "workspace_admin_v2",
  permissions: ["manage:projects"],
}
```

### 3. Document Permission Changes

Add comments explaining why permissions exist:

```typescript
{
  name: "export:data",
  description: "Export workspace data to CSV/JSON",
  // Added in v1.2.0 for data portability feature
  // Used by: Admin, Owner roles
},
```

### 4. Test in Development First

1. Test sync in development environment
2. Verify role assignments work correctly
3. Check permission enforcement in your app
4. Then deploy to production

### 5. Keep Permissions Granular

```typescript
// ✓ Good - Granular permissions
"read:projects"
"create:projects"
"update:projects"
"delete:projects"

// ✗ Bad - Too broad
"manage:everything"
```

### 6. Use Descriptive Names

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

## Advanced Usage

### Programmatic Access

You can import and use the RBAC config in your code:

```typescript
import { RBAC_CONFIG, OWNER_ROLE, type PermissionName } from '@/config/rbac';

// Get all admin permissions
const adminRole = RBAC_CONFIG.roles.find(r => r.name === 'workspace_admin');
const adminPermissions = adminRole?.permissions || [];

// Type-safe permission checking
function hasPermission(userPermissions: string[], required: PermissionName) {
  return userPermissions.includes(required);
}
```

### Custom Validation

Add custom validation to `scripts/rbac-sync.ts`:

```typescript
// Add after the existing validation
function validateCustomRules(): string[] {
  const errors: string[] = [];

  // Ensure owner has all permissions
  const ownerRole = RBAC_CONFIG.roles.find(r => r.name === OWNER_ROLE);
  const allPermissions = RBAC_CONFIG.permissions.map(p => p.name);

  for (const permission of allPermissions) {
    if (!ownerRole?.permissions.includes(permission)) {
      errors.push(`Owner role missing permission: ${permission}`);
    }
  }

  return errors;
}
```

## Environment Variables

The script requires these environment variables (defined in `.env`):

```bash
# Logto tenant configuration
LOGTO_TENANT_ID=your-tenant-id
LOGTO_ENDPOINT=https://your-tenant.logto.app/

# Management API credentials (M2M app)
LOGTO_M2M_APP_ID=your-m2m-app-id
LOGTO_M2M_APP_SECRET=your-m2m-app-secret
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Sync RBAC

on:
  push:
    paths:
      - 'config/rbac.ts'
    branches:
      - main

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - name: Sync RBAC to Logto
        run: bun run rbac:sync
        env:
          LOGTO_TENANT_ID: ${{ secrets.LOGTO_TENANT_ID }}
          LOGTO_ENDPOINT: ${{ secrets.LOGTO_ENDPOINT }}
          LOGTO_M2M_APP_ID: ${{ secrets.LOGTO_M2M_APP_ID }}
          LOGTO_M2M_APP_SECRET: ${{ secrets.LOGTO_M2M_APP_SECRET }}
```

### Pre-deployment Hook

```json
{
  "scripts": {
    "predeploy": "bun run rbac:sync:dry",
    "deploy": "bun run rbac:sync && <your-deploy-command>"
  }
}
```

## Related Documentation

- [Logto RBAC Documentation](https://docs.logto.io/authorization/role-based-access-control)
- [Logto Management API](https://openapi.logto.io/)
- [Organization Template](https://docs.logto.io/authorization/organization-template)
- [config/rbac.ts](../config/rbac.ts) - RBAC configuration file
