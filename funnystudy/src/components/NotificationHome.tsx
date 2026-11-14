'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AccountSettings } from '@/lib/account-settings';
import type { PhoneSettingsState } from '@/lib/phone-settings';
import { hasSavedNotifications, notificationDraftKey, notificationHandledKey, readNotificationDraft } from '@/lib/notification-journey';
import { markNotificationSetupHandled } from '@/app/notification-preferences/save-journey';
import { NotificationDialog } from './NotificationDialog';
import { NotificationJourney } from './NotificationJourney';
import { NotificationIcon } from './NotificationIcon';
import { PolicyLinks } from './PolicyLinks';

export function NotificationHome({ settings, phone, userId, email, handled }: {
  settings: AccountSettings; phone: PhoneSettingsState; userId: string; email?: string; handled: boolean;
}) {
  const router = useRouter();
  const [panel, setPanel] = useState<'welcome' | 'setup' | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      let seen = handled, hasDraft = false;
      try { seen ||= Boolean(localStorage.getItem(notificationHandledKey(userId))); hasDraft = Boolean(readNotificationDraft(localStorage.getItem(notificationDraftKey(userId)))); } catch {}
      if (!hasSavedNotifications(settings) && !hasDraft) {
        if (seen) setShowBanner(true); else setPanel('welcome');
      }
    }, 0);
    return () => window.clearTimeout(timer);
    // Initialize the first-visit offer once for this signed-in user.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);
  const markHandled = () => {
    try { localStorage.setItem(notificationHandledKey(userId), 'handled'); } catch {}
    void markNotificationSetupHandled().catch(() => undefined);
  };
  const skip = () => { markHandled(); setPanel(null); setShowBanner(true); };
  const begin = () => { markHandled(); setShowBanner(false); setPanel('setup'); };
  const exit = (saved = false) => {
    setPanel(null);
    let hasDraft = false;
    try { hasDraft = Boolean(readNotificationDraft(localStorage.getItem(notificationDraftKey(userId)))); } catch {}
    setShowBanner(!saved && !hasSavedNotifications(settings) && !hasDraft);
    if (saved) router.refresh();
  };
  return <>
    {showBanner && !hasSavedNotifications(settings) ? <aside className="notification-banner" aria-label="Optional notifications">
      <span className="notification-banner-icon"><NotificationIcon name="bell" /></span><div><strong>Notifications are optional.</strong><p>Everything is off for now. Set up your notifications whenever you’re ready.</p></div><button type="button" className="notification-secondary" onClick={begin}>Configure notifications <span>→</span></button>
    </aside> : null}
    {panel ? <NotificationDialog label={panel === 'welcome' ? 'Set up notifications' : 'Notification preferences'} onClose={() => panel === 'welcome' ? skip() : exit()}>
      {panel === 'welcome' ? <section className="notification-card notification-welcome"><div className="notification-body"><span className="notification-banner-icon"><NotificationIcon name="bell" /></span><h1>A heads-up for<br />your next study?</h1><p className="notification-description">Choose how you’d like to hear from us. A quick setup, and every channel is your choice.</p><div className="notification-welcome-actions"><button className="notification-primary" onClick={begin}>Set up notifications <span>→</span></button><button className="notification-secondary" onClick={skip}>Skip for now</button></div><div className="notification-intro-note"><NotificationIcon name="check" /><span>Optional, always. You can change your preferences from your account anytime.</span></div><p className="notification-policy"><PolicyLinks /></p></div></section>
        : <NotificationJourney settings={settings} initialPhone={phone} userId={userId} email={email} onExit={exit} />}
    </NotificationDialog> : null}
  </>;
}
