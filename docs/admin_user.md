# Admin User Management API

Admin endpoints for managing users with RBAC (Role-Based Access Control) and dynamic filtering.

## Base URL

```
/api/admin/users
```

## Authentication

All endpoints require authentication via session cookie (`session_token`).

## Permissions

| Endpoint | Permission Required |
|----------|-------------------|
| List users | `users.list` |
| View user | `users.view` |
| Create user | `users.create` |
| Update user | `users.update` |
| Delete user | `users.delete` |
| Send password reset | `users.update` |

## Endpoints

### List Users

```
GET /api/admin/users
```

Returns a paginated list of users with filtering and sorting.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | int | Page number | 1 |
| `per_page` | int | Items per page (max: 100) | 20 |
| `sort_by` | string | Sort field | `created_at` |
| `sort_order` | string | Sort direction (`asc`, `desc`) | `asc` |
| `search` | string | Search by name or email | - |
| `name` | string | Filter by name | - |
| `email` | string | Filter by email | - |
| `role` | string | Filter by role (`user`, `admin`) | - |
| `two_factor` | string | Filter by 2FA status (`true`, `false`) | - |
| `created_after` | string | Filter by creation date (after) | - |
| `created_before` | string | Filter by creation date (before) | - |
| `updated_after` | string | Filter by update date (after) | - |
| `updated_before` | string | Filter by update date (before) | - |

**Filter Operators:**

Prefix the value with an operator to use advanced filtering:

| Operator | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `eq` | `eq:value` | Equals | `?role=eq:admin` |
| `neq` | `neq:value` | Not equals | `?role=neq:user` |
| `contains` | `value` (default) | Contains (default for text) | `?search=john` |
| `starts_with` | `starts:value` | Starts with | `?name=starts:Jo` |
| `ends_with` | `ends:value` | Ends with | `?email=ends:example.com` |
| `gt` | `gt:value` | Greater than | `?created_after=gt:2024-01-01` |
| `gte` | `gte:value` | Greater than or equal | `?created_after=gte:2024-01-01` |
| `lt` | `lt:value` | Less than | `?created_before=lt:2024-12-31` |
| `lte` | `lte:value` | Less than or equal | `?created_before=lte:2024-12-31` |
| `in` | `in:v1,v2,v3` | In list | `?role=in:admin,user` |
| `null` | `null` | Is null | - |
| `not_null` | `not_null` | Is not null | - |

**Example Requests:**

```bash
# Basic list
GET /api/admin/users

# Search and filter
GET /api/admin/users?search=john&role=admin

# Pagination
GET /api/admin/users?page=2&per_page=10

# Sorting
GET /api/admin/users?sort_by=created_at&sort_order=desc

# Date range filter
GET /api/admin/users?created_after=2024-01-01&created_before=2024-12-31

# Complex query
GET /api/admin/users?search=john&role=admin&two_factor=true&sort_by=name&sort_order=asc&page=1&per_page=20
```

**Response:**

```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "two_factor_enabled": false,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

### Get User

```
GET /api/admin/users/:id
```

Returns the details of a specific user.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User ID (UUID) |

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "two_factor_enabled": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Create User

```
POST /api/admin/users
```

Creates a new user account. A random password is generated and sent via email.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | User's full name |
| `email` | string | Yes | User's email address |
| `role` | string | Yes | User role (`user` or `admin`) |

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "User created successfully. A password reset email has been sent."
}
```

---

### Update User

```
PUT /api/admin/users/:id
```

Updates user information. Password cannot be updated via this endpoint.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User ID (UUID) |

**Request Body:**

```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "role": "admin"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | User's full name |
| `email` | string | No | User's email address |
| `role` | string | No | User role (`user` or `admin`) |

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "role": "admin",
    "two_factor_enabled": false,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T12:45:00Z"
  },
  "message": "User updated successfully"
}
```

---

### Delete User

```
DELETE /api/admin/users/:id
```

