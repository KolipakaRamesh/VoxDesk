import { createServiceClient } from '@/lib/supabase/server';
import type { ErrorLog } from '@/lib/types';

/**
 * Fetch all error_logs ordered by created_at descending.
 */
export async function getErrorLogs(): Promise<ErrorLog[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[errorLogs service] getErrorLogs error:', error.message);
    return [];
  }
  return (data ?? []) as ErrorLog[];
}

/**
 * Fetch the N most recent error logs (for dashboard recent-activity widget).
 */
export async function getRecentErrorLogs(limit = 5): Promise<ErrorLog[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('error_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[errorLogs service] getRecentErrorLogs error:', error.message);
    return [];
  }
  return (data ?? []) as ErrorLog[];
}
