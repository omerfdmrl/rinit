import { ContentSection } from '../components/content-section'
import { Security2FAForm } from './security-2fa-form'
import { SecurityPasswordForm } from './security-password-form'
import { SecuritySessionsForm } from './security-sessions-form'

export function SettingsSecurity() {
  return (
    <ContentSection
      title='Security'
      desc='Manage the security of your account.'
    >
      <div className='space-y-6'>
        <SecurityPasswordForm />
        <Security2FAForm />
        <SecuritySessionsForm />
      </div>
    </ContentSection>
  )
}
