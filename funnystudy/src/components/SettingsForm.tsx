'use client';

import { useActionState, useState } from 'react';
import { updateProfileNames } from '@/app/settings/actions';
import { INITIAL_SETTINGS_STATE, type AccountSettings } from '@/lib/account-settings';
import type { PhoneSettingsState } from '@/lib/phone-settings';
import { NotificationIcon } from './NotificationIcon';
import { NotificationJourney } from './NotificationJourney';

export function SettingsForm({ initialSettings, initialPhoneSettings, userId, email }: {
  initialSettings: AccountSettings; initialPhoneSettings: PhoneSettingsState; userId: string; email?: string;
}) {
  const [state, action, pending] = useActionState(updateProfileNames, INITIAL_SETTINGS_STATE);
  const [edited, setEdited] = useState(false);
  const [firstName, setFirstName] = useState(initialSettings.first_name ?? '');
  const [lastName, setLastName] = useState(initialSettings.last_name ?? '');
  const profileName = [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') || 'Your name';
  const initials = [firstName.trim()[0], lastName.trim()[0]].filter(Boolean).join('').toUpperCase()
    || email?.trim()[0]?.toUpperCase() || '?';
  return <>
    <div className="settings-panel-grid">
      <section id="reminders" className="settings-notification-editor" aria-label="Notification settings">
        <NotificationJourney
          settings={initialSettings}
          initialPhone={initialPhoneSettings}
          userId={userId}
          email={email}
          next="/settings#reminders"
          initialStage="choices"
          stayOnChoicesAfterSave
          onExit={() => window.location.assign('/settings#reminders')}
        />
      </section>

      <section className="settings-card settings-profile-card" aria-label="Profile settings">
        <form action={action} onSubmit={() => setEdited(false)} onReset={event => event.preventDefault()}>
          <fieldset disabled={pending} className="settings-card-body">
            <div className="settings-profile-summary">
              <span className="settings-profile-avatar" aria-hidden="true">{initials}</span>
              <div className="settings-profile-identity">
                <strong>{profileName}</strong>
                {email ? <span>{email}</span> : null}
              </div>
            </div>
            <div className="settings-name-grid"><label>First name<input name="first_name" autoComplete="given-name" required minLength={2} value={firstName} onChange={event => { setFirstName(event.target.value); setEdited(true); }} /></label><label>Last name<input name="last_name" autoComplete="family-name" required minLength={2} value={lastName} onChange={event => { setLastName(event.target.value); setEdited(true); }} /></label></div>
            {state.status === 'error' ? <p role="alert" className="notification-error">{state.message}</p> : null}
            {state.status === 'success' && !edited ? <p role="status" className="settings-save-success"><NotificationIcon name="check" />{state.message}</p> : null}
          </fieldset>
          <footer className="settings-card-footer">{pending || edited || state.status === 'error' ? <p>{pending ? 'Saving your name…' : 'You have unsaved changes.'}</p> : null}<button disabled={pending} aria-busy={pending} className="notification-secondary">{pending ? 'Saving…' : 'Save name'}</button></footer>
        </form>
      </section>
    </div>

  </>;
}