Soft deletes a user account.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User ID (UUID) |

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

---

### Send Password Reset

```
POST /api/admin/users/:id/send-password-reset
```

Sends a password reset email to the specified user.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User ID (UUID) |

**Response:**

```json
{
  "message": "Password reset email sent successfully"
}
```

---

## Filter Helper Usage

The filter helper (`internal/filter`) can be reused across any endpoint. Here's how to use it:

### 1. Define Field Configuration

```go
var userFilterConfig = filter.Config{
    Fields: map[string]filter.FieldConfig{
        "search":         {Column: "name", Operators: []filter.Operator{filter.OpContains}},
        "name":           {Column: "name", Operators: []filter.Operator{filter.OpContains, filter.OpEquals}},
        "email":          {Column: "email", Operators: []filter.Operator{filter.OpContains, filter.OpEquals}},
        "role":           {Column: "role", Operators: []filter.Operator{filter.OpEquals}},
        "two_factor":     {Column: "two_factor_enabled", Operators: []filter.Operator{filter.OpEquals}},
        "created_after":  {Column: "created_at", Operators: []filter.Operator{filter.OpGreaterEquals}},
        "created_before": {Column: "created_at", Operators: []filter.Operator{filter.OpLessEquals}},
    },
    DefaultSort: "created_at",
}
```

### 2. Parse Query Parameters

```go
query := make(map[string][]string)
c.QueryParser(&query)

f := filter.Parse(userFilterConfig, query)
```

### 3. Build SQL Query

```go
// For listing with pagination
query, args := filter.Build(f, "SELECT * FROM users")

// For counting total records
countQuery, countArgs := filter.BuildCount(f, "SELECT COUNT(*) FROM users")
```

### 4. Execute Query

```go
rows, err := db.Query(query, args...)
// ...
```

### Example: Creating a New Filtered Endpoint

```go
func ListProducts(c *fiber.Ctx) error {
    query := make(map[string][]string)
    c.QueryParser(&query)
    
    productFilterConfig := filter.Config{
        Fields: map[string]filter.FieldConfig{
            "search":      {Column: "name", Operators: []filter.Operator{filter.OpContains}},
            "category":    {Column: "category_id", Operators: []filter.Operator{filter.OpEquals}},
            "price_min":   {Column: "price", Operators: []filter.Operator{filter.OpGreaterEquals}},
            "price_max":   {Column: "price", Operators: []filter.Operator{filter.OpLessEquals}},
            "in_stock":    {Column: "stock_quantity", Operators: []filter.Operator{filter.OpGreaterThan}},
        },
        DefaultSort: "name",
    }
    
    f := filter.Parse(productFilterConfig, query)
    
    // Use f with your repository
    products, total, err := productRepo.List(f)
    // ...
}
```

---

## RBAC Permissions

### Permission Keys

| Key | Description |
|-----|-------------|
| `users.list` | List and search users |
| `users.view` | View user details |
| `users.create` | Create new user accounts |
| `users.update` | Update user information (name, email, role) |
| `users.delete` | Delete user accounts |
| `users.manage` | Full user management access (all user permissions) |

### Assigning Permissions

Permissions can be assigned to roles via the RBAC service:

```go
// Create a role
role, err := rbacSvc.CreateRole("admin", "Administrator", nil)

// Get permission by key
perm, err := rbacSvc.GetPermissionByKey("users.list")

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
| 404 | User not found |
| 409 | User already exists (email conflict) |
| 500 | Internal server error |

---

## Security Notes

1. **Password Hashing**: Passwords are hashed using bcrypt before storage
2. **Soft Delete**: Users are soft deleted (deleted_at timestamp) to preserve data integrity
3. **Password Reset**: Admin-initiated password resets send a secure token via email
4. **No Password Updates**: Admins cannot update passwords directly - users must use the password reset flow
5. **RBAC Enforcement**: All endpoints are protected by RBAC middleware
