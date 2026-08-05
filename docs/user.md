# User API

Base URL: `/api/user`

All endpoints in this file require authentication via `session_token` cookie.

---

## Error Response

All endpoints return errors in the following format:

```json
{
  "error": "Error message"
}
```

---

## GET /api/user/me

Get the current authenticated user's profile.

### Headers

| Header | Value |
|--------|-------|
| Cookie | `session_token=<token>` |

### Success Response (200)

```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "two_factor_enabled": false,
    "permissions": ["post:read", "post:create"],
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
}
```

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |

---

## PUT /api/user/email

Initiate an email change. Sends a verification code to the new email address.

**Identity validation:** If 2FA is enabled, provide `two_factor_code`. Otherwise, provide `password`.

### Request Body

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `new_email` | string | yes | valid email | |
| `password` | string | no | 8-72 chars | Required if 2FA is disabled |
| `two_factor_code` | string | no | 6 characters | Required if 2FA is enabled |

### Success Response (200)

```json
{
  "message": "Verification code sent to new email"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 400 | "New email is the same as current email" |
| 400 | "Two-factor authentication code is required" |
| 401 | "Invalid password" |
| 401 | "Invalid two-factor authentication code" |
| 409 | "An account with this email already exists" |

---

## PUT /api/user/email/verify

Verify an email change using the token sent to the new email.

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `token` | string | yes | min 32 characters |

### Success Response (200)

```json
{
  "message": "Email address updated successfully"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 400 | "Invalid or expired verification token" |
| 400 | "Verification token has already been used" |

---

## PUT /api/user/password

Update the user's password.

**Identity validation:** If 2FA is enabled, provide `two_factor_code`. Otherwise, provide `current_password`.

### Request Body

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `new_password` | string | yes | 8-72 chars | |
| `current_password` | string | no | 8-72 chars | Required if 2FA is disabled |
| `two_factor_code` | string | no | 6 characters | Required if 2FA is enabled |

### Success Response (200)

```json
{
  "message": "Password updated successfully"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 400 | "Two-factor authentication code is required" |
| 401 | "Invalid password" |
| 401 | "Invalid two-factor authentication code" |

---

## POST /api/user/2fa/enable

Start two-factor authentication setup. Generates a TOTP secret and returns a QR code.

### Request Body

No body required. Uses the authenticated user from the session cookie.

### Success Response (200)

```json
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "otpauth://totp/AppName:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=AppName",
  "message": "Scan the QR code with your authenticator app, then verify with the code"
}
```

Sets `two_factor_token` HTTP-only cookie (10 minute expiry).

### Errors

| Status | Message |
|--------|---------|
| 400 | "Two-factor authentication is already enabled" |

---

## POST /api/user/2fa/verify

Complete two-factor authentication setup. Verify the TOTP code from the authenticator app.

Requires the `two_factor_token` cookie set by the enable endpoint.

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `code` | string | yes | exactly 6 characters |

### Headers

| Header | Value |
|--------|-------|
| Cookie | `two_factor_token=<token>` |

### Success Response (200)

```json
{
  "message": "Two-factor authentication enabled successfully"
}
```

Clears the `two_factor_token` cookie.

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 400 | "No two-factor setup session found" |
| 400 | "Invalid or expired setup session" |
| 400 | "Two-factor authentication is already enabled" |
| 401 | "Invalid verification code" |

---

## POST /api/user/2fa/disable

Disable two-factor authentication.

**Identity validation:** If 2FA is currently enabled, provide `two_factor_code`. If 2FA is not yet enabled, provide `password`.

### Request Body

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `password` | string | no | 8-72 chars | Required if 2FA is not enabled |
| `two_factor_code` | string | no | 6 characters | Required if 2FA is enabled |

### Success Response (200)

```json
{
  "message": "Two-factor authentication disabled successfully"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | Validation errors |
| 400 | "Password is required" |
| 400 | "Two-factor authentication code is required" |
| 400 | "Two-factor authentication is not enabled" |
| 401 | "Invalid password" |
| 401 | "Invalid two-factor authentication code" |

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
