import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex min-w-0 items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="transition-colors duration-150 ease-out hover:text-ink"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'line-clamp-1 text-ink' : undefined} aria-current={isLast ? 'page' : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
