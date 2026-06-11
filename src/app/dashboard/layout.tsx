import { redirect } from 'next/navigation';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';
import { getAdminSession } from '@/lib/auth/session';
import { countUnreadNewsletterSubscribers } from '@/lib/newsletter/repository';
import { signOutAction } from '@/lib/posts/actions';

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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
        <DashboardNav unreadNewsletterCount={unreadNewsletterCount} />
        <form action={signOutAction}>
          <button type="submit" className="text-sm text-ink-muted hover:text-ink">
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
