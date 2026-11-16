'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { saveNotificationJourney, markNotificationSetupHandled } from '@/app/notification-preferences/save-journey';
import type { AccountSettings } from '@/lib/account-settings';
import type { PhoneSettingsState } from '@/lib/phone-settings';
import { INITIAL_JOURNEY_STATE, hasSavedNotifications, notificationChannels, notificationDraftKey, notificationHandledKey, readNotificationDraft, savedChoices, type JourneyState, type NotificationChoices, type NotificationDraft } from '@/lib/notification-journey';
import { PhoneSettingsForm } from './PhoneSettingsForm';
import { EmailSettingsForm } from './EmailSettingsForm';
import { NotificationDialog } from './NotificationDialog';
import { PolicyLinks } from './PolicyLinks';
import { NotificationIcon } from './NotificationIcon';

type Stage = 'overview' | 'choices' | 'verify';
export function NotificationJourney({ settings, initialPhone, userId, email, initialStage = 'choices', onExit, next = '/', stayOnChoicesAfterSave = false }: {
  settings: AccountSettings; initialPhone: PhoneSettingsState; userId: string; email?: string;
  initialStage?: 'choices' | 'overview'; onExit?: (saved: boolean) => void; next?: string; stayOnChoicesAfterSave?: boolean;
}) {
  const router = useRouter();
  const [choices, setChoices] = useState<NotificationChoices>(() => savedChoices(settings));
  const [savedChoiceValues, setSavedChoiceValues] = useState<NotificationChoices>(() => savedChoices(settings));
  const [stage, setStage] = useState<Stage>(initialStage);
  const [draft, setDraft] = useState<NotificationDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [phone, setPhone] = useState(initialPhone.verifiedPhone);
  const [pendingPhone, setPendingPhone] = useState(initialPhone.pendingPhone);
  const [notificationEmail, setNotificationEmail] = useState(settings.notification_email);
  const [contactPopup, setContactPopup] = useState<'email' | 'phone' | null>(null);
  const [editedSinceSave, setEditedSinceSave] = useState(false);
  const [savedMessageDismissed, setSavedMessageDismissed] = useState(false);
  const [saveState, saveAction, saving] = useActionState(async (previousState: JourneyState, formData: FormData) => {
    const result = await saveNotificationJourney(previousState, formData);
    if (result.status === 'saved') {
      setSavedChoiceValues(choices);
      setEditedSinceSave(false);
      setSavedMessageDismissed(false);
    }
    return result;
  }, INITIAL_JOURNEY_STATE);
  const hasSaved = hasSavedNotifications(settings);
  const key = notificationDraftKey(userId);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      let stored: NotificationDraft | null = null;
      try { stored = readNotificationDraft(localStorage.getItem(key)); } catch { /* Storage is optional. */ }
      setDraft(stored);
      if (initialStage === 'choices' && stored) { setChoices(stored.choices); setStage(stored.stage); }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [key, initialStage]);

  useEffect(() => {
    if (!ready || stage === 'overview') return;
    try {
      if (saveState.status === 'saved' && !editedSinceSave) { localStorage.removeItem(key); localStorage.setItem(notificationHandledKey(userId), 'handled'); }
      else localStorage.setItem(key, JSON.stringify({ choices, stage }));
    } catch { /* An unavailable browser store must not block setup. */ }
  }, [choices, stage, ready, key, saveState.status, editedSinceSave, userId]);

  useEffect(() => {
    if (!stayOnChoicesAfterSave || saveState.status !== 'saved' || saving || editedSinceSave || savedMessageDismissed) return;
    const timer = window.setTimeout(() => setSavedMessageDismissed(true), 20_000);
    return () => window.clearTimeout(timer);
  }, [stayOnChoicesAfterSave, saveState, saving, editedSinceSave, savedMessageDismissed]);

  const finish = (saved = false, discard = false) => {
    try {
      localStorage.setItem(notificationHandledKey(userId), 'handled');
      if (discard || saved) localStorage.removeItem(key);
    } catch { /* Preferences still save on the server. */ }
    void markNotificationSetupHandled().catch(() => undefined);
    if (onExit) onExit(saved); else { router.push(next); router.refresh(); }
  };
  const verified = useCallback((value: string) => { setPhone(value); setPendingPhone(''); setStage('choices'); setContactPopup(null); }, []);
  const openPhone = () => { if (stayOnChoicesAfterSave) setContactPopup('phone'); else setStage('verify'); };
  const discard = () => { try { localStorage.removeItem(key); } catch {} setDraft(null); setChoices(savedChoices(settings)); };
  const begin = () => { setChoices(savedChoices(settings)); setStage('choices'); };
  const cancelEdit = () => {
    discard();
    if (onExit) onExit(false); else setStage('overview');
  };
  const needsPhone = choices.notify_new_study_sms || choices.notify_new_study_phone_call;
  const hasUnsavedChoices = notificationChannels.some(({ name }) => choices[name] !== savedChoiceValues[name]);
  const showChoicesFooter = !stayOnChoicesAfterSave || hasUnsavedChoices || saving;

  if (!ready) return <div className="notification-card"><div className="notification-body"><p role="status">Loading your preferences…</p></div></div>;
  if (saveState.status === 'saved' && !stayOnChoicesAfterSave) return <div className="notification-card notification-compact">
    <div className="notification-body"><span className="notification-success"><NotificationIcon name="check" /></span><h1>You’re all set.</h1><p className="notification-description">Your preferences are saved. You can change them anytime from your account.</p><NotificationSummary choices={choices} /></div>
    <footer className="notification-footer"><a className="notification-link" href="/settings#reminders">Manage preferences</a><button className="notification-primary" onClick={() => finish(true)}>Back to {next.startsWith('/settings') ? 'Settings' : next.startsWith('/study/') ? 'study' : 'studies'} <span>→</span></button></footer>
  </div>;

  if (stage === 'overview') return <div className="notification-card">
    <div className="notification-body"><div className="notification-top"><span className="notification-tag">YOUR ACCOUNT</span></div><h1>Notifications</h1><p className="notification-description">Manage how we keep in touch about new studies.</p>
      {draft ? <div className="notification-draft"><div><strong>{hasSaved ? 'You have unsaved changes.' : 'Pick up where you left off.'}</strong><p>{hasSaved ? 'Your saved preferences are still active.' : 'Your draft has not enabled any reminders.'}</p></div><div><button className="notification-secondary" onClick={() => { setChoices(draft.choices); setStage(draft.stage); }}>Continue</button><button className="notification-link" onClick={discard}>Discard</button></div></div> : null}
      {hasSaved ? <NotificationSummary choices={savedChoices(settings)} /> : <p className="notification-empty">No reminders are on. Set them up whenever you’re ready.</p>}
      {!draft ? <button className="notification-primary notification-edit" onClick={begin}>{hasSaved ? 'Edit preferences' : 'Set up notifications'} <span>→</span></button> : null}
      <div className="notification-phone-row"><div><strong>Phone number</strong><p>{phone || 'No verified number yet.'}</p></div>{phone ? <button className="notification-link" onClick={openPhone}>Change number</button> : null}</div>
    </div><footer className="notification-footer"><Link className="notification-link" href="/">← Back to studies</Link><PolicyLinks /></footer>
  </div>;

  if (stage === 'verify') return <div className="notification-card notification-compact notification-phone-card">
    <div className="notification-body">
      <PhoneSettingsForm compact initialState={{ ...initialPhone, verifiedPhone: phone, pendingPhone }} onVerified={verified} onPendingPhone={setPendingPhone} />
    </div><footer className="notification-footer"><button className="notification-link" onClick={() => setStage('choices')}>← Back to choices</button><button className="notification-link" onClick={() => finish()}>Exit setup</button></footer>
  </div>;

  return <><div className={`notification-card${hasSaved ? ' notification-edit-card' : ''}`}>
    <div className="notification-body">{stayOnChoicesAfterSave ? <div className="notification-settings-heading"><h1>Notification settings</h1><span className="notification-settings-bell" aria-hidden="true"><NotificationIcon name="bell" /></span></div> : <><div className="notification-top"><span className="notification-tag">{hasSaved ? 'PREFERENCES' : 'MAKE IT YOURS'}</span><span>{hasSaved ? 'Manage preferences' : 'Optional setup'}</span></div><h1>{hasSaved ? 'Notification settings' : 'How should we reach you?'}</h1><p className="notification-description">{hasSaved ? 'Choose your channels, then save your changes.' : 'Pick what works for you. You can change this anytime.'}</p></>}
      {stayOnChoicesAfterSave ? <div className="notification-schedule"><span className="notification-schedule-label">WHEN</span><div className="notification-schedule-time"><strong>12:00<span>PM</span></strong><small>Noon Eastern</small></div><div className="notification-schedule-copy"><strong>While you have an unfinished study.</strong><small>At most once daily per channel.</small></div></div> : null}
      <div className="notification-channels">{stayOnChoicesAfterSave ? <span className="notification-send-via">SEND VIA</span> : null}{notificationChannels.map(({ name, label }, index) => {
        const locked = index > 0 && !phone;
        const on = choices[name];
        const hint = locked ? 'Verify your phone to enable' : index === 0 ? notificationEmail || email || 'Your notification email address'
          : hasSaved ? index === 1 ? stayOnChoicesAfterSave ? 'A short reminder by text' : 'A quick heads-up by SMS'
            : stayOnChoicesAfterSave ? 'An automated voice reminder' : 'An automated voice update' : phone;
        return <div className={`notification-channel${locked ? ' is-locked' : ''}`} key={name}>
          <span className="notification-channel-icon"><NotificationIcon name={index === 0 ? 'email' : index === 1 ? 'sms' : 'call'} /></span>
          <div className="notification-channel-copy"><strong>{label}{locked ? <NotificationIcon name="lock" /> : null}</strong>
          {index === 0 ? <div className="notification-email-line"><small id={`hint-${name}`}>{hint}</small><button type="button" className="notification-email-link" aria-haspopup="dialog" aria-expanded={contactPopup === 'email'} onClick={() => setContactPopup('email')}>Change email</button></div> : <small id={`hint-${name}`}>{hint}</small>}
          {on && index > 0 && (!hasSaved || !settings[name]) ? <p className="notification-consent">{index === 1 ? 'By saving, you consent to automated study reminder texts, at most once daily. Message and data rates may apply. Reply STOP to stop or HELP for help.' : 'By saving, you consent to automated calls using an artificial or prerecorded voice from Humor Study, operated by Sparkling Javascript, Inc., at most once daily. Your phone plan may charge for calls.'}</p> : null}</div>
          <button type="button" role="switch" aria-label={label} aria-checked={on} aria-describedby={`hint-${name}`} disabled={Boolean(locked || saving)} className={`notification-switch${locked ? ' is-locked' : ''}`} onClick={() => { if (!locked) { setChoices(current => ({ ...current, [name]: !current[name] })); setEditedSinceSave(true); } }} />
        </div>;
      })}</div>
      {hasSaved && phone ? <>
        <div className={`notification-verified-strip${stayOnChoicesAfterSave ? ' notification-settings-phone' : ''}`}>{stayOnChoicesAfterSave ? <><span className="notification-phone-label">PHONE</span><div><strong>{phone}</strong><p className="notification-phone-confirmed"><NotificationIcon name="check" /> Verified for texts and calls</p></div><button type="button" disabled={saving} className="notification-link" aria-label="Change phone number" aria-haspopup="dialog" onClick={openPhone}>Change</button></> : <><span className="notification-verified-check"><NotificationIcon name="check" /></span><div><strong>Phone verified</strong><p>{phone}</p></div><button type="button" disabled={saving} className="notification-link" onClick={openPhone}>Change number</button></>}</div>
        {!stayOnChoicesAfterSave ? <p className="notification-verification-note">Verification unlocks texts and calls. Turn on each one above if you’d like to receive them.</p> : null}
      </> : <div className="notification-verify-box"><strong><NotificationIcon name={phone ? 'check' : 'lock'} />{phone ? 'Your phone is verified.' : 'One quick check, two more options.'}</strong><p>{phone ? 'Choose your channels above, then save your preferences.' : 'Verify your phone number to unlock texts and calls. Both stay off until you choose to turn them on.'}</p><button type="button" disabled={saving} className="notification-secondary" aria-haspopup={stayOnChoicesAfterSave ? 'dialog' : undefined} onClick={openPhone}>{phone ? 'Change phone number' : 'Verify phone number'} <span>→</span></button></div>}
      {saveState.status === 'error' ? <p role="alert" className="notification-error">{saveState.message}</p> : null}
      {stayOnChoicesAfterSave && saveState.status === 'saved' && !saving && !editedSinceSave && !savedMessageDismissed ? <p role="status" className="notification-saved-inline"><NotificationIcon name="check" /> Changes saved.</p> : null}
      {!hasSaved && !stayOnChoicesAfterSave ? <p className="notification-policy">Reminders are optional. <PolicyLinks /></p> : null}
    </div>
    {showChoicesFooter ? <form action={saveAction} className="notification-footer notification-save">
      {notificationChannels.map(({ name }) => <input key={name} type="hidden" name={name} value={choices[name] ? 'yes' : 'no'} />)}
      <div className="notification-footer-actions"><button disabled={saving} type="button" className="notification-link" onClick={() => hasSaved ? cancelEdit() : finish(false, true)}>{hasSaved ? 'Cancel' : 'Skip for now'}</button><button type="submit" disabled={saving || Boolean(needsPhone && !phone)} className="notification-primary">{saving ? 'Saving…' : hasSaved ? 'Save changes' : 'Save preferences'}{!hasSaved ? <span>→</span> : null}</button></div>{!hasSaved ? <p>You can also save with every channel turned off.</p> : null}
    </form> : null}
    {hasSaved ? <div className="notification-edit-policies"><PolicyLinks /></div> : null}
  </div>
    {contactPopup ? createPortal(<NotificationDialog label={contactPopup === 'phone' ? 'Verify phone number' : 'Change email'} onClose={() => setContactPopup(null)} closeOnBackdropClick>
      {contactPopup === 'phone' ? <div className="notification-card notification-compact notification-phone-card"><div className="notification-body"><PhoneSettingsForm compact initialState={{ ...initialPhone, verifiedPhone: phone, pendingPhone }} onVerified={verified} onPendingPhone={setPendingPhone} /></div><footer className="notification-footer"><button type="button" className="notification-link" onClick={() => setContactPopup(null)}>← Back to settings</button></footer></div>
        : <EmailSettingsForm accountEmail={email} notificationEmail={notificationEmail} onSaved={setNotificationEmail} onClose={() => setContactPopup(null)} backLabel={stayOnChoicesAfterSave ? 'Back to settings' : 'Back to choices'} />}
    </NotificationDialog>, document.body) : null}
  </>;
}

function NotificationSummary({ choices }: { choices: NotificationChoices }) {
  return <div className="notification-summary">{notificationChannels.map(({ name, label }) => <div key={name}><span>{label}</span><strong className={choices[name] ? 'is-on' : ''}>{choices[name] ? 'On' : 'Off'}</strong></div>)}</div>;
}
