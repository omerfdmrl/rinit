import type { AuthUser } from '@/stores/auth-store'
import { http } from '@/lib/http'

export async function updateName(body: { name: string }): Promise<{
  user: AuthUser
  message: string
}> {
  const { data } = await http.put<{ user: AuthUser; message: string }>(
    '/user/name',
    body
  )
  return data
}

export async function updateEmailInit(body: {
  new_email: string
  password?: string
  two_factor_code?: string
}) {
  const { data } = await http.put<{ message: string }>('/user/email', body)
  return data
}

export async function updateEmailVerify(body: { token: string }) {
  const { data } = await http.put<{ message: string }>('/user/email/verify', body)
  return data
}

export async function updatePassword(body: {
  new_password: string
  current_password?: string
  two_factor_code?: string
}) {
  const { data } = await http.put<{ message: string }>('/user/password', body)
  return data
}

export async function enable2FA() {
  const { data } = await http.post<{
    secret: string
    qr_code: string
    message: string
  }>('/user/2fa/enable')
  return data
}

export async function verify2FA(body: { code: string }) {
  const { data } = await http.post<{ message: string }>(
    '/user/2fa/verify',
    body
  )
  return data
}

export async function disable2FA(body: {
  password?: string
  two_factor_code?: string
}) {
  const { data } = await http.post<{ message: string }>(
    '/user/2fa/disable',
    body
  )
  return data
}

export interface Session {
  id: string
  user_id: string
  user_agent: string
  ip_address: string
  device_name: string
  os: string
  browser: string
  expires_at: string
  created_at: string
}

export async function getSessions() {
  const { data } = await http.get<{
    sessions: Session[]
    current_session_id: string
  }>('/sessions/')
  return data
}

export async function revokeSession(id: string) {
  const { data } = await http.delete<{ message: string }>(`/sessions/${id}`)
  return data
}

export async function revokeAllSessions() {
  const { data } = await http.delete<{ message: string }>('/sessions/')
  return data
}