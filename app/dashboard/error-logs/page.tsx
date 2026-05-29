import { getErrorLogs } from '@/lib/services/errorLogs';
import { PageHeader } from '@/components/shared/PageHeader';
import { ErrorLogsTable } from '@/components/dashboard/ErrorLogsTable';
import type { Metadata } from 'next';
import { ShieldAlert } from 'lucide-react';

export const metadata: Metadata = { title: 'Error Logs' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ErrorLogsPage() {
  const logs = await getErrorLogs();

  return (
    <div>
      <PageHeader
        title="Error Logs"
        description="Workflow errors that occurred during the AI receptionist booking process."
      >
        {logs.length > 0 && (
          <div className="flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">
              {logs.length} error{logs.length !== 1 ? 's' : ''} recorded
            </span>
          </div>
        )}
      </PageHeader>
      <ErrorLogsTable data={logs} />
    </div>
  );
}
