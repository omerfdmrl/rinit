import { http } from '@/lib/http'

export const adminPlansQueryKey = ['admin', 'billing', 'plans'] as const
export const adminMetricsQueryKey = ['admin', 'billing', 'metrics'] as const
export const adminDiscountsQueryKey = ['admin', 'billing', 'discounts'] as const
export const adminRestrictionsQueryKey = [
  'admin',
  'billing',
  'restrictions',
] as const

export type AdminPagination = {
  page: number
  per_page: number
  total: number
  total_pages: number
}

export type AdminPlanFeature = {
  feature_key: string
  value_type: string
  value_bool?: boolean
  value_number?: number
  value_string?: string
  value_json?: string
  unlimited?: boolean
}

export type AdminPlanMetric = {
  metric_key: string
  included_amount: number
  unlimited: boolean
  pricing_model: string
  unit_price: number
  package_size: number
  pricing_config?: string
  billing_type?: string
  proration_precision?: string
}

export type AdminPlan = {
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
  features?: AdminPlanFeature[]
  metrics?: AdminPlanMetric[]
}

export type AdminPlanInput = {
  code: string
  name: string
  description: string
  interval_type: string
  interval_days: number
  price_amount: number
  currency: string
  trial_days: number
  negative_balance_limit: number | null
  is_addon: boolean
  is_default: boolean
  features: AdminPlanFeature[]
  metrics: AdminPlanMetric[]
}

export type AdminUsageMetric = {
  id: number
  key: string
  name: string
  unit: string
  aggregation_type: string
  created_at: string
}

export type AdminDiscount = {
  id: number
  code: string
  name: string
  discount_type: string
  amount: number
  duration: string
  max_uses: number | null
  used_count: number
  starts_at: string | null
  ends_at: string | null
  active: boolean
  created_at: string
}

export type AdminRestrictionStage = {
  id: number
  name: string
  sort_order: number
  action: string
  trigger_balance: number | null
  description: string
  enabled: boolean
  created_at: string
}

export type AdminListParams = {
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  status?: string
  interval?: string
  is_addon?: boolean
}

// ---- Plans ----

export async function getAdminPlans(
  params?: AdminListParams
): Promise<{ plans: AdminPlan[]; pagination: AdminPagination }> {
  const { data } = await http.get<{
    plans: AdminPlan[]
    pagination: AdminPagination
  }>('/admin/billing/plans', { params })
  return data
}

export async function createAdminPlan(
  body: AdminPlanInput
): Promise<{ plan: AdminPlan }> {
  const { data } = await http.post<{ plan: AdminPlan }>(
    '/admin/billing/plans',
    body
  )
  return data
}

export async function updateAdminPlan(
  planId: number,
  body: AdminPlanInput
): Promise<{ plan: AdminPlan }> {
  const { data } = await http.put<{ plan: AdminPlan }>(
    `/admin/billing/plans/${planId}`,
    body
  )
  return data
}

export async function deleteAdminPlan(
  planId: number
): Promise<{ deleted: boolean }> {
  const { data } = await http.delete<{ deleted: boolean }>(
    `/admin/billing/plans/${planId}`
  )
  return data
}

export async function duplicateAdminPlan(
  planId: number,
  body: { code?: string }
): Promise<{ plan: AdminPlan }> {
  const { data } = await http.post<{ plan: AdminPlan }>(
    `/admin/billing/plans/${planId}/duplicate`,
    body
  )
  return data
}

export async function archiveAdminPlan(
  planId: number
): Promise<{ plan: AdminPlan }> {
  const { data } = await http.post<{ plan: AdminPlan }>(
    `/admin/billing/plans/${planId}/archive`
  )
  return data
}

export async function activateAdminPlan(
  planId: number
): Promise<{ plan: AdminPlan }> {
  const { data } = await http.post<{ plan: AdminPlan }>(
    `/admin/billing/plans/${planId}/activate`
  )
  return data
}

