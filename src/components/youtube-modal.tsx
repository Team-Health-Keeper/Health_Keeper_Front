"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useRef, useState, useCallback } from "react"

interface Exercise {
  name: string
  videoId: string
  duration?: string
}

interface YouTubeModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  videoId: string
  playlist?: Exercise[]
  currentIndex?: number
  onNavigate?: (index: number) => void
}

export function YouTubeModal({
  isOpen,
  onClose,
  title,
  videoId,
  playlist = [],
  currentIndex = 0,
  onNavigate,
}: YouTubeModalProps) {
  // 모달 전체 스케일(1.0=최대). 비율은 그대로, 전체 크기만 조절
  const MODAL_SCALE = 0.9
  const contentRef = useRef<HTMLDivElement>(null)
  const headerWrapRef = useRef<HTMLDivElement>(null)
  const [contentWidth, setContentWidth] = useState<number | undefined>(undefined)

  const recalc = useCallback(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    const margin = 0.04 // 4% 여유
    const maxW = Math.min(1400, vw * (1 - margin))
    const maxH = vh * (1 - margin)
    const headerH = headerWrapRef.current?.offsetHeight || 0
    const availH = Math.max(0, maxH - headerH)
    const widthByHeight = availH * (16 / 9)
    const width = Math.min(maxW, widthByHeight) * MODAL_SCALE
    setContentWidth(width)
  }, [])

  useEffect(() => {
    recalc()
    const onResize = () => recalc()
    window.addEventListener('resize', onResize)
    // 첫 렌더 후 헤더 높이 확정 시 재계산
    const raf = requestAnimationFrame(() => recalc())
    let ro: ResizeObserver | undefined
    if (typeof ResizeObserver !== 'undefined' && headerWrapRef.current) {
      ro = new ResizeObserver(() => recalc())
      ro.observe(headerWrapRef.current)
    }
    return () => {
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(raf)
      if (ro) ro.disconnect()
    }
  }, [recalc, isOpen])
  const handlePrevious = () => {
    if (onNavigate && currentIndex > 0) {
      onNavigate(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (onNavigate && playlist && currentIndex < playlist.length - 1) {
      onNavigate(currentIndex + 1)
    }
  }

  const hasPrevious = playlist.length > 0 && currentIndex > 0
  const hasNext = playlist.length > 0 && currentIndex < playlist.length - 1

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        ref={contentRef}
        className="!max-w-none p-0 overflow-hidden [&_[data-slot='dialog-close']]:hidden"
        style={{ width: contentWidth ?? "min(90vw, calc(90vh * (16/9)))", maxWidth: 1200 }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-white/95 p-3 shadow-xl ring-1 ring-black/10 transition-all duration-200 hover:scale-110 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          aria-label="닫기"
        >
          <X className="h-6 w-6 text-gray-900" />
        </button>
        {/* Close button removed per request */}

        {title && (
          <div ref={headerWrapRef}>
            <DialogHeader className="pt-6 pl-6 pr-6 bg-background z-10">
              <DialogTitle>{title}</DialogTitle>
              {playlist.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  {currentIndex + 1} / {playlist.length}
                </p>
              )}
            </DialogHeader>
          </div>
        )}

        <div className="relative flex items-center justify-center p-0">
          {/* 비디오 컨테이너: 16:9 비율 유지 */}
          <div className="relative aspect-video w-full">
              {/* 버튼을 비디오 컨테이너 안에서 절대 배치 → 비디오 가장자리 기준 */}
              {hasPrevious && (
                <Button
                  onClick={handlePrevious}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-40 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/95 shadow-xl ring-1 ring-black/10 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary p-0 cursor-pointer"
                  aria-label="이전 영상"
                >
                  <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
                </Button>
              )}
              {hasNext && (
                <Button
                  onClick={handleNext}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-40 h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-white/95 shadow-xl ring-1 ring-black/10 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary p-0 cursor-pointer"
                  aria-label="다음 영상"
                >
                  <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-900" />
                </Button>
              )}

              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={title || "운동 가이드 영상"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-b-lg"
              />
            </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { YouTubeModal as YoutubeModal }
