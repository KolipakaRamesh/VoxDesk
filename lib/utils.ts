import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn/ui utility for merging Tailwind classes */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format ISO timestamp to human-readable local date/time */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
}

/** Format ISO timestamp to date only */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
    timeZone: 'Asia/Kolkata',
  });
}

/** Format seconds to "Xm Ys" */
export function formatDuration(secs?: number | null): string {
  if (!secs) return '—';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/** Truncate transcript for table previews */
export function truncate(text: string, maxLen = 80): string {
  if (!text) return '—';
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

/** Map appointment status to badge variant */
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'muted';

export function statusToBadge(status: string): BadgeVariant {
  switch (status) {
    case 'confirmed':
    case 'booking_confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'booking_failed':
    case 'error':
      return 'danger';
    default:
      return 'muted';
  }
}
