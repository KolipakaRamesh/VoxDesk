import { cn } from '@/lib/utils';
import type { BadgeVariant } from '@/lib/utils';

interface StatusBadgeProps {
  label: string;
  variant: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20',
  warning: 'bg-amber-400/10 text-amber-400 ring-amber-400/20',
  danger: 'bg-rose-400/10 text-rose-400 ring-rose-400/20',
  muted: 'bg-muted/50 text-muted-foreground ring-border',
};

const dotClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  muted: 'bg-muted-foreground',
};

export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1',
        variantClasses[variant],
        className
      )}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          dotClasses[variant],
          variant === 'success' && 'animate-pulse'
        )}
      />
      {label}
    </span>
  );
}
