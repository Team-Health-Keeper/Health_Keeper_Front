import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, BookOpen, Clock, Dumbbell, TrendingUp } from 'lucide-react';
import type { Recipe } from './types';

interface RecommendedRecipesProps {
  recipes: Recipe[];
}

export function RecommendedRecipes({ recipes }: RecommendedRecipesProps) {
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
          <Award className="h-5 w-5 sm:h-6 sm:w-6" />
          내가 추천받은 운동 레시피
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          체력 분석 결과를 바탕으로 당신에게 필요한 운동입니다
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {recipes && recipes.length > 0 ? (
          <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2">
            {recipes.map((recipe) => (
              <Link key={recipe.id} to={`/recipes/${recipe.id}`}>
                <Card className="group h-full cursor-pointer overflow-hidden border-border transition-all hover:border-primary/50 hover:shadow-xl hover:-translate-y-1">
                  <CardContent className="p-4 sm:p-6">
                    <div className="mb-3 sm:mb-4 flex items-start justify-between">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                        {recipe.difficulty}
                      </Badge>
                    </div>

                    <h3 className="mb-2 sm:mb-3 text-base sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {recipe.recipeTitle}
                    </h3>

                    <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {recipe.recipeIntro}
                    </p>

                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{recipe.durationMin}분</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>{recipe.exerciseCount}개 운동</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                      <span className="font-medium text-foreground">
                        {recipe.fitnessGrade}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <p className="text-sm sm:text-base">아직 추천 레시피가 없습니다.</p>
            <p className="text-xs sm:text-sm mt-1">
              체력 측정을 완료하면 맞춤 레시피를 받을 수 있어요!
            </p>
          </div>
        )}

        <Button className="mt-4 sm:mt-6 w-full" size="lg" asChild>
          <Link to="/recipes">
            <BookOpen className="mr-2 h-5 w-5" />더 많은 레시피 보기
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
