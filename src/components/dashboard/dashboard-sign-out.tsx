import { signOutAction } from '@/lib/posts/actions';

export function DashboardSignOut() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm text-ink-muted transition-colors hover:text-ink"
      >
        Sign out
      </button>
    </form>
  );
}
