# Team Plans API

Base URL: `/api/teams/:teamId/plans`

All endpoints in this file require authentication via `session_token` cookie.

Endpoint-specific permissions are enforced with the RBAC middleware. **Team owners always pass** permission checks; other members must hold the listed permission key (via their team role) or receive a 403.

Every team gets a subscription to the **default plan** (the active plan flagged `is_default`) automatically when the team is created, both during registration and via `POST /api/teams`.

---

## Error Response

All endpoints return errors in the following format:

```json
{
  "error": "Error message"
}
```

---

## GET /api/teams/:teamId/plans/catalog

List the billing plans and addons the team can subscribe to. Only active, non-addon plans are returned.

**Required permission:** `billing.team.plans.view`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Success Response (200)

```json
{
  "plans": [
    {
      "id": "plan_free",
      "code": "free",
      "name": "Free",
      "description": "Free plan for getting started",
      "status": "active",
      "interval_type": "monthly",
      "interval_days": 30,
      "price_amount": 0,
      "currency": "USD",
      "trial_days": 0,
      "negative_balance_limit": 0,
      "is_addon": false,
      "is_default": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z",
      "features": [
        {
          "id": "uuid",
          "feature_key": "max_projects",
          "value_type": "number",
          "value_bool": false,
          "value_number": 3,
          "value_string": "",
          "value_json": "",
          "unlimited": false,
          "created_at": "2026-01-01T00:00:00Z"
        }
      ],
      "metrics": [
        {
          "id": "uuid",
          "metric_key": "seats",
          "included_amount": 2,
          "unlimited": false,
          "pricing_model": "included_only",
          "unit_price": 0,
          "package_size": 1,
          "pricing_config": "",
          "billing_type": "prorated",
          "proration_precision": "hour",
          "created_at": "2026-01-01T00:00:00Z"
        }
      ]
    }
  ],
  "addons": [
    {
      "id": "addon_extra_seats",
      "code": "extra-seats",
      "name": "Extra Seats",
      "description": "Additional member seats",
      "status": "active",
      "interval_type": "monthly",
      "interval_days": 30,
      "price_amount": 1000,
      "currency": "USD",
      "trial_days": 0,
      "negative_balance_limit": null,
      "is_addon": true,
      "is_default": false,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z"
    }
  ]
}
```

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 500 | "Failed to list plans" / "Failed to list addons" |

---

## GET /api/teams/:teamId/plans/me

Get the team's current subscription with plan details, current-period usage and attached addons.

**Required permission:** `billing.team.plans.view`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Success Response (200)

```json
{
  "subscription": {
    "id": "uuid",
    "owner_type": "team",
    "owner_id": "uuid",
    "plan_id": "plan_free",
    "status": "trial",
    "started_at": "2026-01-01T00:00:00Z",
    "current_period_start": "2026-01-01T00:00:00Z",
    "current_period_end": "2026-01-31T00:00:00Z",
    "trial_ends_at": "2026-01-08T00:00:00Z",
    "renewed_at": null,
    "cancelled_at": null,
    "credit_balance": 0,
    "negative_balance_limit": 0,
    "auto_recharge_enabled": false,
    "auto_recharge_min_balance": 0,
    "auto_recharge_amount": 0,
    "auto_recharge_max_count": 0,
    "auto_recharge_cooldown_seconds": 0,
    "auto_recharge_count": 0,
    "last_auto_recharge_at": null,
    "scheduled_plan_id": null,
    "scheduled_change_type": "",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z",
    "plan": {
      "id": "plan_free",
      "code": "free",
      "name": "Free",
      "description": "Free plan for getting started",
      "status": "active",
      "interval_type": "monthly",
      "interval_days": 30,
      "price_amount": 0,
      "currency": "USD",
      "trial_days": 0,
      "negative_balance_limit": 0,
      "is_addon": false,
      "is_default": true,
      "created_at": "2026-01-01T00:00:00Z",
      "updated_at": "2026-01-01T00:00:00Z",
      "features": [],
      "metrics": []
    }
  },
  "usage": [
    {
      "metric_key": "api_calls",
      "total": 1200,
      "included": 100000,
      "unlimited": false,
      "aggregation": "sum"
    }
  ],
  "addons": [
    {
      "id": "uuid",
      "subscription_id": "uuid",
      "addon_id": "addon_extra_seats",
      "quantity": 3,
      "added_at": "2026-01-05T00:00:00Z",
      "current_period_start": "2026-01-01T00:00:00Z",
      "current_period_end": "2026-01-31T00:00:00Z"
    }
  ]
}
```

