import { Activity, Award, Dumbbell, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FC } from "react";

interface RecipePreviewProps {
  onGetStarted: () => void;
}

export const RecipePreview: FC<RecipePreviewProps> = ({ onGetStarted }) => {
  return (
    <section id="recipe" className="fade-in-section is-visible bg-white pt-12 pb-20 scroll-mt-[var(--header-offset)]">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-16 pt-8 text-center">
          <h2 className="mb-4 text-balance text-4xl font-bold tracking-tight text-gray-900 lg:text-5xl">맞춤형 운동 레시피</h2>
          <p className="text-pretty text-lg text-gray-600">AI가 분석한 결과를 바탕으로 이렇게 추천해드립니다</p>
        </div>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 p-8">
              <img src="/exercise-.jpg" alt="AI 기반 운동 추천 시스템" loading="lazy" className="h-auto w-full rounded-2xl shadow-lg" />
            </div>
            <div className="absolute -right-4 -top-4 rounded-2xl bg-white p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <Sparkles className="h-6 w-6 text-[#0074B7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">AI 분석 완료</p>
                  <p className="text-xs text-gray-600">맞춤 레시피 준비됨</p>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#0074B7]">
                <Award className="h-4 w-4" />
                스마트 추천 시스템
              </div>
              <h3 className="mb-4 text-3xl font-bold text-gray-900">당신의 체력에 딱 맞는<br />운동 프로그램을 추천합니다</h3>
              <p className="mb-6 text-lg leading-relaxed text-gray-600">
                체력 측정 결과를 AI가 분석하여 준비운동, 본운동, 정리운동으로 구성된 맞춤형 운동 레시피를 제공합니다. 각 운동마다 전문가 영상 가이드가 포함되어 있어 처음 운동하시는 분도 쉽게 따라할 수 있습니다.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-gray-900">준비운동</h4>
                  <p className="text-sm text-gray-600">부상 예방을 위한 워밍업 동작들로 시작합니다</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <Dumbbell className="h-6 w-6 text-[#0074B7]" />
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-gray-900">본운동</h4>
                  <p className="text-sm text-gray-600">체력 수준에 맞는 강도로 구성된 핵심 운동</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-gray-900">정리운동</h4>
                  <p className="text-sm text-gray-600">근육 회복을 돕는 쿨다운 스트레칭</p>
                </div>
              </div>
            </div>
            <Button size="lg" className="bg-[#0074B7] hover:bg-[#005a91]" onClick={onGetStarted}>
              무료로 체력 측정하고 추천받기
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
