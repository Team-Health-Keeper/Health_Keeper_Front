"use client"

import { Button } from "@/components/ui/button"

interface RecipePaginationProps {
  page: number
  totalPages: number
  hasNextPage: boolean
  loading: boolean
  onPrev: () => void
  onNext: () => void
  show: boolean
}

export function RecipePagination({ page, totalPages, hasNextPage, loading, onPrev, onNext, show }: RecipePaginationProps) {
  if (!show) return null
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <Button variant="outline" disabled={page <= 1 || loading} onClick={onPrev}>이전</Button>
      <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
      <Button variant="outline" disabled={!hasNextPage || loading} onClick={onNext}>다음</Button>
    </div>
  )
}
