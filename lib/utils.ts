import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn/ui utility for merging Tailwind classes */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format ISO timestamp or date string to human-readable local date/time */
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

/**
 * Format an appointment date (YYYY-MM-DD) and time ("HH:MM") into a
 * readable string like "29 May 2026, 14:30".
 */
export function formatAppointmentDateTime(date: string, time: string): string {
  const dt = new Date(`${date}T${time}:00`);
  if (isNaN(dt.getTime())) return `${date} ${time}`;
  return dt.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
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

/** Truncate long strings for table previews */
export function truncate(text: string, maxLen = 80): string {
  if (!text) return '—';
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

/** Badge variant type */
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'muted';

/** Map appointment status / error type to badge variant */
export function statusToBadge(status: string): BadgeVariant {
  switch (status?.toLowerCase()) {
    case 'confirmed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'cancelled':
    case 'error':
      return 'danger';
    default:
      return 'muted';
  }
}

/** Map error_type to badge variant */
export function errorTypeToBadge(errorType: string): BadgeVariant {
  if (!errorType) return 'muted';
  const lower = errorType.toLowerCase();
  if (lower.includes('critical') || lower.includes('fatal')) return 'danger';
  if (lower.includes('warn') || lower.includes('timeout')) return 'warning';
  if (lower.includes('calendar') || lower.includes('booking')) return 'danger';
  return 'muted';
}
