import { getAppointments } from '@/lib/services/appointments';
import { PageHeader } from '@/components/shared/PageHeader';
import { AppointmentsTable } from '@/components/dashboard/AppointmentsTable';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Appointments' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
