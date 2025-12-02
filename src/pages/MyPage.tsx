'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import {
  ProfileCard,
  BadgesCard,
  StatsOverviewCard,
  GrassCalendar,
  RecommendedRecipes,
  BADGE_LIST,
} from '@/components/mypage';
import type { MyPageData } from '@/components/mypage';

// API 기본 URL
import { getApiBase, apiFetch } from "@/lib/utils"
const API_BASE_URL = getApiBase();

export default function MyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myPageData, setMyPageData] = useState<MyPageData | null>(null);

  // 세션 스토리지에서 유저 정보 가져오기
  const getUserFromSession = () => {
    try {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch {
      // ignore
    }
    return null;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchMyPageData();
  }, []);

  // API 호출
  const fetchMyPageData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = sessionStorage.getItem('authToken');
      if (!token) {
        setError('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      let result: any
      try {
        result = await apiFetch<any>(`/api/mypage`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (e: any) {
        throw new Error(e?.body?.message || e.message || '데이터를 불러오는데 실패했습니다.')
      }
      if (result?.success) {
        setMyPageData(result.data)
      } else {
        throw new Error(result?.message || '데이터를 불러오는데 실패했습니다.')
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 배지 earned 여부 계산
  const badges = useMemo(() => {
    const earnedIds = myPageData?.badgeInfo
      ? myPageData.badgeInfo.split(',').filter((id) => id.trim() !== '')
      : [];
    return BADGE_LIST.map((badge) => ({
      ...badge,
      earned: earnedIds.includes(badge.id),
    }));
  }, [myPageData?.badgeInfo]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">로딩 중...</span>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchMyPageData}>다시 시도</Button>
        </div>
      </div>
    );
  }

  // 세션에서 유저 이름 가져오기 (API 데이터 우선, 없으면 세션)
  const sessionUser = getUserFromSession();
  const displayName = myPageData?.profile.name || sessionUser?.name || '사용자';

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SiteHeader />

      <div className="container mx-auto max-w-7xl px-3 sm:px-4 py-6 sm:py-12 overflow-hidden">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <Badge className="mb-3 sm:mb-4 bg-primary/10 text-primary">
            마이페이지
          </Badge>
          <h1 className="mb-3 sm:mb-4 text-balance text-2xl sm:text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
            나의 체력 관리
          </h1>
          <p className="text-pretty text-base sm:text-lg text-muted-foreground">
            운동 기록과 성과를 확인하세요
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Left Column - Profile & Stats */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile Card */}
            <ProfileCard
              profile={
                myPageData?.profile ?? {
                  userId: 0,
                  name: '',
                  email: '',
                  fitnessGrade: null,
                  fitnessScore: null,
                }
              }
              ranking={
                myPageData?.ranking ?? {
                  totalUsers: 0,
                  userRank: 0,
                  topPercent: 0,
                }
              }
              streak={myPageData?.streak ?? { currentStreak: 0 }}
              displayName={displayName}
            />

            {/* Badges Card */}
            <BadgesCard badges={badges} />

            {/* Stats Overview */}
            <StatsOverviewCard
              grass={myPageData?.grass ?? []}
              weeklyVideoWatch={myPageData?.weeklyVideoWatch ?? 0}
              measurementHistory={myPageData?.measurementHistory ?? []}
            />
          </div>

          {/* Right Column - Activity */}
          <div className="space-y-6 lg:col-span-2 min-w-0">
            {/* Grass Calendar */}
            <GrassCalendar grass={myPageData?.grass ?? []} />

            {/* Recommended Recipes */}
            <RecommendedRecipes recipes={myPageData?.recipes ?? []} />
          </div>
        </div>
      </div>
    </div>
  );
}
