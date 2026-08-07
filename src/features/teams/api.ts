import type { Team } from '@/stores/team-store'
import { http } from '@/lib/http'

export const teamsQueryKey = ['teams'] as const
export const currentTeamQueryKey = ['teams', 'current'] as const
export const teamMembersQueryKey = ['teams', 'members'] as const
export const teamRolesQueryKey = ['teams', 'roles'] as const
export const teamPermissionsQueryKey = ['teams', 'permissions'] as const

export async function getTeams(): Promise<Team[]> {
  const { data } = await http.get<Team[]>('/teams/')
  return data
}

export async function getCurrentTeam(): Promise<Team> {
  const { data } = await http.get<Team>('/teams/current')
  return data
}

export async function createTeam(body: { name: string }): Promise<Team> {
  const { data } = await http.post<Team>('/teams/', body)
  return data
}

export async function switchTeam(body: { team_id: number }): Promise<Team> {
  const { data } = await http.post<Team>('/teams/switch', body)
  return data
}

export async function updateTeam(
  teamId: number,
  body: { name: string }
): Promise<Team> {
  const { data } = await http.put<Team>(`/teams/${teamId}`, body)
  return data
}

export type TeamMember = {
  id: number
  team_id: number
  user_id: number
  name: string
  email: string
  role: string
  created_at: string
}

export type MembersResponse = {
  members: TeamMember[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export async function getTeamMembers(
  teamId: number,
  params?: {
    page?: number
    per_page?: number
    sort_by?: string
    sort_order?: string
    role?: string
  }
): Promise<MembersResponse> {
  const { data } = await http.get<MembersResponse>(`/teams/${teamId}/members`, {
    params,
  })
  return data
}

export async function removeTeamMember(
  teamId: number,
  userId: number
): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(
    `/teams/${teamId}/members/${userId}`
  )
  return data
}

export async function assignMemberRole(
  teamId: number,
  userId: number,
  role: string
): Promise<{
  id: number
  team_id: number
  user_id: number
  role: string
  created_at: string
}> {
  const { data } = await http.put<{
    id: number
    team_id: number
    user_id: number
    role: string
    created_at: string
  }>(`/teams/${teamId}/members/${userId}/role`, { role })
  return data
}

export type TeamRole = {
  id: number
  role_name: string
  team_id: number
  is_default: boolean
  description: string
  created_at: string
  updated_at: string
}

export type TeamRoleWithPermissions = {
  role: TeamRole
  permissions: Permission[]
}

export async function getTeamRoles(
  teamId: number
): Promise<{ roles: TeamRoleWithPermissions[] }> {
  const { data } = await http.get<{ roles: TeamRoleWithPermissions[] }>(
    `/teams/${teamId}/roles`
  )
  return data
}

export async function createTeamRole(
  teamId: number,
  body: {
    name: string
    description?: string
    permission_keys?: string[]
  }
): Promise<TeamRole> {
  const { data } = await http.post<TeamRole>(`/teams/${teamId}/roles`, body)
  return data
}

export async function updateTeamRole(
  teamId: number,
  roleId: number,
  body: {
    name?: string
    description?: string
    permission_keys?: string[]
  }
): Promise<TeamRole> {
  const { data } = await http.put<TeamRole>(
    `/teams/${teamId}/roles/${roleId}`,
    body
  )
  return data
}

export async function deleteTeamRole(
  teamId: number,
  roleId: number
): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(
    `/teams/${teamId}/roles/${roleId}`
  )
  return data
}

export type Permission = {
  id: number
  permission_key: string
  description: string
  is_system: boolean
  is_assignable: boolean
  created_at: string
}

export async function getTeamPermissions(
  teamId: number
): Promise<{ permissions: Permission[] }> {
  const { data } = await http.get<{ permissions: Permission[] }>(
    `/teams/${teamId}/permissions`
  )
  return data
}

export async function inviteTeamMember(
  teamId: number,
  body: {
    email: string
    role?: string
  }
): Promise<{ invitation_id: number; message: string }> {
  const { data } = await http.post<{
    invitation_id: number
    message: string
  }>(`/teams/${teamId}/invite`, body)
  return data
}

// ---------------------------------------------------------------------------
// Plans / Billing
// ---------------------------------------------------------------------------

export const plansCatalogQueryKey = ['teams', 'plans', 'catalog'] as const
export const subscriptionQueryKey = ['teams', 'plans', 'me'] as const
export const planUsageQueryKey = ['teams', 'plans', 'usage'] as const
export const invoicesQueryKey = ['teams', 'plans', 'invoices'] as const
export const ledgerQueryKey = ['teams', 'plans', 'ledger'] as const

export type PlanFeature = {
  id: number
  feature_key: string
  value_type: string
  value_bool: boolean
  value_number: number
  value_string: string
  value_json: string
  unlimited: boolean
  created_at: string
}

export type PlanMetric = {
  id: number
  metric_key: string
  included_amount: number
  unlimited: boolean
  pricing_model: string
  unit_price: number
  package_size: number
  pricing_config: string
  billing_type: string
  proration_precision: string
  created_at: string
}

export type Plan = {
  id: number
  code: string
  name: string
  description: string
  status: string
  interval_type: string
  interval_days: number
  price_amount: number
  currency: string
  trial_days: number
  negative_balance_limit: number | null
  is_addon: boolean
  is_default: boolean
  created_at: string
  updated_at: string
  features: PlanFeature[]
  metrics: PlanMetric[]
}

