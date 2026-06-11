import Link from 'next/link';

interface PaginationProps {
  basePath: string;
  page: number;
  totalPages: number;
}

export function Pagination({ basePath, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav className="mt-10 flex items-center justify-between text-sm" aria-label="Pagination">
      {prev ? (
        <Link
          href={prev === 1 ? basePath : `${basePath}?page=${prev}`}
          className="text-meta-500 hover:text-ink"
        >
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-ink-muted">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Link href={`${basePath}?page=${next}`} className="text-meta-500 hover:text-ink">
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
