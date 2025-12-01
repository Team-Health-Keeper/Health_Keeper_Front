"use client"

export interface AnalyzeOverlayProps {
  progress: number
  stages: string[]
  displayedStageIndex: number
  isStageFading: boolean
  transitionDir: 'down' | 'up'
}

export function AnalyzeOverlay({ progress, stages, displayedStageIndex, isStageFading, transitionDir }: AnalyzeOverlayProps) {
  const ellipsisCount = Math.min(3, Math.max(0, Math.round((progress % 12) / 4)))
  const showWipe = progress >= 75
  return (
    <div className="min-h-screen bg-background">
      <div className="relative flex h-screen w-screen flex-col items-center justify-center px-6" role="status" aria-live="polite">
        <div className="absolute inset-0 animate-bg-breathe" aria-hidden="true" />
        <div className="mb-12 relative h-32 w-32 sm:h-40 sm:w-40 md:h-48 md:w-48">
          <img src="/logo-icon.png" alt="Health Keeper" className="h-full w-full" />
          <span className="pointer-events-none absolute inset-0 rounded-full border-8 border-primary/20 border-t-primary/60 animate-spin" />
        </div>
        <div className="relative mb-10 w-full max-w-xl h-36 sm:h-40 md:h-44 flex flex-col items-center justify-center gap-4">
          {showWipe && <span className="wipe-shine" aria-hidden="true" />}
          {(() => {
            const count = displayedStageIndex === 2 ? 2 : displayedStageIndex === 1 ? 1 : 0
            if (count <= 0) return null
            return (
              <div className="flex flex-col items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: count }).map((_, i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                ))}
              </div>
            )
          })()}
          {displayedStageIndex !== 0 && isStageFading && transitionDir === 'up' && (
            <span className="h-8 sm:h-10 w-px bg-muted-foreground/30 animate-grow-up" aria-hidden="true" />
          )}
          <div
            className={
              "flex items-center gap-4 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] " +
              (isStageFading
                ? (transitionDir === 'down' ? 'origin-bottom ' : 'origin-top ') + 'opacity-0 scale-0'
                : (transitionDir === 'down' ? 'origin-top ' : 'origin-bottom ') + 'opacity-100 scale-100 animate-stage-in')
            }
          >
            <div className={(displayedStageIndex === 1 ? 'text-lg sm:text-2xl md:text-3xl sm:whitespace-nowrap ' : 'text-xl sm:text-2xl md:text-3xl ') + 'font-bold text-foreground'}>
              {stages[displayedStageIndex]}
              <span aria-hidden="true" className="inline-block w-[3ch]">{'.'.repeat(ellipsisCount)}</span>
            </div>
          </div>
          {displayedStageIndex !== 2 && isStageFading && transitionDir === 'down' && (
            <span className="h-8 sm:h-10 w-px bg-muted-foreground/30 animate-grow-down" aria-hidden="true" />
          )}
          {(() => {
            const count = displayedStageIndex === 0 ? 2 : displayedStageIndex === 1 ? 1 : 0
            if (count <= 0) return null
            return (
              <div className="flex flex-col items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: count }).map((_, i) => (
                  <span key={i} className="h-2 w-2 rounded-full bg-muted-foreground/40" />
                ))}
              </div>
            )
          })()}
        </div>
        <div className="mb-4 text-4xl font-extrabold text-foreground tabular-nums">{progress}%</div>
        <div className="h-3 w-full max-w-xl rounded bg-muted overflow-hidden">
          <div className="h-full bg-primary transition-[width] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)]" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  )
}
