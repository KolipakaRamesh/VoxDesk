'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  AlertCircle,
  LayoutDashboard,
  Mic2,
  Settings,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Overview',        href: '/dashboard',               icon: LayoutDashboard, exact: true },
  { label: 'Appointments',    href: '/dashboard/appointments',  icon: CalendarDays },
  { label: 'Failed Bookings', href: '/dashboard/failed-bookings', icon: AlertCircle },
  { label: 'Error Logs',      href: '/dashboard/error-logs',   icon: ShieldAlert, alert: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.06] bg-[hsl(224,71%,5%)] backdrop-blur-xl">

      {/* ── Logo ───────────────────────────────────────────── */}
      <div className="relative flex h-16 items-center gap-3 overflow-hidden border-b border-white/[0.06] px-5">
        {/* Glow behind logo */}
        <div className="absolute -left-4 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/40 shadow-lg shadow-primary/20">
          <Mic2 className="h-4.5 w-4.5 text-primary" strokeWidth={2.5} />
        </div>
        <div className="relative">
          <p className="text-sm font-extrabold tracking-tight gradient-text">VoxDesk</p>
          <p className="text-[10px] font-medium text-muted-foreground/70 tracking-widest uppercase">
            AI Receptionist
          </p>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────────────── */}
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 pt-5">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/40">
          Operations
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary/15 text-foreground border border-primary/25 shadow-inner shadow-primary/5'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              )}
            >
              {/* Active left bar */}
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary shadow-sm shadow-primary/50" />
              )}

              <Icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground/70 group-hover:text-foreground'
                )}
              />

              <span className="flex-1">{item.label}</span>

              {item.alert && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500/20 px-1.5 text-[10px] font-bold text-rose-400 ring-1 ring-rose-500/20">
                  !
                </span>
              )}

              {!item.alert && (
                <ChevronRight
                  className={cn(
                    'h-3.5 w-3.5 transition-all duration-150',
                    active
                      ? 'text-primary/60 opacity-100'
                      : 'opacity-0 -translate-x-1 group-hover:opacity-40 group-hover:translate-x-0'
                  )}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="border-t border-white/[0.06] p-3">
        <Link
          href="#"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-150"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="mt-3 px-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[10px] text-muted-foreground/40 font-medium">VoxDesk MVP v0.1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
