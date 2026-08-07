import type { AuthUser } from '@/stores/auth-store'
import { http } from '@/lib/http'

export const meQueryKey = ['me'] as const

export async function getMe(): Promise<{ user: AuthUser }> {
  const { data } = await http.get<{ user: AuthUser }>('/user/me')
  return data
}

export async function login(body: { email: string; password: string }) {
  const { data } = await http.post<
    | { user: AuthUser; message: string; two_factor_required?: false }
    | { two_factor_required: true; message: string }
  >('/auth/login', body)
  return data
}

export async function verify2fa(body: { code: string }) {
  const { data } = await http.post<{ user: AuthUser; message: string }>(
    '/auth/2fa/verify',
    body
  )
  return data
}

export async function register(body: {
  name: string
  email: string
  password: string
}) {
  const { data } = await http.post<{
    user: AuthUser
    team_id: number
    message: string
  }>('/auth/register', body)
  return data
}

export async function forgotPassword(body: { email: string }) {
  const { data } = await http.post<{ message: string }>(
    '/auth/forgot-password',
    body
  )
  return data
}

export async function resetPassword(body: {
  token: string
  password: string
  password_confirmation: string
}) {
  const { data } = await http.post<{ message: string }>(
    '/auth/reset-password',
    body
  )
  return data
}

export async function logout() {
  const { data } = await http.post<{ message: string }>('/auth/logout')
  return data
}
