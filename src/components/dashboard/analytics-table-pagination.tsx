import Link from 'next/link';

interface AnalyticsTablePaginationProps {
  basePath: string;
  searchParams: URLSearchParams;
  pageKey: string;
  page: number;
  totalPages: number;
}

export function AnalyticsTablePagination({
  basePath,
  searchParams,
  pageKey,
  page,
  totalPages,
}: AnalyticsTablePaginationProps) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  function hrefFor(targetPage: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage <= 1) params.delete(pageKey);
    else params.set(pageKey, String(targetPage));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <nav
      className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 text-sm"
      aria-label="Table pagination"
    >
      {prev ? (
        <Link href={hrefFor(prev)} className="text-meta-400 transition-colors hover:text-ink">
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-ink-muted">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Link href={hrefFor(next)} className="text-meta-400 transition-colors hover:text-ink">
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
