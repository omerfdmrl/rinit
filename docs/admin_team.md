# Admin Team Management API

Admin endpoints for managing teams with RBAC (Role-Based Access Control) and dynamic filtering.

## Base URL

```
/api/admin/teams
```

## Authentication

All endpoints require authentication via session cookie (`session_token`).

## Permissions

| Endpoint | Permission Required |
|----------|-------------------|
| List teams | `teams.list` |
| View team | `teams.view` |
| Create team | `teams.create` |
| Update team | `teams.update` |
| Delete team | `teams.delete` |
| List team users | `teams.view` |
| Get teams by user | `teams.view` |

## Endpoints

### List Teams

```
GET /api/admin/teams
```

Returns a paginated list of teams with filtering and sorting.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | int | Page number | 1 |
| `per_page` | int | Items per page (max: 100) | 20 |
| `sort_by` | string | Sort field | `created_at` |
| `sort_order` | string | Sort direction (`asc`, `desc`) | `asc` |
| `search` | string | Search by team name | - |
| `name` | string | Filter by name | - |
| `created_by` | string | Filter by creator user ID | - |
| `created_after` | string | Filter by creation date (after) | - |
| `created_before` | string | Filter by creation date (before) | - |
| `updated_after` | string | Filter by update date (after) | - |
| `updated_before` | string | Filter by update date (before) | - |

**Filter Operators:**

Prefix the value with an operator to use advanced filtering:

| Operator | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `eq` | `eq:value` | Equals | `?name=eq:My%20Team` |
| `neq` | `neq:value` | Not equals | `?name=neq:Test` |
| `contains` | `value` (default) | Contains (default for text) | `?search=my` |
| `starts_with` | `starts:value` | Starts with | `?name=starts:My` |
| `ends_with` | `ends:value` | Ends with | `?name=ends:Team` |
| `gt` | `gt:value` | Greater than | `?created_after=gt:2024-01-01` |
| `gte` | `gte:value` | Greater than or equal | `?created_after=gte:2024-01-01` |
| `lt` | `lt:value` | Less than | `?created_before=lt:2024-12-31` |
| `lte` | `lte:value` | Less than or equal | `?created_before=lte:2024-12-31` |
| `in` | `in:v1,v2,v3` | In list | - |
| `null` | `null` | Is null | - |
| `not_null` | `not_null` | Is not null | - |

**Example Requests:**

```bash
# Basic list
GET /api/admin/teams

# Search and filter
GET /api/admin/teams?search=my&created_by=uuid

# Pagination
GET /api/admin/teams?page=2&per_page=10

# Sorting
GET /api/admin/teams?sort_by=created_at&sort_order=desc

# Date range filter
GET /api/admin/teams?created_after=2024-01-01&created_before=2024-12-31

# Complex query
GET /api/admin/teams?search=my&created_by=uuid&sort_by=name&sort_order=asc&page=1&per_page=20
```

**Response:**

```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "My Team",
      "created_by": "uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
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

### Get Team

```
GET /api/admin/teams/:id
```

Returns the details of a specific team.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Team ID (UUID) |

**Response:**

```json
{
  "team": {
    "id": "uuid",
    "name": "My Team",
    "created_by": "uuid",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Create Team

```
POST /api/admin/teams
```

Creates a new team.

**Request Body:**

```json
{
  "name": "My Team"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Team name |

**Response:**

```json
{
  "team": {
    "id": "uuid",
    "name": "My Team",
    "created_by": "uuid",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "message": "Team created successfully"
}
```

---

### Update Team

```
PUT /api/admin/teams/:id
```

Updates team information.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Team ID (UUID) |

**Request Body:**

```json
{
  "name": "Updated Team Name"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Team name |

**Response:**

```json
{
  "team": {
    "id": "uuid",
    "name": "Updated Team Name",
    "created_by": "uuid",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:45:00Z"
  },
  "message": "Team updated successfully"
}
```

---

### Delete Team

```
DELETE /api/admin/teams/:id
```

Deletes a team and all its members.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Team ID (UUID) |

**Response:**

```json
{
  "message": "Team deleted successfully"
}
```

---

### List Team Users

```
GET /api/admin/teams/:id/users
```

Returns a paginated list of users in the specified team.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Team ID (UUID) |

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | int | Page number | 1 |
| `per_page` | int | Items per page (max: 100) | 20 |
| `sort_by` | string | Sort field | `created_at` |
| `sort_order` | string | Sort direction (`asc`, `desc`) | `asc` |
| `user_id` | string | Filter by user ID | - |
| `role` | string | Filter by role (`owner`, `member`) | - |
| `created_after` | string | Filter by join date (after) | - |

**Example Requests:**

```bash
# Basic list
GET /api/admin/teams/:id/users

# Filter by role
GET /api/admin/teams/:id/users?role=owner

# Pagination
GET /api/admin/teams/:id/users?page=2&per_page=10

# Sorting
GET /api/admin/teams/:id/users?sort_by=role&sort_order=asc
```

**Response:**

```json
{
  "users": [
    {
      "id": "uuid",
      "team_id": "uuid",
      "user_id": "uuid",
      "role": "owner",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

---

### Get Teams by User

```
GET /api/admin/teams/user/:userId
```

Returns all teams the specified user is a member of.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | User ID (UUID) |

**Response:**

```json
{
  "teams": [
    {
      "id": "uuid",
      "name": "My Team",
      "created_by": "uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## RBAC Permissions

### Permission Keys

| Key | Description |
|-----|-------------|
| `teams.list` | List and search teams |
| `teams.view` | View team details and members |
| `teams.create` | Create new teams |
| `teams.update` | Update team information (name) |
| `teams.delete` | Delete teams and associated data |
| `teams.manage` | Full team management access (all team permissions) |

### Assigning Permissions

Permissions can be assigned to roles via the RBAC service:

```go
// Create a role
role, err := rbacSvc.CreateRole("team_admin", "Team Administrator", nil)

// Get permission by key
perm, err := rbacSvc.GetPermissionByKey("teams.list")

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
| 404 | Team not found |
| 500 | Internal server error |

---

## Security Notes

1. **Cascade Delete**: Deleting a team removes all members, invitations, and associated RBAC data
2. **RBAC Enforcement**: All endpoints are protected by RBAC middleware
3. **Owner Protection**: Team owners cannot be removed from teams via admin endpoints
4. **UUID Validation**: All IDs are validated as UUID format
5. **Soft Relationships**: Team members reference users but teams can be deleted independently
