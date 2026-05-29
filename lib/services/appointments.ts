import { createServiceClient } from '@/lib/supabase/server';
import type { Appointment } from '@/lib/types';

/**
 * Fetch all appointments ordered by date descending.
 */
export async function getAppointments(): Promise<Appointment[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: false });

  if (error) {
    console.error('[appointments service] getAppointments error:', error.message);
    return [];
  }
  return (data ?? []) as Appointment[];
}

/**
 * Fetch the N most recent appointments (for dashboard recent-activity widget).
 */
export async function getRecentAppointments(limit = 5): Promise<Appointment[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[appointments service] getRecentAppointments error:', error.message);
    return [];
  }
  return (data ?? []) as Appointment[];
}

/**
 * Fetch appointments with status 'failed' or 'cancelled'.
 */
export async function getFailedAppointments(): Promise<Appointment[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .in('status', ['failed', 'cancelled'])
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[appointments service] getFailedAppointments error:', error.message);
    return [];
  }
  return (data ?? []) as Appointment[];
}
