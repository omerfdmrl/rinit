export const intervalTypes = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom' },
] as const

export const planStatuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
] as const

export const planStatusLabel: Record<string, string> = {
  draft: 'Draft',
  active: 'Active',
  archived: 'Archived',
}

export const intervalLabel: Record<string, string> = Object.fromEntries(
  intervalTypes.map((i) => [i.value, i.label])
)

export const featureValueTypes = [
  { value: 'bool', label: 'Boolean' },
  { value: 'number', label: 'Number' },
  { value: 'string', label: 'String' },
  { value: 'json', label: 'JSON' },
] as const

export const pricingModels = [
  { value: 'included_only', label: 'Included only' },
  { value: 'pay_as_you_go', label: 'Pay as you go' },
  { value: 'pure_usage', label: 'Pure usage' },
  { value: 'flat', label: 'Flat' },
  { value: 'per_unit', label: 'Per unit' },
  { value: 'per_package', label: 'Per package' },
  { value: 'tiered', label: 'Tiered' },
  { value: 'volume', label: 'Volume' },
] as const

export const billingTypes = [
  { value: 'instant', label: 'Instant' },
  { value: 'prorated', label: 'Prorated' },
] as const

export const aggregationTypes = [
  { value: 'sum', label: 'Sum' },
  { value: 'max', label: 'Max' },
  { value: 'last', label: 'Last' },
] as const

export const discountTypes = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'fixed', label: 'Fixed amount' },
] as const

export const discountDurations = [
  { value: 'one_cycle', label: 'One cycle' },
  { value: 'lifetime', label: 'Lifetime' },
  { value: 'trial', label: 'Trial' },
] as const

export const restrictionActions = [
  { value: 'restrict_write', label: 'Restrict write' },
  { value: 'suspend', label: 'Suspend' },
  { value: 'cleanup_eligible', label: 'Cleanup eligible' },
] as const
