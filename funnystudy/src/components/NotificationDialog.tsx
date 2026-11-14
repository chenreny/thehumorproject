'use client';
import { useEffect, useRef, type ReactNode } from 'react';
export function NotificationDialog({ children, onClose, label }: { children: ReactNode; onClose: () => void; label: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="notification-dialog" aria-label={label} onCancel={(event) => { event.preventDefault(); onClose(); }}>
    {children}
  </dialog>;
}
