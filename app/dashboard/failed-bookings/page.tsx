import { getFailedAppointments } from '@/lib/services/appointments';
import { PageHeader } from '@/components/shared/PageHeader';
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable';
import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';

export const metadata: Metadata = { title: 'Failed Bookings' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function FailedBookingsPage() {
  const failed = await getFailedAppointments();

  return (
    <div>
      <PageHeader
        title="Failed Bookings"
        description="Appointments with status 'failed' or 'cancelled'."
      >
        {failed.length > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            <span className="text-xs font-medium text-rose-400">
              {failed.length} failed booking{failed.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </PageHeader>

      {failed.length === 0 ? (
        <div className="glass-card flex h-64 flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10">
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-sm font-medium text-foreground">No failed bookings</p>
          <p className="text-xs text-muted-foreground">
            All bookings completed successfully.
          </p>
        </div>
      ) : (
        <AppointmentsTable data={failed} />
      )}
    </div>
  );
}