Subscription status values: `trial`, `active`, `grace_period`, `restricted`, `suspended`, `pending_cancellation`, `cancelled`, `expired`.

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "Not Found" (no subscription for this team) |

---

## POST /api/teams/:teamId/plans/change

Schedule a plan upgrade or downgrade. The change takes effect at the end of the current billing period.

**Required permission:** `billing.team.plans.change`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `plan_id` | string | yes | ID of an active plan (must not be an addon) |
| `change_type` | string | yes | `upgrade` or `downgrade` |

### Success Response (200)

```json
{
  "subscription": {
    "id": "uuid",
    "owner_type": "team",
    "owner_id": "uuid",
    "plan_id": "plan_hobby",
    "status": "active",
    "started_at": "2026-01-01T00:00:00Z",
    "current_period_start": "2026-01-01T00:00:00Z",
    "current_period_end": "2026-01-31T00:00:00Z",
    "trial_ends_at": null,
    "renewed_at": null,
    "cancelled_at": null,
    "credit_balance": 0,
    "negative_balance_limit": -500,
    "auto_recharge_enabled": false,
    "auto_recharge_min_balance": 0,
    "auto_recharge_amount": 0,
    "auto_recharge_max_count": 0,
    "auto_recharge_cooldown_seconds": 0,
    "auto_recharge_count": 0,
    "last_auto_recharge_at": null,
    "scheduled_plan_id": "plan_pro",
    "scheduled_change_type": "upgrade",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-10T00:00:00Z",
    "plan": null
  }
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Invalid change type" / "Subscription is not active" / "Plan is not available" / validation errors |
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "Plan not found" / "No subscription for this team" |
| 500 | "Something went wrong" |

---

## POST /api/teams/:teamId/plans/cancel

Schedule cancellation of the team's subscription at the end of the current period. The subscription stays active until then.

**Required permission:** `billing.team.plans.change`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Success Response (200)

```json
{
  "subscription": {
    "id": "uuid",
    "owner_type": "team",
    "owner_id": "uuid",
    "plan_id": "plan_hobby",
    "status": "active",
    "started_at": "2026-01-01T00:00:00Z",
    "current_period_start": "2026-01-01T00:00:00Z",
    "current_period_end": "2026-01-31T00:00:00Z",
    "scheduled_plan_id": null,
    "scheduled_change_type": "cancel",
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-10T00:00:00Z"
  }
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Subscription is not active" |
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "No subscription for this team" |
| 500 | "Something went wrong" |

---

## GET /api/teams/:teamId/plans/usage

Get usage totals for the team's current billing period.

**Required permission:** `billing.team.plans.view`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Success Response (200)

```json
{
  "usage": [
    {
      "metric_key": "api_calls",
      "total": 1200,
      "included": 100000,
      "unlimited": false,
      "aggregation": "sum"
    },
    {
      "metric_key": "seats",
      "total": 3,
      "included": 2,
      "unlimited": false,
      "aggregation": "sum"
    }
  ]
}
```

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "No subscription for this team" |
| 500 | "Failed to load usage" |

---

## GET /api/teams/:teamId/plans/invoices

List invoices for the team's subscription. Paginated with filtering.

**Required permission:** `billing.team.plans.view`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default 1) |
| `per_page` | int | Items per page, max 100 (default 20) |
| `status` | string | Filter by invoice status (`draft`, `finalized`, `paid`, `voided`) |

