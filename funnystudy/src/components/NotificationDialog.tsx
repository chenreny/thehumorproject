'use client';
import { useEffect, useRef, type ReactNode } from 'react';
export function NotificationDialog({ children, onClose, label, closeOnBackdropClick = false }: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  closeOnBackdropClick?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => { dialog?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="notification-dialog" aria-label={label} onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
    if (!closeOnBackdropClick || event.target !== event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
  }}>
    {children}
  </dialog>;
}
