export interface ApiRecipe {
  id: number
  recipe_title: string
  recipe_intro: string
  difficulty?: string
  duration_min?: number
  card_count?: number
  slug?: string
  category_name?: string
  // optional variants sometimes returned
  durationMin?: number
  duration?: number
  exerciseCount?: number
  categoryName?: string
}
