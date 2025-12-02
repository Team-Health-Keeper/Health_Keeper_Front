"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock } from "lucide-react"

export interface ExerciseCommon {
  name: string
  description: string
  videoId: string
  thumbUrl?: string | null
  durationText?: string | null
  fitnessCategory?: string | null
  equipment?: string | null
  bodyPart?: string | null
  targetAge?: string | null
}

export interface ExerciseVideoCardProps {
  exercise: ExerciseCommon
  onOpen: (ex: ExerciseCommon) => void
}

export function ExerciseVideoCard({ exercise, onOpen }: ExerciseVideoCardProps) {
  return (
    <Card
      className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm group cursor-pointer border-border transition-all hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
      onClick={() => onOpen(exercise)}
    >
      <div className="relative h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        {exercise.thumbUrl && (
          <img
            alt={exercise.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            src={exercise.thumbUrl}
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3 group-hover:bg-primary group-hover:text-white transition-colors">
            <Play className="h-6 w-6" />
          </div>
        </div>
        {exercise.durationText && (
          <Badge className="absolute top-2 right-2 bg-black/60 text-white border-0">
            <Clock className="mr-1 h-3 w-3" />
            {exercise.durationText}
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h4 className="font-bold text-foreground group-hover:text-primary transition-colors mb-3 text-lg">
          {exercise.name}
        </h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {exercise.fitnessCategory && (
            <Badge variant="outline" className="text-xs">{exercise.fitnessCategory}</Badge>
          )}
          {exercise.equipment && (
            <Badge variant="outline" className="text-xs">{exercise.equipment}</Badge>
          )}
          {exercise.bodyPart && (
            <Badge variant="outline" className="text-xs">{exercise.bodyPart}</Badge>
          )}
        </div>
        {exercise.targetAge && (
          <p className="text-xs text-muted-foreground mb-2">
            <span className="font-semibold">대상:</span> {exercise.targetAge}
          </p>
        )}
        <p className="text-sm text-muted-foreground line-clamp-2">{exercise.description}</p>
      </CardContent>
    </Card>
  )
}
