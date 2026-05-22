import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable';
import type { Appointment } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Appointments' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getAppointments(): Promise<Appointment[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('start_time', { ascending: false });

  if (error) {
    console.error('[Appointments Page] Supabase error:', error);
    return [];
  }

  return (data ?? []) as Appointment[];
}

export default async function AppointmentsPage() {
  const appointments = await getAppointments();

  return (
    <div>
      <PageHeader
        title="Appointments"
        description={`${appointments.length} total appointment(s) across all statuses.`}
      />
      <AppointmentsTable data={appointments} />
    </div>
  );
}