export type PlanUsage = {
  metric_key: string
  total: number
  included: number
  unlimited: boolean
  aggregation: string
}

export type SubscriptionAddon = {
  id: number
  subscription_id: number
  addon_id: number
  quantity: number
  added_at: string
  current_period_start: string
  current_period_end: string
}

export type Subscription = {
  id: number
  owner_type: string
  owner_id: number
  plan_id: number
  status: string
  started_at: string
  current_period_start: string
  current_period_end: string
  trial_ends_at: string | null
  renewed_at: string | null
  cancelled_at: string | null
  credit_balance: number
  negative_balance_limit: number | null
  auto_recharge_enabled: boolean
  auto_recharge_min_balance: number
  auto_recharge_amount: number
  auto_recharge_max_count: number
  auto_recharge_cooldown_seconds: number
  auto_recharge_count: number
  last_auto_recharge_at: string | null
  scheduled_plan_id: number | null
  scheduled_change_type: string
  created_at: string
  updated_at: string
  plan: Plan | null
}

export type CatalogResponse = {
  plans: Plan[]
  addons: Plan[]
}

export type SubscriptionResponse = {
  subscription: Subscription
  usage: PlanUsage[]
  addons: SubscriptionAddon[]
}

export type InvoiceItem = {
  id: number
  kind: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  metadata: string
  position: number
}

export type Invoice = {
  id: number
  number: string
  subscription_id: number
  status: string
  period_start: string
  period_end: string
  subtotal: number
  discount_amount: number
  tax_amount: number
  credits_applied: number
  total: number
  currency: string
  due_at: string | null
  finalized_at: string | null
  paid_at: string | null
  metadata: string
  created_at: string
  items: InvoiceItem[]
}

export type LedgerEntry = {
  id: number
  subscription_id: number
  entry_type: string
  amount: number
  balance_after: number
  currency: string
  reference_id: number
  description: string
  metadata: string
  created_at: string
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export async function getPlansCatalog(
  teamId: number
): Promise<CatalogResponse> {
  const { data } = await http.get<CatalogResponse>(
    `/teams/${teamId}/plans/catalog`
  )
  return data
}

export async function getSubscription(
  teamId: number
): Promise<SubscriptionResponse> {
  const { data } = await http.get<SubscriptionResponse>(
    `/teams/${teamId}/plans/me`
  )
  return data
}

export async function changePlan(
  teamId: number,
  body: { plan_id: number; change_type: 'upgrade' | 'downgrade' }
): Promise<{ subscription: Subscription }> {
  const { data } = await http.post<{ subscription: Subscription }>(
    `/teams/${teamId}/plans/change`,
    body
  )
  return data
}

export async function cancelSubscription(
  teamId: number
): Promise<{ subscription: Subscription }> {
  const { data } = await http.post<{ subscription: Subscription }>(
    `/teams/${teamId}/plans/cancel`
  )
  return data
}

export async function getPlanUsage(
  teamId: number
): Promise<{ usage: PlanUsage[] }> {
  const { data } = await http.get<{ usage: PlanUsage[] }>(
    `/teams/${teamId}/plans/usage`
  )
  return data
}

export async function getInvoices(
  teamId: number,
  params?: { page?: number; per_page?: number; status?: string }
): Promise<{
  invoices: Invoice[]
  pagination: PaginatedResponse<Invoice>['pagination']
}> {
  const { data } = await http.get(`/teams/${teamId}/plans/invoices`, { params })
  return data
}

export async function getLedger(
  teamId: number,
  params?: { page?: number; per_page?: number; entry_type?: string }
): Promise<{
  ledger: LedgerEntry[]
  pagination: PaginatedResponse<LedgerEntry>['pagination']
}> {
  const { data } = await http.get(`/teams/${teamId}/plans/ledger`, { params })
  return data
}

export async function updateRecharge(
  teamId: number,
  body: {
    enabled?: boolean
    min_balance?: number
    amount?: number
    max_count?: number
    cooldown_seconds?: number
  }
): Promise<{ subscription: Subscription }> {
  const { data } = await http.put<{ subscription: Subscription }>(
    `/teams/${teamId}/plans/recharge`,
    body
  )
  return data
}

export async function setNegativeLimit(
  teamId: number,
  body: { limit: number | null }
): Promise<{ subscription: Subscription }> {
  const { data } = await http.put<{ subscription: Subscription }>(
    `/teams/${teamId}/plans/negative-limit`,
    body
  )
  return data
}

export async function attachAddon(
  teamId: number,
  addonId: number,
  body: { quantity: number }
): Promise<{ addon: SubscriptionAddon }> {
  const { data } = await http.post<{ addon: SubscriptionAddon }>(
    `/teams/${teamId}/plans/addons/${addonId}/attach`,
    body
  )
  return data
}

export async function updateAddonQuantity(
  teamId: number,
  addonId: number,
  body: { quantity: number }
): Promise<{ message: string }> {
  const { data } = await http.put<{ message: string }>(
    `/teams/${teamId}/plans/addons/${addonId}`,
    body
  )
  return data
}

export async function detachAddon(
  teamId: number,
  addonId: number
): Promise<{ message: string }> {
  const { data } = await http.delete<{ message: string }>(
    `/teams/${teamId}/plans/addons/${addonId}`
  )
  return data
}
