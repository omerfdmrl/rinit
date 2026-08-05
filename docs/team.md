# Team API

Base URL: `/api/teams`

All endpoints in this file require authentication via `session_token` cookie.

Endpoint-specific permissions are enforced with the RBAC middleware, like the admin API. **Team owners always pass** permission checks; other members must hold the listed permission key (via their team role) or receive a 403.

---

## Error Response

All endpoints return errors in the following format:

```json
{
  "error": "Error message"
}
```

---

## GET /api/teams/

List all teams the current user belongs to.

**Required permission:** none (any authenticated user)

### Success Response (200)

```json
[
  {
    "id": "uuid",
    "name": "Workspace",
    "created_by": "uuid",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
]
```

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
| 500 | "Internal Server Error" |

---

## POST /api/teams/

Create a team. The creator is added as the `owner` member, an `owner` role with **all assignable permissions** is provisioned and assigned to the creator, and a default `member` role is created. The new team becomes the selected team.

**Required permission:** none (any authenticated user)

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | 1-255 characters |

### Success Response (201)

```json
{
  "id": "uuid",
  "name": "My Team",
  "created_by": "uuid",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

Sets `selected_team` HTTP-only cookie to the new team.

### Errors

| Status | Message |
|--------|---------|
| 400 | "Invalid request body" / validation errors |
| 401 | "Authentication required" |
| 500 | "Failed to create team" |

---

## GET /api/teams/current

Get the currently selected team (from the `selected_team` cookie).

**Required permission:** none (any authenticated user)

### Success Response (200)

```json
{
  "id": "uuid",
  "name": "Workspace",
  "created_by": "uuid",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
| 404 | "Not Found" |

---

## POST /api/teams/switch

Switch the active team. Sets the `selected_team` cookie.

**Required permission:** none (any authenticated user)

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `team_id` | string | yes | valid UUID |

### Success Response (200)

```json
{
  "id": "uuid",
  "name": "Workspace",
  "created_by": "uuid",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

Sets `selected_team` HTTP-only cookie.

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 401 | "Authentication required" |
| 403 | "Forbidden" (user is not a member) |
| 404 | "Not Found" |

---

## GET /api/teams/:teamId/members

List team members with user info. Paginated with filtering and sorting.

**Required permission:** `teams.members.list`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default 1) |
| `per_page` | int | Items per page, max 100 (default 20) |
| `sort_by` | string | `created_at` (default), `name`, `email`, `role` |
| `sort_order` | string | `asc` (default) or `desc` |
| `role` | string | Filter by role name |
| `user_id` | string | Filter by user ID |
| `name` | string | Filter by member name |
| `email` | string | Filter by member email |
| `created_after` | string | Joined after date (`gte:`) |
| `created_before` | string | Joined before date (`lte:`) |

### Success Response (200)

```json
{
  "members": [
    {
      "id": "uuid",
      "team_id": "uuid",
      "user_id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "editor",
      "created_at": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Team ID is required" |
| 401 | "Authentication required" |
| 403 | "Forbidden" / "Not a member of this team" |
| 404 | "Not Found" |
| 500 | "Failed to list members" |

---

## DELETE /api/teams/:teamId/members/:userId

Remove a member from a team and revoke their team role. The team owner cannot be removed.

**Required permission:** `teams.members.remove`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |
| `userId` | string | UUID of the user to remove |

### Success Response (200)

```json
{
  "message": "Member removed successfully"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "The team owner cannot be removed" |
| 401 | "Authentication required" |
| 403 | "Insufficient permissions" |
| 404 | "Member not found" |
| 500 | "Something went wrong" |

---

## PUT /api/teams/:teamId/members/:userId/role

Assign a role to a team member. Synchronizes the member's role name and their team-scoped RBAC role assignment.

**Required permission:** `teams.members.role.assign`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |
| `userId` | string | UUID of the user |

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `role` | string | yes | 1-255 characters, must be a role of the team |

### Success Response (200)

```json
{
  "id": "uuid",
  "team_id": "uuid",
  "user_id": "uuid",
  "role": "editor",
  "created_at": "2026-01-01T00:00:00Z"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Role not found in this team" / "The team owner role cannot be changed" / validation errors |
| 401 | "Authentication required" |
| 403 | "Insufficient permissions" |
| 404 | "Member not found" |
| 500 | "Something went wrong" |

---

## GET /api/teams/:teamId/roles

List all team roles with their permissions.

**Required permission:** `teams.roles.list`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Success Response (200)

```json
{
  "roles": [
    {
      "role": {
        "id": "uuid",
        "role_name": "editor",
        "team_id": "uuid",
        "is_default": false,
        "description": "Can edit content",
        "created_at": "2026-01-01T00:00:00Z",
        "updated_at": "2026-01-01T00:00:00Z"
      },
      "permissions": [
        {
          "id": "uuid",
          "permission_key": "teams.members.list",
          "description": "List team members",
          "is_system": false,
          "is_assignable": true,
          "created_at": "2026-01-01T00:00:00Z"
        }
      ]
    }
  ]
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Team ID is required" |
| 401 | "Authentication required" |
| 403 | "Forbidden" / "Not a member of this team" |
| 500 | "Failed to list roles" |

---

## POST /api/teams/:teamId/roles

Create a team-scoped role with the given permission keys.

**Required permission:** `teams.roles.create`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | 1-255 characters, unique within the team |
| `description` | string | no | max 500 characters |
| `permission_keys` | string[] | no | array of assignable permission keys |

### Success Response (201)

```json
{
  "id": "uuid",
  "role_name": "editor",
  "team_id": "uuid",
  "is_default": false,
  "description": "Can edit content",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "permission not found: <key>" / validation errors / "role already exists" |
| 401 | "Authentication required" |
| 403 | "Insufficient permissions" |
| 500 | "Something went wrong" |

---

## PUT /api/teams/:teamId/roles/:roleId

Update a team role. When `permission_keys` is provided it **replaces** the role's permission set. The `owner` role cannot be modified.

**Required permission:** `teams.roles.update`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |
| `roleId` | string | UUID of the role |

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | no | 1-255 characters |
| `description` | string | no | max 500 characters |
| `permission_keys` | string[] | no | replaces the role's permissions when present |

### Success Response (200)

```json
{
  "id": "uuid",
  "role_name": "editor",
  "team_id": "uuid",
  "is_default": false,
  "description": "Can edit content",
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-01-01T00:00:00Z"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "The owner role cannot be modified" / "permission not found: <key>" / validation errors |
| 401 | "Authentication required" |
| 403 | "Insufficient permissions" |
| 404 | "Role not found" / "Role does not belong to this team" |
| 500 | "Something went wrong" |

---

## DELETE /api/teams/:teamId/roles/:roleId

Delete a team role. The `owner` role cannot be deleted.

**Required permission:** `teams.roles.delete`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |
| `roleId` | string | UUID of the role |

### Success Response (200)

```json
{
  "message": "Role deleted successfully"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "The owner role cannot be deleted" |
| 401 | "Authentication required" |
| 403 | "Insufficient permissions" |
| 404 | "Role not found" / "Role does not belong to this team" |
| 500 | "Something went wrong" |

---

## GET /api/teams/:teamId/permissions

List the catalog of assignable permission keys that can be granted to team roles.

**Required permission:** `teams.roles.view`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Success Response (200)

```json
{
  "permissions": [
    {
      "id": "uuid",
      "permission_key": "teams.members.list",
      "description": "List team members",
      "is_system": false,
      "is_assignable": true,
      "created_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Team ID is required" |
| 401 | "Authentication required" |
| 403 | "Forbidden" / "Not a member of this team" |
| 500 | "Failed to list permissions" |

---

## POST /api/teams/:teamId/invite

Invite a user to a team. The invited user is granted the given role (or the default `member` role) when they accept.

**Required permission:** `teams.members.invite`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | yes | valid email |
| `role` | string | no | 1-255 characters, must be a role of the team (default: `member`) |

### Success Response (201)

```json
{
  "invitation_id": "uuid",
  "message": "Invitation sent successfully"
}
```

An email is sent to the invited address with a 7-day invitation token.

### Errors

| Status | Message |
|--------|---------|
| 400 | "Role not found in this team" / validation errors |
| 401 | "Authentication required" |
| 403 | "Insufficient permissions to invite members" |
| 404 | "Team not found" |
| 409 | "User is already a member of this team" |
| 500 | "Something went wrong" |

---

## POST /api/teams/invite/accept

Accept a team invitation using the token from the invitation email.

**Required permission:** none (any authenticated user)

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | yes | min 32 characters |

### Success Response (200)

```json
{
  "team": {
    "id": "uuid",
    "name": "Workspace",
    "created_by": "uuid",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  },
  "message": "Invitation accepted successfully"
}
```

The authenticated user is added to the team with the role from the invitation (default `member`), and the matching RBAC role is assigned to them.

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 400 | "Invalid or expired invitation" |
| 400 | "Invitation has expired" |
| 400 | "Invitation has already been accepted" |
| 401 | "Authentication required" |
| 409 | "You are already a member of this team" |
| 500 | "Something went wrong" |

---

## Workflows

### Create Team Flow

```
1. POST /api/teams/                  → Create team with name
   Owner role with all assignable permissions is created and assigned
   Default `member` role is created
   selected_team cookie is set to the new team
2. GET /api/teams/current            → Get current team info
```

### Switch Team Flow

```
1. GET /api/teams/          → List user's teams
2. User selects a team
3. POST /api/teams/switch   → Set selected_team cookie
4. GET /api/teams/current   → Get current team info
```

### Role Management Flow

```
1. GET  /api/teams/:teamId/permissions          → Browse assignable permission keys
2. POST /api/teams/:teamId/roles                → Create role with permission_keys
3. GET  /api/teams/:teamId/roles                → List roles
4. PUT  /api/teams/:teamId/roles/:roleId        → Update role / replace permissions
5. PUT  /api/teams/:teamId/members/:userId/role → Assign role to member
6. DELETE /api/teams/:teamId/roles/:roleId      → Delete role
```

### Invite & Accept Flow

```
1. POST /api/teams/:teamId/invite  → User with teams.members.invite sends invite with optional role
2. Invited user receives email with token
3. Invited user logs in / registers
4. POST /api/teams/invite/accept   → User submits token, joins team with invited role
```

## Team Permissions

| Permission key | Description |
|----------------|-------------|
| `teams.members.list` | List team members |
| `teams.members.remove` | Remove members from a team |
| `teams.members.role.assign` | Assign roles to team members |
| `teams.members.invite` | Invite members to a team |
| `teams.roles.list` | List team roles |
| `teams.roles.view` | View team role details and permissions |
| `teams.roles.create` | Create team roles |
| `teams.roles.update` | Update team roles and their permissions |
| `teams.roles.delete` | Delete team roles |

## Default Team Roles

| Role | Permissions |
|------|-------------|
| `owner` | All assignable permissions (created on team creation, assigned to creator, protected from edit/delete) |
| `member` | No permissions (default role for invited members) |

---

## Authentication

All endpoints require the `session_token` cookie:

```http
Cookie: session_token=<token>
```

If the token is missing or invalid:

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
