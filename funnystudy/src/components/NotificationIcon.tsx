import { BellIcon, EnvelopeIcon, ChatBubbleLeftEllipsisIcon, PhoneIcon, LockClosedIcon, CheckIcon } from '@heroicons/react/24/outline';
export function NotificationIcon({ name }: { name: 'bell' | 'email' | 'sms' | 'call' | 'lock' | 'check' }) {
  const Icon = { bell: BellIcon, email: EnvelopeIcon, sms: ChatBubbleLeftEllipsisIcon, call: PhoneIcon, lock: LockClosedIcon, check: CheckIcon }[name];
  return <Icon aria-hidden="true" className="notification-icon" />;
}
