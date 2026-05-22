'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Phone,
  CalendarDays,
  AlertCircle,
  LayoutDashboard,
  Mic2,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Appointments',
    href: '/dashboard/appointments',
    icon: CalendarDays,
  },
  {
    label: 'Call Logs',
    href: '/dashboard/call-logs',
    icon: Phone,
  },
  {
    label: 'Failed Bookings',
    href: '/dashboard/failed-bookings',
    icon: AlertCircle,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card/60 backdrop-blur-lg">
      {/* ── Logo ─────────────────────────────────────── */}
      <div className="flex h-16 items-center gap-3 border-b border-border/60 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30">
          <Mic2 className="h-5 w-5 text-primary animate-pulse-glow" />
        </div>
        <div>
          <p className="text-sm font-bold gradient-text">VoxDesk</p>
          <p className="text-[10px] text-muted-foreground">AI Receptionist</p>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3 pt-4">
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
          Operations
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-item', active && 'active')}
            >
              <Icon className={cn('h-4 w-4', active ? 'text-primary' : '')} />
              {item.label}
              {item.label === 'Failed Bookings' && (
                <FailedBadge />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────── */}
      <div className="border-t border-border/60 p-3">
        <Link href="#" className="nav-item">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <p className="mt-3 px-3 text-[10px] text-muted-foreground/40">
          VoxDesk MVP v0.1.0
        </p>
      </div>
    </aside>
  );
}

/** Small animated badge — fetches count client-side (placeholder) */
function FailedBadge() {
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive/20 px-1.5 text-[10px] font-semibold text-destructive">
      !
    </span>
  );
}
