import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { FC } from "react";

interface HeroProps {
  onGetStarted: () => void;
  onGoRecipes: () => void;
}

export const Hero: FC<HeroProps> = ({ onGetStarted, onGoRecipes }) => {
  return (
    <section className="fade-in-section relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-20 lg:py-32">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-[#0074B7]">
              <Sparkles className="h-4 w-4" />
              AI 기반 맞춤형 체력 관리
            </div>
            <h1 className="text-balance text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-gray-900 lg:text-6xl">
              당신의 체력을<br />
              <span className="text-[#0074B7]">AI가 분석하고</span><br />
              맞춤 운동을<br />
              추천합니다
            </h1>
            <p className="text-xl leading-relaxed text-gray-600">
              국민체력100 데이터로 학습된 AI가<br />
              체력등급을 예측하고, 당신에게<br />
              최적화된 운동 레시피를 제공합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-[#0074B7] px-8 py-6 text-base hover:bg-[#005a91]" onClick={onGetStarted}>
                무료로 시작하기
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-gray-300 px-8 py-6 text-base hover:bg-gray-50 bg-transparent" asChild>
                <Link to="/recipes">
                  <BookOpen className="mr-2 h-5 w-5" />
                  맞춤 운동 레시피 보기
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-6 pt-4">
              {[
                "무료 체력 측정",
                "AI 맞춤 추천",
                "전문가 영상",
              ].map((label) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-green-500" aria-hidden />
                  <span className="text-sm text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative fade-in-section">
            <div className="relative rounded-3xl bg-gradient-to-br from-blue-100 to-blue-50 p-8 transition-transform duration-700 ease-out">
              <img src="/3d-illustration-of-person-exercising-with-fitness-.jpg" alt="체력 측정 일러스트" loading="lazy" className="h-auto w-full" />
            </div>
            <div
              className="absolute -left-4 top-1/4 rounded-2xl bg-white p-4 shadow-xl hidden sm:block cursor-pointer transition-transform hover:scale-[1.03]"
              role="button" tabIndex={0}
              aria-label="체력 등급 AI 분석 바로가기"
              onClick={onGetStarted}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onGetStarted() }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <TrendingUp className="h-6 w-6 text-[#0074B7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">체력 등급</p>
                  <p className="text-xs text-gray-600">AI 분석 완료</p>
                </div>
              </div>
            </div>
            <div
              className="absolute -right-4 bottom-1/4 rounded-2xl bg-white p-4 shadow-xl hidden sm:block cursor-pointer transition-transform hover:scale-[1.03]"
              role="button" tabIndex={0}
              aria-label="운동 레시피 보러가기"
              onClick={onGoRecipes}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onGoRecipes() }}
            >
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-3">
                  <Sparkles className="h-6 w-6 text-[#0074B7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">운동 레시피</p>
                  <p className="text-xs text-gray-600">맞춤 추천</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
