# Auth API

Base URL: `/api/auth`

## Error Response

All endpoints return errors in the following format:

```json
{
  "error": "Error message"
}
```

---

## POST /api/auth/login

Authenticate a user and create a session.

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | yes | valid email |
| `password` | string | yes | 8-72 characters |

### Success Response (200)

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "permissions": ["post:read", "post:create"]
  },
  "message": "Welcome back!"
}
```

Sets `session_token` HTTP-only cookie.

### Success Response - 2FA Required (200)

If the user has two-factor authentication enabled:

```json
{
  "two_factor_required": true,
  "message": "Two-factor authentication required"
}
```

Sets `two_factor_token` HTTP-only cookie (5 minute expiry).

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors (e.g., "email is required") |
| 401 | "Invalid email or password" |

---

## POST /api/auth/2fa/verify

Complete a login that requires two-factor authentication by verifying the code from the user's authenticator app.

### Headers

| Header | Value |
|--------|-------|
| Cookie | `two_factor_token=<token>` (set by `/login` when 2FA is enabled) |

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `code` | string | yes | exactly 6 characters |

### Success Response (200)

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "permissions": ["post:read", "post:create"]
  },
  "message": "Two-factor authentication verified"
}
```

Sets the `session_token` HTTP-only cookie and clears the `two_factor_token` cookie.

### Errors

| Status | Message |
|--------|---------|
| 400 | "No two-factor session found", validation errors, or "Two-factor authentication is not enabled" |
| 401 | "Invalid or expired two-factor session" or "Invalid verification code" |

---

## POST /api/auth/register

Create a new user account.

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | yes | 2-100 characters |
| `email` | string | yes | valid email |
| `password` | string | yes | 8-72 characters |

### Success Response (201)

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "permissions": ["post:read"]
  },
  "team_id": "uuid",
  "message": "Account created — your workspace is ready"
}
```

Sets `session_token` and `selected_team` HTTP-only cookies.

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 409 | "An account with this email already exists" |

---

## POST /api/auth/forgot-password

Send a password reset email.

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `email` | string | yes | valid email |

### Success Response (200)

```json
{
  "message": "Reset link sent — check your inbox"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors |

---

## POST /api/auth/reset-password

Reset the user's password using a token from the email.

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | yes | min 32 characters |
| `password` | string | yes | 8-72 characters |
| `password_confirmation` | string | yes | must match `password` |

### Success Response (200)

```json
{
  "message": "Password has been reset successfully"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 401 | "Invalid or expired reset token" |

---

## POST /api/auth/logout

Sign the user out and revoke the session. **Requires authentication.**

### Headers

| Header | Value |
|--------|-------|
| Cookie | `session_token=<token>` |

### Success Response (200)

```json
{
  "message": "You have been signed out"
}
```

Clears the `session_token` cookie.

---

## Authentication

Endpoints marked with **Requires authentication** expect the `session_token` cookie to be set. The cookie is HTTP-only and set automatically upon login/register.

```http
Cookie: session_token=<token>
```

If the token is missing or invalid, protected endpoints return:

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
