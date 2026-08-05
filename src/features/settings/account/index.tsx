import { ContentSection } from '../components/content-section'
import { AccountEmailForm } from './account-email-form'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection title='Account' desc='Manage your name and email.'>
      <div className='space-y-14'>
        <div className='space-y-2'>
          <AccountForm />
        </div>
        <div className='space-y-2'>
          <AccountEmailForm />
        </div>
      </div>
    </ContentSection>
  )
}
