import type { ReactNode } from 'react';

function SkeletonBar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`}
      aria-hidden="true"
    />
  );
}

export function LoadingStatus({ label = 'Loading…' }: { label?: string }) {
  return (
    <p className="sr-only" role="status" aria-live="polite">
      {label}
    </p>
  );
}

export function FeaturedPostSkeleton() {
  return (
    <div className="surface-card overflow-hidden">
      <div className="grid sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <SkeletonBar className="aspect-[16/10] min-h-[12rem] rounded-none sm:min-h-[18rem] sm:rounded-none" />
        <div className="space-y-4 p-6 sm:p-8">
          <SkeletonBar className="h-3 w-20" />
          <div className="flex gap-2">
            <SkeletonBar className="h-6 w-16 rounded-full" />
            <SkeletonBar className="h-6 w-24" />
          </div>
          <SkeletonBar className="h-8 w-full max-w-md" />
          <SkeletonBar className="h-8 w-4/5 max-w-sm" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="surface-card space-y-4 p-5">
      <SkeletonBar className="aspect-[16/10] w-full rounded-xl" />
      <SkeletonBar className="h-3 w-16" />
      <SkeletonBar className="h-5 w-full" />
      <SkeletonBar className="h-5 w-4/5" />
      <SkeletonBar className="h-4 w-full" />
      <SkeletonBar className="h-4 w-2/3" />
    </div>
  );
}

export function PostGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function BlogSidebarSkeleton() {
  return (
    <div className="hidden space-y-6 lg:block">
      <SkeletonBar className="h-10 w-full" />
      <div className="space-y-2">
        <SkeletonBar className="h-3 w-16" />
        {Array.from({ length: 5 }, (_, index) => (
          <SkeletonBar key={index} className="h-8 w-full" />
        ))}
      </div>
      <div className="space-y-2">
        <SkeletonBar className="h-3 w-20" />
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBar key={index} className="h-7 w-full" />
        ))}
      </div>
    </div>
  );
}

export function ListPageSkeleton({
  children,
  withSidebar = true,
}: {
  children: ReactNode;
  withSidebar?: boolean;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-14 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]">
      {withSidebar ? <BlogSidebarSkeleton /> : null}
      <div className="min-w-0 space-y-8">{children}</div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <>
      <LoadingStatus label="Loading home…" />
      <ListPageSkeleton>
        <div className="space-y-4">
          <SkeletonBar className="h-4 w-28" />
          <SkeletonBar className="h-10 w-full max-w-xl" />
          <SkeletonBar className="h-5 w-full max-w-2xl" />
        </div>
        <FeaturedPostSkeleton />
        <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-dark-800/30 p-6">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-7 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <SkeletonBar key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <SkeletonBar className="h-7 w-32" />
          <PostGridSkeleton count={3} />
        </div>
      </ListPageSkeleton>
    </>
  );
}

export function BlogPageSkeleton() {
  return (
    <>
      <LoadingStatus label="Loading blog…" />
      <ListPageSkeleton>
        <header className="space-y-4">
          <SkeletonBar className="h-9 w-40" />
          <SkeletonBar className="h-5 w-full max-w-xl" />
        </header>
        <PostGridSkeleton />
      </ListPageSkeleton>
    </>
  );
}

export function ArticlePageSkeleton() {
  return (
    <>
      <LoadingStatus label="Loading article…" />
      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,14rem)] xl:gap-16">
        <article className="min-w-0 space-y-8">
          <SkeletonBar className="h-4 w-24" />
          <div className="flex gap-2">
            <SkeletonBar className="h-6 w-20 rounded-full" />
            <SkeletonBar className="h-6 w-28" />
          </div>
          <SkeletonBar className="h-10 w-full max-w-3xl" />
          <SkeletonBar className="h-10 w-4/5 max-w-2xl" />
          <SkeletonBar className="aspect-[2/1] w-full max-w-4xl rounded-2xl" />
          <div className="space-y-3">
            {Array.from({ length: 10 }, (_, index) => (
              <SkeletonBar key={index} className={`h-4 w-full ${index % 3 === 2 ? 'w-4/5' : ''}`} />
            ))}
          </div>
        </article>
        <aside className="hidden space-y-4 xl:block">
          <SkeletonBar className="h-3 w-12" />
          {Array.from({ length: 4 }, (_, index) => (
            <SkeletonBar key={index} className="h-8 w-full" />
          ))}
        </aside>
      </div>
    </>
  );
}

export function SeriesIndexPageSkeleton() {
  return (
    <>
      <LoadingStatus label="Loading series…" />
      <ListPageSkeleton>
        <header className="space-y-4">
          <SkeletonBar className="h-3 w-16" />
          <SkeletonBar className="h-9 w-56" />
          <SkeletonBar className="h-5 w-full max-w-xl" />
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="surface-card space-y-3 p-5 sm:p-6">
              <SkeletonBar className="h-3 w-16" />
              <SkeletonBar className="h-6 w-48" />
              <SkeletonBar className="h-4 w-24" />
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBar className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      </ListPageSkeleton>
    </>
  );
}

export function SeriesPageSkeleton() {
  return (
    <>
      <LoadingStatus label="Loading series…" />
      <ListPageSkeleton>
        <header className="space-y-4">
          <SkeletonBar className="h-4 w-20" />
          <SkeletonBar className="h-3 w-16" />
          <SkeletonBar className="h-9 w-56" />
          <SkeletonBar className="h-5 w-32" />
        </header>
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="surface-card space-y-3 p-5 sm:p-6">
              <div className="flex gap-2">
                <SkeletonBar className="h-4 w-8" />
                <SkeletonBar className="h-6 w-20 rounded-full" />
                <SkeletonBar className="h-6 w-24" />
              </div>
              <SkeletonBar className="h-6 w-full max-w-lg" />
              <SkeletonBar className="h-4 w-full" />
            </div>
          ))}
        </div>
      </ListPageSkeleton>
    </>
  );
}

export function DashboardPageSkeleton() {
  return (
    <>
      <LoadingStatus label="Loading dashboard…" />
      <section className="space-y-6">
        <div className="space-y-2">
          <SkeletonBar className="h-8 w-28" />
          <SkeletonBar className="h-4 w-40" />
        </div>
        <div className="surface-card divide-y divide-white/[0.06] overflow-hidden">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <SkeletonBar className="h-5 w-full max-w-xs" />
                <SkeletonBar className="h-3 w-full max-w-sm" />
              </div>
              <SkeletonBar className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
