import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminDiscountsQueryKey,
  createAdminDiscount,
  deleteAdminDiscount,
  getAdminDiscounts,
  updateAdminDiscount,
  type AdminDiscountInput,
  type AdminListParams,
} from '../api'

export function useAdminDiscounts(params?: AdminListParams) {
  return useQuery({
    queryKey: [...adminDiscountsQueryKey, params],
    queryFn: () => getAdminDiscounts(params),
  })
}

export function useCreateAdminDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: AdminDiscountInput) => createAdminDiscount(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminDiscountsQueryKey })
    },
  })
}

export function useUpdateAdminDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      discountId,
      body,
    }: {
      discountId: number
      body: AdminDiscountInput
    }) => updateAdminDiscount(discountId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminDiscountsQueryKey })
    },
  })
}

export function useDeleteAdminDiscount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (discountId: number) => deleteAdminDiscount(discountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminDiscountsQueryKey })
    },
  })
}
