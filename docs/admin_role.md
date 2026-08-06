# Admin Role & Permission Management API

Admin endpoints for managing roles and permissions with RBAC (Role-Based Access Control) and dynamic filtering.

## Base URL

```
/api/admin/roles
/api/admin/permissions
```

## Authentication

All endpoints require authentication via session cookie (`session_token`).

## Permissions

### Role Endpoints

| Endpoint | Permission Required |
|----------|-------------------|
| List roles | `roles.list` |
| View role | `roles.view` |
| Create role | `roles.create` |
| Update role | `roles.update` |
| Delete role | `roles.delete` |
| List role permissions | `roles.view` |
| Assign role permission | `roles.update` |
| Remove role permission | `roles.update` |

### Permission Endpoints

| Endpoint | Permission Required |
|----------|-------------------|
| List permissions | `permissions.list` |
| View permission | `permissions.view` |
| Create permission | `permissions.create` |
| Update permission | `permissions.update` |

---

## Role Endpoints

### List Roles

```
GET /api/admin/roles
```

Returns a paginated list of roles with filtering and sorting.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | int | Page number | 1 |
| `per_page` | int | Items per page (max: 100) | 20 |
| `sort_by` | string | Sort field | `created_at` |
| `sort_order` | string | Sort direction (`asc`, `desc`) | `asc` |
| `search` | string | Search by role name | - |
| `name` | string | Filter by name | - |
| `team_id` | string | Filter by team ID (null for global) | - |
| `is_default` | string | Filter by default status (`true`, `false`) | - |
| `created_after` | string | Filter by creation date (after) | - |
| `created_before` | string | Filter by creation date (before) | - |

**Filter Operators:**

Prefix the value with an operator to use advanced filtering:

| Operator | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `eq` | `eq:value` | Equals | `?name=eq:admin` |
| `neq` | `neq:value` | Not equals | `?name=neq:user` |
| `contains` | `value` (default) | Contains (default for text) | `?search=adm` |
| `starts_with` | `starts:value` | Starts with | `?name=starts:adm` |
| `ends_with` | `ends:value` | Ends with | `?name=ends:role` |
| `gt` | `gt:value` | Greater than | `?created_after=gt:2024-01-01` |
| `gte` | `gte:value` | Greater than or equal | `?created_after=gte:2024-01-01` |
| `lt` | `lt:value` | Less than | `?created_before=lt:2024-12-31` |
| `lte` | `lte:value` | Less than or equal | `?created_before=lte:2024-12-31` |
| `in` | `in:v1,v2,v3` | In list | - |
| `null` | `null` | Is null | `?team_id=null` |
| `not_null` | `not_null` | Is not null | `?team_id=not_null` |

**Example Requests:**

```bash
# Basic list
GET /api/admin/roles

# Search and filter
GET /api/admin/roles?search=admin&is_default=false

# Pagination
GET /api/admin/roles?page=2&per_page=10

# Sorting
GET /api/admin/roles?sort_by=role_name&sort_order=asc

# Filter global roles (team_id is null)
GET /api/admin/roles?team_id=null

# Filter team-specific roles
GET /api/admin/roles?team_id=uuid

# Complex query
GET /api/admin/roles?search=admin&is_default=false&sort_by=role_name&sort_order=asc&page=1&per_page=20
```

**Response:**

```json
{
  "roles": [
    {
      "id": "uuid",
      "role_name": "admin",
      "team_id": null,
      "is_default": false,
      "description": "Administrator with full access",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 10,
    "total_pages": 1
  }
}
```

---

### Get Role

```
GET /api/admin/roles/:id
```

Returns the details of a specific role with its assigned permissions.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Role ID (UUID) |

**Response:**

```json
{
  "role": {
    "id": "uuid",
    "role_name": "admin",
    "team_id": null,
    "is_default": false,
    "description": "Administrator with full access",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "permissions": [
    {
      "id": "uuid",
      "permission_key": "users.list",
      "description": "List users",
      "is_system": true,
      "is_assignable": true
    }
  ]
}
```

---

### Create Role

```
POST /api/admin/roles
```

Creates a new role.

**Request Body:**

