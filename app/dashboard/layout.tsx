import Sidebar from '@/components/dashboard/Sidebar';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-y-auto">
        <div className="min-h-full p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
