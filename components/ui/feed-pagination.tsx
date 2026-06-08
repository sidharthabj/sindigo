import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FeedPaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
}

export function FeedPagination({ currentPage, totalPages, basePath = '/feed' }: FeedPaginationProps) {
  if (totalPages <= 1) return null

  const pages = buildPageList(currentPage, totalPages)

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 pt-6">
      <PageLink
        href={`${basePath}?page=${currentPage - 1}`}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ←
      </PageLink>

      {pages.map((entry, i) =>
        entry === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-3 py-1.5 text-muted-foreground text-sm select-none">
            …
          </span>
        ) : (
          <PageLink
            key={entry}
            href={`${basePath}?page=${entry}`}
            active={entry === currentPage}
            aria-label={`Page ${entry}`}
            aria-current={entry === currentPage ? 'page' : undefined}
          >
            {entry}
          </PageLink>
        )
      )}

      <PageLink
        href={`${basePath}?page=${currentPage + 1}`}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        →
      </PageLink>
    </nav>
  )
}

function PageLink({
  href,
  children,
  active = false,
  disabled = false,
  ...props
}: {
  href: string
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  'aria-label'?: string
  'aria-current'?: 'page' | undefined
}) {
  if (disabled) {
    return (
      <span
        className="px-3 py-1.5 text-sm text-muted-foreground/40 select-none"
        aria-hidden="true"
      >
        {children}
      </span>
    )
  }

  return (
    <Link
      href={href}
      scroll={true}
      className={cn(
        'px-3 py-1.5 text-sm rounded-md transition-colors',
        active
          ? 'bg-foreground text-background font-medium'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
      {...props}
    >
      {children}
    </Link>
  )
}

function buildPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) pages.push('ellipsis')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let p = start; p <= end; p++) pages.push(p)

  if (current < total - 2) pages.push('ellipsis')
  pages.push(total)

  return pages
}