```json
{
  "name": "editor",
  "description": "Can edit content",
  "team_id": null,
  "is_default": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Role name |
| `description` | string | No | Role description |
| `team_id` | string | No | Team ID (null for global role) |
| `is_default` | bool | No | Whether this is the default role |

**Response:**

```json
{
  "role": {
    "id": "uuid",
    "role_name": "editor",
    "team_id": null,
    "is_default": false,
    "description": "Can edit content",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Role created successfully"
}
```

---

### Update Role

```
PUT /api/admin/roles/:id
```

Updates role information.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Role ID (UUID) |

**Request Body:**

```json
{
  "name": "super_admin",
  "description": "Super administrator with all permissions"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Role name |
| `description` | string | No | Role description |

**Response:**

```json
{
  "role": {
    "id": "uuid",
    "role_name": "super_admin",
    "team_id": null,
    "is_default": false,
    "description": "Super administrator with all permissions",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:45:00Z"
  },
  "message": "Role updated successfully"
}
```

---

### Delete Role

```
DELETE /api/admin/roles/:id
```

Deletes a role and removes all user assignments.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Role ID (UUID) |

**Response:**

```json
{
  "message": "Role deleted successfully"
}
```

---

### List Role Permissions

```
GET /api/admin/roles/:id/permissions
```

Returns all permissions assigned to the specified role.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Role ID (UUID) |

**Response:**

```json
{
  "role": {
    "id": "uuid",
    "role_name": "admin"
  },
  "permissions": [
    {
      "id": "uuid",
      "permission_key": "users.list",
      "description": "List users",
      "is_system": true,
      "is_assignable": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### Assign Role Permission

```
POST /api/admin/roles/:id/permissions
```

Adds a permission to the specified role.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Role ID (UUID) |

**Request Body:**

```json
{
  "permission_id": "uuid"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `permission_id` | string | Yes | Permission ID to assign |

**Response:**

```json
{
  "message": "Permission assigned successfully"
}
```

---

### Remove Role Permission

```
DELETE /api/admin/roles/:id/permissions/:permId
```

Removes a permission from the specified role.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Role ID (UUID) |
| `permId` | string | Permission ID (UUID) |

**Response:**

```json
{
  "message": "Permission removed successfully"
}
```

---

## Permission Endpoints

### List Permissions

```
GET /api/admin/permissions
```

Returns a paginated list of permissions with filtering and sorting.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | int | Page number | 1 |
| `per_page` | int | Items per page (max: 100) | 20 |
| `sort_by` | string | Sort field | `permission_key` |
| `sort_order` | string | Sort direction (`asc`, `desc`) | `asc` |
| `search` | string | Search by permission key or description | - |
| `key` | string | Filter by permission key | - |
| `is_system` | string | Filter by system status (`true`, `false`) | - |
| `is_assignable` | string | Filter by assignable status (`true`, `false`) | - |
| `created_after` | string | Filter by creation date (after) | - |
| `created_before` | string | Filter by creation date (before) | - |

**Example Requests:**

```bash
# Basic list
GET /api/admin/permissions

# Search and filter
GET /api/admin/permissions?search=users&is_system=true

# Pagination
GET /api/admin/permissions?page=2&per_page=10

# Sorting
GET /api/admin/permissions?sort_by=permission_key&sort_order=asc

# Filter assignable permissions
GET /api/admin/permissions?is_assignable=true

# Complex query
GET /api/admin/permissions?search=team&is_assignable=true&sort_by=permission_key&sort_order=asc&page=1&per_page=20
```

**Response:**

```json
{
  "permissions": [
    {
      "id": "uuid",
      "permission_key": "users.list",
      "description": "List users",
      "is_system": true,
      "is_assignable": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 50,
    "total_pages": 3
  }
}
```

---

### Get Permission

```
GET /api/admin/permissions/:id
```

Returns the details of a specific permission.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Permission ID (UUID) |

**Response:**

```json
{
  "permission": {
    "id": "uuid",
    "permission_key": "users.list",
    "description": "List users",
    "is_system": true,
    "is_assignable": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Create Permission

```
POST /api/admin/permissions
```

Creates a new permission.

**Request Body:**

```json
{
  "key": "reports.view",
  "description": "View reports",
  "is_assignable": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | Yes | Permission key (unique) |
| `description` | string | No | Permission description |
| `is_assignable` | bool | No | Whether this permission can be assigned to roles |

**Response:**

```json
{
  "permission": {
    "id": "uuid",
    "permission_key": "reports.view",
    "description": "View reports",
    "is_system": false,
    "is_assignable": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Permission created successfully"
}
```

---

### Update Permission

```
PUT /api/admin/permissions/:id
```

Updates permission description.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Permission ID (UUID) |

**Request Body:**

```json
{
  "description": "View all reports and analytics"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `description` | string | No | Permission description |

**Response:**

```json
{
  "permission": {
    "id": "uuid",
    "permission_key": "reports.view",
    "description": "View all reports and analytics",
    "is_system": false,
    "is_assignable": true,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Permission updated successfully"
}
```

---

## RBAC Permission Keys

### Role Permissions

| Key | Description |
|-----|-------------|
| `roles.list` | List and search roles |
| `roles.view` | View role details and permissions |
| `roles.create` | Create new roles |
| `roles.update` | Update role information and manage permissions |
| `roles.delete` | Delete roles |

### Permission Management

| Key | Description |
|-----|-------------|
| `permissions.list` | List and search permissions |
| `permissions.view` | View permission details |
| `permissions.create` | Create new permissions |
| `permissions.update` | Update permission descriptions |

### Assigning Permissions to Roles

```go
// Create a role
role, err := rbacSvc.CreateRole("editor", "Content Editor", nil)

// Get permission by key
perm, err := rbacSvc.GetPermissionByKey("posts.create")

// Assign permission to role
err = rbacSvc.AssignRolePermission(role.ID, perm.ID)

// Assign role to user
err = rbacSvc.AssignUserRole(userID, role.ID, nil)
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message"
}
```

### Common Error Codes

| Status | Description |
|--------|-------------|
| 400 | Invalid request body or validation error |
| 401 | Authentication required |
| 403 | Permission denied |
| 404 | Role or permission not found |
| 409 | Role or permission already exists |
| 500 | Internal server error |

---

## Security Notes

1. **System Permissions**: System permissions (`is_system: true`) cannot be deleted but can be viewed
2. **Cache Invalidation**: Role and permission changes automatically invalidate the RBAC cache
3. **Cascade Delete**: Deleting a role removes all role-permission and user-role assignments
4. **Team Scoping**: Roles can be global (`team_id: null`) or team-specific
5. **RBAC Enforcement**: All endpoints are protected by RBAC middleware
