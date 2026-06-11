import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminSession } from '@/lib/auth/session';
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
        <nav className="flex gap-4 text-sm">
          <Link href="/dashboard" className="text-ink-muted hover:text-ink">
            Posts
          </Link>
          <Link
            href="/dashboard/posts/new"
            className="text-meta-500 hover:text-ink"
          >
            New post
          </Link>
        </nav>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-sm text-ink-muted hover:text-ink"
          >
            Sign out
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
