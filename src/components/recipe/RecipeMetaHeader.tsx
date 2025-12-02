"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, TrendingUp, Activity } from "lucide-react"

export interface RecipeMetaHeaderProps {
  category?: string | null
  title: string
  intro: string
  durationMin?: number | null
  difficulty: string
  totalExercises: number
}

export function RecipeMetaHeader({ category, title, intro, durationMin, difficulty, totalExercises }: RecipeMetaHeaderProps) {
  return (
    <div className="mb-10">
      {category && (
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{category}</Badge>
      )}
      <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground">{title}</h1>
      <p className="text-lg text-muted-foreground mb-6">{intro}</p>
      <div className="flex flex-wrap gap-6 text-sm">
        <MetaItem icon={Clock} label="총 소요시간" value={durationMin && durationMin > 0 ? `${durationMin}분` : "-"} />
        <MetaItem icon={TrendingUp} label="난이도" value={difficulty} />
        <MetaItem icon={Activity} label="운동 개수" value={`${totalExercises}개`} />
      </div>
    </div>
  )
}

function MetaItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5 text-primary" />
      <span className="font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  )
}
