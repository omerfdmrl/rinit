# Session API

Base URL: `/api/sessions`

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

## GET /api/sessions/

List all active sessions for the authenticated user. Includes the ID of the current session (the one making the request).

### Success Response (200)

```json
{
  "sessions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 ...",
      "ip_address": "192.168.1.10",
      "device_name": "Ubuntu 22.04",
      "os": "Ubuntu",
      "browser": "Chrome",
      "expires_at": "2026-08-04T00:00:00Z",
      "created_at": "2026-07-04T00:00:00Z"
    }
  ],
  "current_session_id": "uuid"
}
```

`current_session_id` can be used by the client to highlight the current device and to prevent it from being revoked.

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
| 500 | "Something went wrong" |

---

## DELETE /api/sessions/:id

Revoke a specific session. The session must belong to the authenticated user. The current session cannot be revoked.

### Path Parameters

| Parameter | Type   | Description |
|-----------|--------|-------------|
| `id`      | string | UUID of the session |

### Success Response (200)

```json
{
  "message": "Session revoked successfully"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Cannot revoke the current session" |
| 401 | "Authentication required" |
| 404 | "Session not found" |

---

## DELETE /api/sessions/

Revoke all sessions for the authenticated user except the current one. The current browser session is preserved.

### Success Response (200)

```json
{
  "message": "All other sessions have been revoked"
}
```

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
| 500 | "Something went wrong" |

---

## Workflows

### Revoke a Stolen Device

```
1. GET /api/sessions/                  → List all active sessions
2. Identify the unknown session ID
3. DELETE /api/sessions/:id            → Revoke the unknown session
```

### Log Out Everywhere Else (keep this device)

```
1. DELETE /api/sessions/               → Revoke all sessions except the current one
2. Other devices' next request returns 401 "Invalid or expired session"
```

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