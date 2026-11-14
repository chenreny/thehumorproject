import type { AccountSettings } from './account-settings';
export type NotificationChannel = 'notify_new_study_email' | 'notify_new_study_sms' | 'notify_new_study_phone_call';
export type NotificationChoices = Record<NotificationChannel, boolean>;
export type NotificationDraft = { choices: NotificationChoices; stage: 'choices' | 'verify' };
export type JourneyState = { status: 'idle' | 'error' | 'saved'; message: string };
export const INITIAL_JOURNEY_STATE: JourneyState = { status: 'idle', message: '' };
export const notificationChannels = [
  { name: 'notify_new_study_email', label: 'Email' },
  { name: 'notify_new_study_sms', label: 'Text messages' },
  { name: 'notify_new_study_phone_call', label: 'Phone calls' },
] as const;
export const savedChoices = (settings: AccountSettings): NotificationChoices => ({
  notify_new_study_email: settings.notify_new_study_email === true,
  notify_new_study_sms: settings.notify_new_study_sms === true,
  notify_new_study_phone_call: settings.notify_new_study_phone_call === true,
});
export const hasSavedNotifications = (settings: AccountSettings) => notificationChannels.some(({ name }) => settings[name] !== null);
export const notificationDraftKey = (userId: string) => `funnystudy-notifications:v1:draft:${userId}`;
export const notificationHandledKey = (userId: string) => `funnystudy-notifications:v1:handled:${userId}`;
export function readNotificationDraft(value: string | null): NotificationDraft | null {
  try {
    const draft = JSON.parse(value || 'null');
    if (draft && ['choices', 'verify'].includes(draft.stage) && notificationChannels.every(({ name }) => typeof draft.choices?.[name] === 'boolean')) return draft;
  } catch { /* Ignore invalid or older drafts. */ }
  return null;
}
