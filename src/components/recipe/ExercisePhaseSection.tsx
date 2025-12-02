"use client"

import { Badge } from "@/components/ui/badge"
import { ReactNode } from "react"

export interface ExercisePhaseSectionProps {
  title: string
  color: 'green' | 'primary' | 'blue'
  count: number
  children: ReactNode
  gridClassName?: string
}

export function ExercisePhaseSection({ title, color, count, children, gridClassName }: ExercisePhaseSectionProps) {
  const colorClass = color === 'green' ? 'bg-green-500' : color === 'blue' ? 'bg-blue-500' : 'bg-primary'
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`h-10 w-1 ${colorClass} rounded-full`} />
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        <Badge variant="secondary">{count}개</Badge>
      </div>
      <div className={gridClassName || 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'}>
        {children}
      </div>
    </section>
  )
}
