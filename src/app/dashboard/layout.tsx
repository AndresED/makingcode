import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { getAdminSession } from '@/lib/auth/session';
import { countUnreadNewsletterSubscribers } from '@/lib/newsletter/repository';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/login');
  }

  const unreadNewsletterCount = await countUnreadNewsletterSubscribers();

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10">
      <DashboardSidebar unreadNewsletterCount={unreadNewsletterCount} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
