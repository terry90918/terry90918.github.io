import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath: string
  queryParams?: Record<string, string>
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  queryParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null

  const buildUrl = (page: number) => {
    const params = new URLSearchParams(queryParams)
    if (page > 1) {
      params.set('page', String(page))
    }
    const queryString = params.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }

  const pages: (number | string)[] = []
  const showEllipsisStart = currentPage > 3
  const showEllipsisEnd = currentPage < totalPages - 2

  if (showEllipsisStart) {
    pages.push(1)
    if (currentPage > 4) pages.push('...')
  }

  for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
    if (!pages.includes(i)) pages.push(i)
  }

  if (showEllipsisEnd) {
    if (currentPage < totalPages - 3) pages.push('...')
    if (!pages.includes(totalPages)) pages.push(totalPages)
  }

  return (
    <nav aria-label="分頁導航" className="flex items-center justify-center gap-2">
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="text-text-dark dark:text-text-light hover:text-primary flex items-center gap-1 px-3 py-2 transition-colors"
          aria-label="上一頁"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
          <span className="hidden sm:inline">上一頁</span>
        </Link>
      ) : (
        <span className="text-text-muted flex cursor-not-allowed items-center gap-1 px-3 py-2 opacity-50">
          <span className="material-symbols-outlined text-lg">chevron_left</span>
          <span className="hidden sm:inline">上一頁</span>
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="text-text-muted px-2">
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={buildUrl(page as number)}
              className={`min-w-[40px] rounded-lg px-3 py-2 text-center transition-colors ${
                page === currentPage
                  ? 'bg-primary text-white'
                  : 'text-text-dark dark:text-text-light hover:bg-primary/10 hover:text-primary'
              }`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          )
        )}
      </div>

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="text-text-dark dark:text-text-light hover:text-primary flex items-center gap-1 px-3 py-2 transition-colors"
          aria-label="下一頁"
        >
          <span className="hidden sm:inline">下一頁</span>
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </Link>
      ) : (
        <span className="text-text-muted flex cursor-not-allowed items-center gap-1 px-3 py-2 opacity-50">
          <span className="hidden sm:inline">下一頁</span>
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </span>
      )}
    </nav>
  )
}
