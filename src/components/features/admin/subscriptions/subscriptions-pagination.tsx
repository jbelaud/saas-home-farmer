'use client'

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import {Button} from '@/components/ui/button'

interface SubscriptionsPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function SubscriptionsPagination({
  currentPage,
  totalPages,
  onPageChange,
}: SubscriptionsPaginationProps) {
  const canPreviousPage = currentPage > 1
  const canNextPage = currentPage < totalPages

  const getVisiblePages = () => {
    const delta = 2
    const start = Math.max(1, currentPage - delta)
    const end = Math.min(totalPages, currentPage + delta)

    return Array.from({length: end - start + 1}, (_, i) => start + i)
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="text-muted-foreground flex-1 text-sm">
        Page {currentPage} sur {totalPages}
      </div>

      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(1)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Aller à la première page</span>
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Aller à la page précédente</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center space-x-1">
            {getVisiblePages().map((pageNumber) => (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? 'default' : 'outline'}
                className="h-8 w-8 p-0"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">Aller à la page suivante</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNextPage}
          >
            <span className="sr-only">Aller à la dernière page</span>
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