// ---- Metrics ----

export async function getAdminMetrics(
  params?: AdminListParams
): Promise<{ metrics: AdminUsageMetric[]; pagination: AdminPagination }> {
  const { data } = await http.get<{
    metrics: AdminUsageMetric[]
    pagination: AdminPagination
  }>('/admin/billing/metrics', { params })
  return data
}

export async function createAdminMetric(body: {
  key: string
  name: string
  unit: string
  aggregation_type?: string
}): Promise<{ metric: AdminUsageMetric }> {
  const { data } = await http.post<{ metric: AdminUsageMetric }>(
    '/admin/billing/metrics',
    body
  )
  return data
}

export async function updateAdminMetric(
  metricId: number,
  body: {
    key: string
    name: string
    unit: string
    aggregation_type?: string
  }
): Promise<{ metric: AdminUsageMetric }> {
  const { data } = await http.put<{ metric: AdminUsageMetric }>(
    `/admin/billing/metrics/${metricId}`,
    body
  )
  return data
}

export async function deleteAdminMetric(
  metricId: number
): Promise<{ deleted: boolean }> {
  const { data } = await http.delete<{ deleted: boolean }>(
    `/admin/billing/metrics/${metricId}`
  )
  return data
}

// ---- Discounts ----

export async function getAdminDiscounts(
  params?: AdminListParams
): Promise<{ discounts: AdminDiscount[]; pagination: AdminPagination }> {
  const { data } = await http.get<{
    discounts: AdminDiscount[]
    pagination: AdminPagination
  }>('/admin/billing/discounts', { params })
  return data
}

export type AdminDiscountInput = {
  code: string
  name: string
  discount_type: string
  amount: number
  duration: string
  max_uses: number | null
  starts_at: string | null
  ends_at: string | null
  active: boolean
}

export async function createAdminDiscount(
  body: AdminDiscountInput
): Promise<{ discount: AdminDiscount }> {
  const { data } = await http.post<{ discount: AdminDiscount }>(
    '/admin/billing/discounts',
    body
  )
  return data
}

export async function updateAdminDiscount(
  discountId: number,
  body: AdminDiscountInput
): Promise<{ discount: AdminDiscount }> {
  const { data } = await http.put<{ discount: AdminDiscount }>(
    `/admin/billing/discounts/${discountId}`,
    body
  )
  return data
}

export async function deleteAdminDiscount(
  discountId: number
): Promise<{ deleted: boolean }> {
  const { data } = await http.delete<{ deleted: boolean }>(
    `/admin/billing/discounts/${discountId}`
  )
  return data
}

// ---- Restriction stages ----

export async function getAdminRestrictionStages(): Promise<{
  stages: AdminRestrictionStage[]
}> {
  const { data } = await http.get<{ stages: AdminRestrictionStage[] }>(
    '/admin/billing/restriction-stages'
  )
  return data
}

export type AdminRestrictionStageInput = {
  name: string
  sort_order: number
  action: string
  trigger_balance: number | null
  description: string
  enabled: boolean
}

export async function createAdminRestrictionStage(
  body: AdminRestrictionStageInput
): Promise<{ stage: AdminRestrictionStage }> {
  const { data } = await http.post<{ stage: AdminRestrictionStage }>(
    '/admin/billing/restriction-stages',
    body
  )
  return data
}

export async function updateAdminRestrictionStage(
  stageId: number,
  body: AdminRestrictionStageInput
): Promise<{ stage: AdminRestrictionStage }> {
  const { data } = await http.put<{ stage: AdminRestrictionStage }>(
    `/admin/billing/restriction-stages/${stageId}`,
    body
  )
  return data
}

export async function deleteAdminRestrictionStage(
  stageId: number
): Promise<{ deleted: boolean }> {
  const { data } = await http.delete<{ deleted: boolean }>(
    `/admin/billing/restriction-stages/${stageId}`
  )
  return data
}
