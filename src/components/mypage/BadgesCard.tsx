import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';
import type { BadgeItem } from './types';

interface BadgesCardProps {
  badges: BadgeItem[];
}

export function BadgesCard({ badges }: BadgesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          성취 배지
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center gap-1 sm:gap-2 rounded-lg border p-2 sm:p-3 text-center transition-all hover:scale-105 ${
                badge.earned
                  ? 'border-accent/50 bg-accent/5'
                  : 'border-border bg-muted/30 opacity-50'
              }`}
            >
              <span className="text-lg sm:text-2xl">{badge.icon}</span>
              <span className="text-[10px] sm:text-xs font-medium">
                {badge.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
