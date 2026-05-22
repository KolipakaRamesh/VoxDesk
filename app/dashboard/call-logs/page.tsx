import { createServiceClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { CallLogsTable } from '@/components/dashboard/CallLogsTable';
import type { CallLog } from '@/lib/types';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Call Logs' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCallLogs(): Promise<CallLog[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('call_logs')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) {
    console.error('[Call Logs Page] Supabase error:', error);
    return [];
  }

  return (data ?? []) as CallLog[];
}

export default async function CallLogsPage() {
  const logs = await getCallLogs();

  return (
    <div>
      <PageHeader
        title="Call Logs"
        description={`${logs.length} total call(s) recorded by the AI receptionist.`}
      />
      <CallLogsTable data={logs} />
    </div>
  );
}
