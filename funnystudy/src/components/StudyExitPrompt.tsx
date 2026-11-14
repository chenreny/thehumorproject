import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// Setup exits and study exits both return directly to the study list.
export function StudyExitPrompt(_props: { userId: string; studyId: number; initiallyStarted: boolean; hasPendingChoices: boolean; setupHref: string }) {
  void _props; // Keep the existing study navigation call signature.
  return <Link href="/" aria-label="Back to studies" title="Back to studies" className="flex h-14 w-14 items-center justify-center rounded-full text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-strong)]"><ArrowLeftIcon aria-hidden className="h-9 w-9" /></Link>;
}
