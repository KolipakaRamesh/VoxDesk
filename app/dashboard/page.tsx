import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { CalendarDays, Phone, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { statusToBadge } from '@/lib/utils';
import type { Appointment, CallLog } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getDashboardData() {
  const supabase = createServiceClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: totalAppointments },
    { count: confirmedToday },
    { count: failedBookings },
    { count: totalCalls },
    { data: recentAppointments },
    { data: recentCalls },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed')
      .gte('start_time', today.toISOString()),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed'),
    supabase
      .from('call_logs')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('call_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  return {
    stats: {
      totalAppointments: totalAppointments ?? 0,
      confirmedToday: confirmedToday ?? 0,
      failedBookings: failedBookings ?? 0,
      totalCalls: totalCalls ?? 0,
    },
    recentAppointments: (recentAppointments ?? []) as Appointment[],
    recentCalls: (recentCalls ?? []) as CallLog[],
  };
}

const statCards = [
  {
    key: 'totalCalls',
    label: 'Total Calls',
    icon: Phone,
    color: 'text-vox-400',
    bg: 'bg-vox-500/10',
  },
  {
    key: 'totalAppointments',
    label: 'Total Appointments',
    icon: CalendarDays,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    key: 'confirmedToday',
    label: 'Confirmed Today',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'failedBookings',
    label: 'Failed Bookings',
    icon: AlertCircle,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
];

export default async function DashboardPage() {
  const { stats, recentAppointments, recentCalls } = await getDashboardData();

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

      {/* ── Stats Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="stat-card">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">
              {stats[key as keyof typeof stats]}
            </p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Recent Activity ────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Recent Appointments</h2>
          </div>
          {recentAppointments.length === 0 ? (
            <EmptyState label="No appointments yet" />
          ) : (
            <div className="space-y-3">
              {recentAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {appt.customer_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {appt.service_type} · {formatDateTime(appt.start_time)}
                    </p>
                  </div>
                  <StatusBadge
                    label={appt.status}
                    variant={statusToBadge(appt.status)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Calls */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Recent Calls</h2>
          </div>
          {recentCalls.length === 0 ? (
            <EmptyState label="No calls yet" />
          ) : (
            <div className="space-y-3">
              {recentCalls.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium font-mono text-foreground">
                      {log.from_number ?? 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {log.started_at ? formatDateTime(log.started_at) : '—'}
                      {log.duration_secs ? ` · ${log.duration_secs}s` : ''}
                    </p>
                  </div>
                  <StatusBadge
                    label={log.outcome.replace('_', ' ')}
                    variant={statusToBadge(log.outcome)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border/60">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
