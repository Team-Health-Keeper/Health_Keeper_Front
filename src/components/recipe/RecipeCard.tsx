"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Activity, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import { ApiRecipe } from "./types"

interface RecipeCardProps {
  recipe: ApiRecipe
  basePath?: string // default '/recipes'
}

export function RecipeCard({ recipe, basePath = '/recipes' }: RecipeCardProps) {
  const linkTo = `${basePath}/${recipe.id}`
  const duration = recipe.duration_min ?? recipe.durationMin ?? recipe.duration
  const exerciseCount = recipe.card_count ?? recipe.exerciseCount
  const categoryName = recipe.category_name ?? recipe.categoryName ?? ''
  return (
    <Link to={linkTo}>
      <Card className="group h-full cursor-pointer overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <Badge className="bg-primary/10 text-primary border-primary/20">{categoryName || '운동'}</Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground" />
          </div>
          <h3 className="mb-3 text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">{recipe.recipe_title}</h3>
          <p className="mb-4 text-sm text-muted-foreground line-clamp-2">{recipe.recipe_intro}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            {duration !== undefined && (
              <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>{duration}분</span></div>
            )}
            {exerciseCount !== undefined && (
              <div className="flex items-center gap-1"><Activity className="h-4 w-4" /><span>{exerciseCount}개 운동</span></div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{recipe.difficulty}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
