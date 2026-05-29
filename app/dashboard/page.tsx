import { getDashboardStats } from '@/lib/services/dashboard';
import { getRecentAppointments } from '@/lib/services/appointments';
import { getRecentErrorLogs } from '@/lib/services/errorLogs';
import { PageHeader } from '@/components/shared/PageHeader';
import {
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { formatAppointmentDateTime, formatDateTime, statusToBadge } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import Link from 'next/link';
import type { Appointment, ErrorLog } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const statCards = [
  {
    key: 'total_appointments' as const,
    label: 'Total Appointments',
    icon: CalendarDays,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    ring: 'ring-sky-500/20',
    accent: 'stat-card-sky',
    href: '/dashboard/appointments',
  },
  {
    key: 'confirmed_appointments' as const,
    label: 'Confirmed',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/20',
    accent: 'stat-card-emerald',
    href: '/dashboard/appointments',
  },
  {
    key: 'failed_appointments' as const,
    label: 'Failed / Cancelled',
    icon: AlertCircle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    ring: 'ring-rose-500/20',
    accent: 'stat-card-rose',
    href: '/dashboard/failed-bookings',
  },
  {
    key: 'total_errors' as const,
    label: 'Workflow Errors',
    icon: ShieldAlert,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/20',
    accent: 'stat-card-amber',
    href: '/dashboard/error-logs',
  },
];

/** Generate a consistent bg + text colour from a name string */
function avatarColor(name: string): { bg: string; text: string } {
  const colours = [
    { bg: 'bg-violet-500/20', text: 'text-violet-300' },
    { bg: 'bg-sky-500/20',    text: 'text-sky-300'    },
    { bg: 'bg-emerald-500/20',text: 'text-emerald-300' },
    { bg: 'bg-rose-500/20',   text: 'text-rose-300'   },
    { bg: 'bg-amber-500/20',  text: 'text-amber-300'  },
    { bg: 'bg-pink-500/20',   text: 'text-pink-300'   },
  ];
  const idx = name.charCodeAt(0) % colours.length;
  return colours[idx];
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2);
  const { bg, text } = avatarColor(name);
  return (
    <span className={`avatar-initials ${bg} ${text}`}>
      {letters.toUpperCase()}
    </span>
  );
}

export default async function DashboardPage() {
  const [stats, recentAppointments, recentErrors] = await Promise.all([
    getDashboardStats(),
    getRecentAppointments(5),
    getRecentErrorLogs(5),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Real-time overview of VoxDesk AI receptionist activity."
      >
        <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">System Online</span>
        </div>
      </PageHeader>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, color, bg, ring, accent, href }) => (
          <Link key={key} href={href} className={`stat-card ${accent} group`}>
            {/* Icon */}
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ring-1 ${ring} transition-transform duration-200 group-hover:scale-110`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            {/* Number */}
            <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
              {stats[key]}
            </p>
            {/* Label + arrow */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <ArrowRight className="h-3 w-3 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all duration-200 -translate-x-1 group-hover:translate-x-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent Activity ──────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Recent Appointments */}
        <div className="glass-card overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
                <Activity className="h-3.5 w-3.5 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Recent Appointments</h2>
            </div>
            <Link
              href="/dashboard/appointments"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Rows */}
          <div className="p-4">
            {recentAppointments.length === 0 ? (
              <EmptyState icon="📅" label="No appointments yet" />
            ) : (
              <div className="space-y-2">
                {recentAppointments.map((appt: Appointment) => (
                  <div key={appt.id} className="activity-row">
                    <div className="flex items-center gap-3 min-w-0">
                      <Initials name={appt.name} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{appt.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {formatAppointmentDateTime(appt.appointment_date, appt.appointment_time)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      label={appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                      variant={statusToBadge(appt.status)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Workflow Errors */}
        <div className="glass-card overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Recent Workflow Errors</h2>
            </div>
            <Link
              href="/dashboard/error-logs"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Rows */}
          <div className="p-4">
            {recentErrors.length === 0 ? (
              <EmptyState icon="✅" label="No errors recorded — all systems healthy" />
            ) : (
              <div className="space-y-2">
                {recentErrors.map((log: ErrorLog) => (
                  <div key={log.id} className="activity-row">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold">
                        !
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-rose-400 truncate">{log.error_type}</p>
                        <p className="text-xs text-muted-foreground truncate">{log.error_message}</p>
                      </div>
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDateTime(log.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function EmptyState({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex h-36 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/40">
      <span className="text-2xl">{icon}</span>
      <p className="text-xs text-muted-foreground text-center">{label}</p>
    </div>
  );
}
