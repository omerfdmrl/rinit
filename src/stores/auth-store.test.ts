import { describe, expect, it } from 'vitest'

async function importAuthStore() {
  const { useAuthStore } = await import('./auth-store')
  return useAuthStore
}

const sampleUser = {
  id: 1,
  name: 'John Doe',
  email: 'user@example.com',
  two_factor_enabled: false,
  permissions: ['post:read'],
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('useAuthStore', () => {
  it('starts with no user', async () => {
    const useAuthStore = await importAuthStore()

    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('updates the signed-in user via setUser', async () => {
    const useAuthStore = await importAuthStore()

    useAuthStore.getState().auth.setUser({ ...sampleUser })

    expect(useAuthStore.getState().auth.user).toEqual(sampleUser)
  })

  it('reset clears the user', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setUser({ ...sampleUser })

    useAuthStore.getState().auth.reset()

    expect(useAuthStore.getState().auth.user).toBeNull()
  })

  it('clears the user with setUser(null)', async () => {
    const useAuthStore = await importAuthStore()
    useAuthStore.getState().auth.setUser({ ...sampleUser })

    useAuthStore.getState().auth.setUser(null)

    expect(useAuthStore.getState().auth.user).toBeNull()
  })
})
