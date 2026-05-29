import { createServiceClient } from '@/lib/supabase/server';
import type { DashboardStats } from '@/lib/types';

/**
 * Fetches summary stats for the dashboard overview.
 * Runs all queries in parallel for performance.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createServiceClient();

  const [
    { count: totalAppointments },
    { count: confirmedAppointments },
    { count: failedAppointments },
    { count: totalErrors },
  ] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true }),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed'),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .in('status', ['failed', 'cancelled']),
    supabase
      .from('error_logs')
      .select('*', { count: 'exact', head: true }),
  ]);

  return {
    total_appointments: totalAppointments ?? 0,
    confirmed_appointments: confirmedAppointments ?? 0,
    failed_appointments: failedAppointments ?? 0,
    total_errors: totalErrors ?? 0,
  };
}
