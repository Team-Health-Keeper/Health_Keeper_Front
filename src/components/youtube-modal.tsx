"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
      <DialogContent className="!max-w-none w-[90vw] max-w-[1400px] max-h-[90vh] p-0 gap-0 overflow-hidden grid grid-rows-[auto_1fr]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-white/95 p-3 shadow-xl ring-1 ring-black/10 transition-all duration-200 hover:scale-110 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          aria-label="닫기"
        >
          <X className="h-6 w-6 text-gray-900" />
        </button>

        {title && (
          <DialogHeader className="pt-6 pl-6 pr-6 bg-background z-10">
            <DialogTitle>{title}</DialogTitle>
            {playlist.length > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentIndex + 1} / {playlist.length}
              </p>
            )}
          </DialogHeader>
        )}

        <div className="relative overflow-hidden flex items-center justify-center px-16 py-6">
          {hasPrevious && (
            <Button
              onClick={handlePrevious}
              className="absolute left-[5%] top-1/2 -translate-y-1/2 z-40 h-14 w-14 rounded-full bg-white/95 shadow-xl ring-1 ring-black/10 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary p-0 cursor-pointer"
              aria-label="이전 영상"
            >
              <ChevronLeft className="h-7 w-7 text-gray-900" />
            </Button>
          )}

          {hasNext && (
            <Button
              onClick={handleNext}
              className="absolute right-[5%] top-1/2 -translate-y-1/2 z-40 h-14 w-14 rounded-full bg-white/95 shadow-xl ring-1 ring-black/10 hover:bg-white focus:outline-none focus:ring-2 focus:ring-primary p-0 cursor-pointer"
              aria-label="다음 영상"
            >
              <ChevronRight className="h-7 w-7 text-gray-900" />
            </Button>
          )}

          <div className="aspect-video w-full max-h-full relative">
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
