import { clearCookies } from '@/test-utils/cookies'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { userEvent } from 'vitest/browser'
import { getCookie, setCookie } from '@/lib/cookies'
import { DirectionProvider } from '@/context/direction-provider'
import { FontProvider } from '@/context/font-provider'
import { LayoutProvider } from '@/context/layout-provider'
import { ThemeProvider } from '@/context/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppearanceForm } from './appearance-form'

async function renderAppearanceForm({
  sidebarDefaultOpen = true,
}: {
  sidebarDefaultOpen?: boolean
} = {}) {
  return await render(
    <DirectionProvider>
      <ThemeProvider>
        <FontProvider>
          <LayoutProvider>
            <SidebarProvider defaultOpen={sidebarDefaultOpen}>
              <AppearanceForm />
            </SidebarProvider>
          </LayoutProvider>
        </FontProvider>
      </ThemeProvider>
    </DirectionProvider>
  )
}

describe('AppearanceForm (integration)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearCookies()
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.removeAttribute('dir')
  })

  it('renders all sections', async () => {
    const screen = await renderAppearanceForm()

    await expect
      .element(screen.getByText(/^Theme$/i))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(/^Font$/i))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(/^Sidebar$/i).first())
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(/^Layout$/i))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(/^Direction$/i))
      .toBeInTheDocument()
    await expect
      .element(
        screen.getByRole('button', { name: /reset all settings/i })
      )
      .toBeInTheDocument()
  })

  describe('theme preference', () => {
    it('applies light theme to <html> and cookie', async () => {
      const screen = await renderAppearanceForm()
      await userEvent.click(
        screen.getByRole('radio', { name: /select light/i })
      )
      await vi.waitFor(() =>
        expect(document.documentElement.classList.contains('light')).toBe(true)
      )
      expect(getCookie('vite-ui-theme')).toBe('light')
    })

    it('applies dark theme to <html> and cookie', async () => {
      const screen = await renderAppearanceForm()
      await userEvent.click(screen.getByRole('radio', { name: /select dark/i }))
      await vi.waitFor(() =>
        expect(document.documentElement.classList.contains('dark')).toBe(true)
      )
      expect(getCookie('vite-ui-theme')).toBe('dark')
    })

    it('applies system theme: stores cookie and applies a resolved light or dark class', async () => {
      setCookie('vite-ui-theme', 'light')
      const screen = await renderAppearanceForm()

      await userEvent.click(
        screen.getByRole('radio', { name: /select system/i })
      )
      await vi.waitFor(() => expect(getCookie('vite-ui-theme')).toBe('system'))
      await vi.waitFor(() => {
        const root = document.documentElement
        const hasLight = root.classList.contains('light')
        const hasDark = root.classList.contains('dark')
        expect(hasLight !== hasDark).toBe(true)
      })
    })
  })

  describe('sidebar variant', () => {
    it('selecting floating updates layout_variant cookie', async () => {
      const screen = await renderAppearanceForm()
      await userEvent.click(
        screen.getByRole('radio', { name: /select floating/i })
      )
      await vi.waitFor(() =>
        expect(getCookie('layout_variant')).toBe('floating')
      )
    })

    it('selecting sidebar updates layout_variant cookie', async () => {
      const screen = await renderAppearanceForm()
      await userEvent.click(
        screen.getByRole('radio', { name: /^select sidebar$/i })
      )
      await vi.waitFor(() =>
        expect(getCookie('layout_variant')).toBe('sidebar')
      )
    })

    it('selecting inset updates layout_variant cookie after another variant', async () => {
      const screen = await renderAppearanceForm()
      await userEvent.click(
        screen.getByRole('radio', { name: /select floating/i })
      )
      await vi.waitFor(() =>
        expect(getCookie('layout_variant')).toBe('floating')
      )

      await userEvent.click(
        screen.getByRole('radio', { name: /select inset/i })
      )
      await vi.waitFor(() => expect(getCookie('layout_variant')).toBe('inset'))
    })
  })

  describe('layout', () => {
    it('selecting full layout sets collapsible to offcanvas and closes sidebar', async () => {
      const screen = await renderAppearanceForm({ sidebarDefaultOpen: true })
      await userEvent.click(
        screen.getByRole('radio', { name: /select full layout/i })
      )
      await vi.waitFor(() =>
        expect(getCookie('layout_collapsible')).toBe('offcanvas')
      )
      await vi.waitFor(() => expect(getCookie('sidebar_state')).toBe('false'))
    })

    it('selecting compact closes sidebar and changes layout cookie', async () => {
      const screen = await renderAppearanceForm({ sidebarDefaultOpen: true })
      await expect
        .element(screen.getByRole('radio', { name: /select default/i }))
        .toHaveAttribute('data-state', 'checked')

      await userEvent.click(
        screen.getByRole('radio', { name: /select compact/i })
      )
      await vi.waitFor(() => expect(getCookie('sidebar_state')).toBe('false'))
      await vi.waitFor(() =>
        expect(getCookie('layout_collapsible')).toBe('icon')
      )
    })
  })

  describe('direction', () => {
    it('applies RTL direction to <html dir> and cookie', async () => {
      const screen = await renderAppearanceForm()
      await userEvent.click(
        screen.getByRole('radio', { name: /select right to left/i })
      )
      await vi.waitFor(() =>
        expect(document.documentElement.getAttribute('dir')).toBe('rtl')
      )
      expect(getCookie('dir')).toBe('rtl')
    })
  })

  describe('section reset buttons', () => {
    it('resets theme via section control after choosing dark', async () => {
      const screen = await renderAppearanceForm()
      await userEvent.click(screen.getByRole('radio', { name: /select dark/i }))
      await vi.waitFor(() => expect(getCookie('vite-ui-theme')).toBe('dark'))

      await userEvent.click(
        screen.getByRole('button', { name: /reset theme to default/i })
      )
      await vi.waitFor(() => expect(getCookie('vite-ui-theme')).toBe('system'))
    })

    it('resets direction via section control after choosing RTL', async () => {
      const screen = await renderAppearanceForm()
      await userEvent.click(
        screen.getByRole('radio', { name: /select right to left/i })
      )
      await vi.waitFor(() =>
        expect(document.documentElement.getAttribute('dir')).toBe('rtl')
      )

      await userEvent.click(
        screen.getByRole('button', { name: /reset text direction to default/i })
      )
      await vi.waitFor(() =>
        expect(document.documentElement.getAttribute('dir')).toBe('ltr')
      )
      expect(getCookie('dir')).toBe('ltr')
    })

    it('resets sidebar style via section control after choosing floating', async () => {
      const screen = await renderAppearanceForm()
      await userEvent.click(
        screen.getByRole('radio', { name: /select floating/i })
      )
      await vi.waitFor(() =>
        expect(getCookie('layout_variant')).toBe('floating')
      )

      await userEvent.click(
        screen.getByRole('button', { name: /reset sidebar style to default/i })
      )
      await vi.waitFor(() => expect(getCookie('layout_variant')).toBe('inset'))
    })

    it('resets layout via section control after choosing compact', async () => {
      const screen = await renderAppearanceForm({ sidebarDefaultOpen: true })
      await userEvent.click(
        screen.getByRole('radio', { name: /select compact/i })
      )
      await vi.waitFor(() => expect(getCookie('sidebar_state')).toBe('false'))

      await userEvent.click(
        screen.getByRole('button', { name: /reset layout to default/i })
      )
      await vi.waitFor(() => expect(getCookie('sidebar_state')).toBe('true'))
      await vi.waitFor(() =>
        expect(getCookie('layout_collapsible')).toBe('icon')
      )
    })
  })

  it('reset restores defaults across sidebar/theme/layout/direction', async () => {
    const screen = await renderAppearanceForm({ sidebarDefaultOpen: true })

    await userEvent.click(screen.getByRole('radio', { name: /select dark/i }))
    await userEvent.click(
      screen.getByRole('radio', { name: /select right to left/i })
    )
    await userEvent.click(
      screen.getByRole('radio', { name: /select floating/i })
    )
    await userEvent.click(
      screen.getByRole('radio', { name: /select full layout/i })
    )

    await vi.waitFor(() => expect(getCookie('vite-ui-theme')).toBe('dark'))
    await vi.waitFor(() => expect(getCookie('dir')).toBe('rtl'))
    await vi.waitFor(() => expect(getCookie('layout_variant')).toBe('floating'))
    await vi.waitFor(() =>
      expect(getCookie('layout_collapsible')).toBe('offcanvas')
    )

    await userEvent.click(
      screen.getByRole('button', { name: /reset all settings/i })
    )

    await vi.waitFor(() => expect(getCookie('sidebar_state')).toBe('true'))
    await vi.waitFor(() => expect(getCookie('dir')).toBeUndefined())
    await vi.waitFor(() => expect(getCookie('vite-ui-theme')).toBeUndefined())
    await vi.waitFor(() => expect(getCookie('layout_variant')).toBe('inset'))
    await vi.waitFor(() =>
      expect(getCookie('layout_collapsible')).toBe('icon')
    )
    await vi.waitFor(() =>
      expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    )
  })
})