### Success Response (200)

```json
{
  "invoices": [
    {
      "id": "uuid",
      "number": "INV-2026-0001",
      "subscription_id": "uuid",
      "status": "paid",
      "period_start": "2026-01-01T00:00:00Z",
      "period_end": "2026-01-31T00:00:00Z",
      "subtotal": 2900,
      "discount_amount": 0,
      "tax_amount": 0,
      "credits_applied": 0,
      "total": 2900,
      "currency": "USD",
      "due_at": null,
      "finalized_at": "2026-01-01T00:00:00Z",
      "paid_at": "2026-01-01T00:00:00Z",
      "metadata": "",
      "created_at": "2026-01-01T00:00:00Z",
      "items": [
        {
          "id": "uuid",
          "kind": "subscription_fee",
          "description": "Hobby plan",
          "quantity": 1,
          "unit_price": 2900,
          "amount": 2900,
          "metadata": "",
          "position": 0
        }
      ]
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

Amounts are in cents.

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "No subscription for this team" |
| 500 | "Failed to load invoices" |

---

## GET /api/teams/:teamId/plans/ledger

List credit ledger entries for the team's subscription. Paginated with filtering.

**Required permission:** `billing.team.plans.view`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default 1) |
| `per_page` | int | Items per page, max 100 (default 20) |
| `entry_type` | string | Filter by entry type (`subscription_charge`, `usage_charge`, `manual_credit`, `refund`, `adjustment`, `recharge`, `invoice_payment`) |

### Success Response (200)

```json
{
  "ledger": [
    {
      "id": "uuid",
      "subscription_id": "uuid",
      "entry_type": "subscription_charge",
      "amount": -2900,
      "balance_after": -2900,
      "currency": "USD",
      "reference_id": "uuid",
      "description": "Hobby plan charge",
      "metadata": "",
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

Amounts are in cents. Negative amounts are debits.

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "No subscription for this team" |
| 500 | "Failed to load ledger" |

---

## PUT /api/teams/:teamId/plans/recharge

Configure the auto-recharge settings of the team's subscription.

**Required permission:** `billing.team.plans.settings`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `enabled` | bool | no | Enable auto recharge (default false) |
| `min_balance` | int | no | Balance (cents) at which a recharge is triggered |
| `amount` | int | no | Recharge amount (cents) per top-up |
| `max_count` | int | no | Maximum number of automatic recharges |
| `cooldown_seconds` | int | no | Minimum seconds between recharges |

### Success Response (200)

```json
{
  "subscription": {
    "id": "uuid",
    "owner_type": "team",
    "owner_id": "uuid",
    "plan_id": "plan_hobby",
    "status": "active",
    "auto_recharge_enabled": true,
    "auto_recharge_min_balance": 1000,
    "auto_recharge_amount": 5000,
    "auto_recharge_max_count": 5,
    "auto_recharge_cooldown_seconds": 3600,
    "auto_recharge_count": 0,
    "last_auto_recharge_at": null,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-10T00:00:00Z"
  }
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Invalid request body" |
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "No subscription for this team" |
| 500 | "Something went wrong" |

---

## PUT /api/teams/:teamId/plans/negative-limit

Set the negative balance limit of the team's subscription. Send `null` to remove it and fall back to the plan's limit.

**Required permission:** `billing.team.plans.settings`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `limit` | int \| null | no | Negative balance limit in cents; `null` removes the override |

### Success Response (200)

```json
{
  "subscription": {
    "id": "uuid",
    "owner_type": "team",
    "owner_id": "uuid",
    "plan_id": "plan_hobby",
    "status": "active",
    "negative_balance_limit": -1000,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-10T00:00:00Z"
  }
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Invalid request body" |
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "No subscription for this team" |
| 500 | "Something went wrong" |

---

## POST /api/teams/:teamId/plans/addons/:addonId/attach

Attach an addon plan to the team's subscription with the given quantity.

**Required permission:** `billing.team.plans.addons`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |
| `addonId` | string | ID of an addon plan (`is_addon` must be true) |

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `quantity` | int | yes | at least 1 |

### Success Response (201)

```json
{
  "addon": {
    "id": "uuid",
    "subscription_id": "uuid",
    "addon_id": "addon_extra_seats",
    "quantity": 3,
    "added_at": "2026-01-05T00:00:00Z",
    "current_period_start": "2026-01-05T00:00:00Z",
    "current_period_end": "2026-02-04T00:00:00Z"
  }
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Addon quantity must be at least 1" / "Plan is not an addon" / "Subscription is not active" / validation errors |
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "Addon not found or not attached" / "No subscription for this team" |
| 409 | "Addon is already attached to this subscription" |
| 500 | "Something went wrong" |

---

## PUT /api/teams/:teamId/plans/addons/:addonId

Update the quantity of an addon attached to the team's subscription.

**Required permission:** `billing.team.plans.addons`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |
| `addonId` | string | ID of the attached addon plan |

### Request Body

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `quantity` | int | yes | at least 1 |

### Success Response (200)

```json
{
  "message": "Addon updated successfully"
}
```

### Errors

| Status | Message |
|--------|---------|
| 400 | "Addon quantity must be at least 1" / validation errors |
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "Addon not found or not attached" / "No subscription for this team" |
| 500 | "Something went wrong" |

---

## DELETE /api/teams/:teamId/plans/addons/:addonId

Detach an addon from the team's subscription.

**Required permission:** `billing.team.plans.addons`

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `teamId` | string | UUID of the team |
| `addonId` | string | ID of the attached addon plan |

### Success Response (200)

```json
{
  "message": "Addon detached successfully"
}
```

### Errors

| Status | Message |
|--------|---------|
| 401 | "Authentication required" |
| 403 | "Not a member of this team" / "Insufficient permissions" |
| 404 | "Addon not found or not attached" / "No subscription for this team" |
| 500 | "Something went wrong" |

---

## Workflows

### Default Plan Assignment

```
1. Team is created (registration or POST /api/teams)
2. The active plan flagged is_default is loaded
3. A subscription with owner_type "team" is created for the team
   (skipped if no default plan exists or a subscription already exists)
4. GET /api/teams/:teamId/plans/me → View the subscription
```

### Change Plan Flow

```
1. GET  /api/teams/:teamId/plans/catalog           → Browse available plans
2. POST /api/teams/:teamId/plans/change            → Schedule upgrade/downgrade
3. GET  /api/teams/:teamId/plans/me                → Confirm scheduled_plan_id / scheduled_change_type
```

### Addon Flow

```
1. GET  /api/teams/:teamId/plans/catalog                           → Browse addons
2. POST /api/teams/:teamId/plans/addons/:addonId/attach            → Attach addon with quantity
3. PUT  /api/teams/:teamId/plans/addons/:addonId                   → Change quantity
4. DELETE /api/teams/:teamId/plans/addons/:addonId                 → Detach addon
```

### Usage & Billing Review Flow

```
1. GET /api/teams/:teamId/plans/usage      → Current period usage vs included amounts
2. GET /api/teams/:teamId/plans/ledger     → Credit ledger entries
3. GET /api/teams/:teamId/plans/invoices   → Invoices
```

## Plan Permissions

| Permission key | Description |
|----------------|-------------|
| `billing.team.plans.view` | View the team plan, usage, invoices and ledger |
| `billing.team.plans.change` | Change or cancel the team plan |
| `billing.team.plans.addons` | Attach, detach and update plan addons |
| `billing.team.plans.settings` | Configure team billing settings |

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
