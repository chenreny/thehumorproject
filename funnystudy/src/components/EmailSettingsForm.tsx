'use client';

import { useActionState, useEffect, useState } from 'react';
import { updateNotificationEmail, type NotificationEmailState } from '@/app/settings/email-actions';

export function EmailSettingsForm({ accountEmail, notificationEmail, onSaved, onClose, backLabel }: {
  accountEmail?: string;
  notificationEmail: string | null;
  onSaved: (email: string | null) => void;
  onClose: () => void;
  backLabel: string;
}) {
  const [state, action, pending] = useActionState(updateNotificationEmail, {
    status: 'idle', message: '', notificationEmail,
  } satisfies NotificationEmailState);
  const [value, setValue] = useState(notificationEmail || accountEmail || '');
  const [edited, setEdited] = useState(false);

  useEffect(() => {
    if (state.status !== 'success') return;
    onSaved(state.notificationEmail);
  }, [state, onSaved]);

  const inputClass = 'phone-setup-input mt-3 w-full rounded-xl border px-4 py-3 text-base outline-none focus:ring-2 focus:ring-[var(--input-ring)]';
  const primaryClass = 'phone-setup-primary rounded-xl px-5 py-3 text-sm font-bold shadow-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60';
  const secondaryClass = 'rounded-xl border border-[var(--panel-border)] bg-[var(--background)] px-4 py-3 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--phone-control)]';

  return <div className="notification-card notification-compact notification-phone-card">
    <div className="notification-body">
      <section className="phone-setup-card rounded-2xl border p-4 sm:p-5" aria-label="Notification email">
        <header className="notification-phone-heading">
          <div className="notification-top"><span className="notification-tag">CHANGE YOUR EMAIL</span></div>
          <h1>Where should we email you?</h1>
          <p className="notification-description">Choose the address for study reminders. Your sign-in email won’t change.</p>
        </header>
        <form action={action} onSubmit={() => setEdited(false)} className="space-y-3">
          <fieldset disabled={pending} className="space-y-5 disabled:opacity-70">
            <label htmlFor="notification-email-address" className="block text-sm font-semibold text-[var(--foreground)]">Email for study reminders
              <input id="notification-email-address" className={inputClass} name="notification_email" type="email" autoComplete="email" required maxLength={254} value={value} onChange={event => { setValue(event.target.value); setEdited(true); }} />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className={primaryClass} aria-busy={pending}>{pending ? 'Saving…' : 'Save email →'}</button>
              {accountEmail && value.toLowerCase() !== accountEmail.toLowerCase() ? <button type="button" className={secondaryClass} onClick={() => { setValue(accountEmail); setEdited(true); }}>Use sign-in email</button> : null}
            </div>
          </fieldset>
        </form>
        <div className="mt-3 min-h-6 text-sm" aria-live="polite">
          {state.status === 'error' ? <p role="alert" className="text-[var(--error-text)]">{state.message}</p> : null}
          {state.status === 'success' && !edited ? <p role="status" className="text-[var(--muted)]">{state.message}</p> : null}
        </div>
        {accountEmail ? <p className="phone-setup-divider notification-email-note border-t pt-3 text-xs leading-5 text-[var(--muted)]">Sign-in email: {accountEmail}</p> : null}
      </section>
    </div>
    <footer className="notification-footer"><button type="button" className="notification-link" onClick={onClose}>← {backLabel}</button></footer>
  </div>;
}
