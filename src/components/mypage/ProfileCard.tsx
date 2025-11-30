import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MyPageData } from './types';

interface ProfileCardProps {
  profile: MyPageData['profile'];
  ranking: MyPageData['ranking'];
  streak: MyPageData['streak'];
  displayName: string;
}

export function ProfileCard({
  profile,
  ranking,
  streak,
  displayName,
}: ProfileCardProps) {
  return (
    <Card className="border-primary/20">
      <CardContent className="p-4 sm:p-6">
        <div className="mb-3 sm:mb-4 flex items-start justify-between">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-primary/10 text-xl sm:text-2xl font-bold text-primary">
            {displayName?.[0] ?? '유'}
          </div>
        </div>
        <h3 className="mb-1 text-lg sm:text-xl font-bold text-foreground">
          {displayName}
        </h3>
        <p className="mb-3 sm:mb-4 text-sm text-muted-foreground">
          {displayName}님, 환영합니다!
        </p>

        <div className="space-y-2 sm:space-y-3 rounded-lg bg-muted/50 p-3 sm:p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">체력 등급</span>
            <Badge className="bg-primary text-primary-foreground">
              {profile.fitnessGrade || '-'}
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">전체 순위</span>
            <span className="font-semibold text-foreground">
              상위 {ranking.topPercent || 0}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">연속 출석</span>
            <span className="font-semibold text-accent">
              {streak.currentStreak || 0}일
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
