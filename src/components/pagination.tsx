import Link from 'next/link';

interface PaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
  labels?: { prev: string; next: string; page: string; of: string };
}

export function Pagination({ basePath, page, totalPages, labels }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const prevLabel = labels?.prev ?? 'Previous';
  const nextLabel = labels?.next ?? 'Next';
  const pageLabel = labels?.page ?? 'Page';
  const ofLabel = labels?.of ?? 'of';

  return (
    <nav
      className="mt-12 flex items-center justify-between rounded-xl border border-white/[0.06] bg-dark-800/30 px-4 py-3 text-sm"
      aria-label="Pagination"
    >
      {prev ? (
        <Link
          href={prev === 1 ? basePath : `${basePath}?page=${prev}`}
          className="text-meta-400 transition-colors duration-150 ease-out hover:text-ink"
        >
          ← {prevLabel}
        </Link>
      ) : (
        <span />
      )}
      <span className="text-ink-muted">
        {pageLabel} {page} {ofLabel} {totalPages}
      </span>
      {next ? (
        <Link
          href={`${basePath}?page=${next}`}
          className="text-meta-400 transition-colors duration-150 ease-out hover:text-ink"
        >
          {nextLabel} →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
