'use client';

import { useActionState, useState } from 'react';
import { updateProfileNames } from '@/app/settings/actions';
import { INITIAL_SETTINGS_STATE, type AccountSettings } from '@/lib/account-settings';
import type { PhoneSettingsState } from '@/lib/phone-settings';
import { NotificationJourney } from './NotificationJourney';
import { PolicyLinks } from './PolicyLinks';

export function SettingsForm({ initialSettings, initialPhoneSettings, userId, email }: {
  initialSettings: AccountSettings; initialPhoneSettings: PhoneSettingsState; userId: string; email?: string;
}) {
  const [state, action, pending] = useActionState(updateProfileNames, INITIAL_SETTINGS_STATE);
  const [edited, setEdited] = useState(false);
  const [firstName, setFirstName] = useState(initialSettings.first_name ?? '');
  const [lastName, setLastName] = useState(initialSettings.last_name ?? '');
  return <>
    <section id="reminders" className="settings-notification-editor" aria-label="Notification settings">
      <NotificationJourney
        settings={initialSettings}
        initialPhone={initialPhoneSettings}
        userId={userId}
        email={email}
        next="/settings#reminders"
        initialStage="choices"
        onExit={() => window.location.assign('/settings#reminders')}
      />
    </section>

    <section className="settings-card settings-profile-card" aria-labelledby="settings-profile-title">
      <header className="settings-card-heading"><span className="settings-heading-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 21v-2a7 7 0 0 1 14 0v2" strokeLinecap="round" /></svg></span><div><h2 id="settings-profile-title">Your profile</h2><p>Let us know what to call you.</p></div></header>
      <form action={action} onSubmit={() => setEdited(false)} onReset={event => event.preventDefault()}>
        <fieldset disabled={pending} className="settings-card-body">
          <div className="settings-name-grid"><label>First name<input name="first_name" autoComplete="given-name" required minLength={2} value={firstName} onChange={event => { setFirstName(event.target.value); setEdited(true); }} /></label><label>Last name<input name="last_name" autoComplete="family-name" required minLength={2} value={lastName} onChange={event => { setLastName(event.target.value); setEdited(true); }} /></label></div>
          {state.status === 'error' ? <p role="alert" className="notification-error">{state.message}</p> : null}
          {state.status === 'success' && !edited ? <p role="status" className="settings-save-success"><NotificationIcon name="check" />{state.message}</p> : null}
        </fieldset>
        <footer className="settings-card-footer"><p>{edited ? 'You have unsaved changes.' : 'Your name appears on your account.'}</p><button disabled={pending} aria-busy={pending} className="notification-secondary">{pending ? 'Saving…' : 'Save name'}</button></footer>
      </form>
    </section>

    <footer className="settings-policy-footer"><PolicyLinks /></footer>
  </>;
}
